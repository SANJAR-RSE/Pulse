const { z } = require('zod');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const MedicalRecord = require('../models/MedicalRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { callNext, SERVE_ORDER } = require('../services/queue.service');
const { notify } = require('../services/notification.service');
const { todayStr } = require('../utils/date');
const { emitToUser, emitQueueChanged } = require('../realtime');

const DATE = /^\d{4}-\d{2}-\d{2}$/;
function pickDate(value) {
  if (value === undefined || value === null || value === '') return todayStr();
  if (typeof value !== 'string' || !DATE.test(value)) throw new ApiError(400, 'Sana YYYY-MM-DD formatida bo\'lsin.');
  return value;
}

function requireDoctorProfile(req) {
  if (!req.user.doctor) throw new ApiError(403, 'Bu foydalanuvchi shifokor sifatida ulanmagan.');
}

const getTodayQueue = asyncHandler(async (req, res) => {
  requireDoctorProfile(req);
  const date = pickDate(req.query.date);

  const queue = await Queue.find({ doctor: req.user.doctor, date })
    .populate('patient', 'name')
    .populate('appointment')
    .sort(SERVE_ORDER);

  res.json({ queue });
});

// One button on the Doctor Panel: finish serving the current patient (if
// any) and call the next WAITING one. Both Web (patient dashboard) and
// Telegram get notified in the same request — see promt.md #16.
const callNextPatient = asyncHandler(async (req, res) => {
  requireDoctorProfile(req);
  const date = pickDate(req.body?.date);

  const result = await callNext(req.user.doctor, date);
  // Every patient in this queue moves up — push it to all of them live.
  await emitQueueChanged(req.user.doctor, date, 'called');
  res.json(result);
});

const completeSchema = z.object({
  examination: z.string().trim().min(1, 'Ko\'rik xulosasini kiriting.'),
  recommendation: z.string().trim().default(''),
  labResults: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Tahlil nomini kiriting.'),
        value: z.string().trim().min(1, 'Tahlil natijasini kiriting.'),
        unit: z.string().optional(),
        normalRange: z.string().optional(),
      })
    )
    .default([]),
});

// Turns an appointment into a real, patient-visible Medical Record — the
// clinical counterpart to callNextPatient's queue-only "next" action.
const completeAppointment = asyncHandler(async (req, res) => {
  requireDoctorProfile(req);

  const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user.doctor });
  if (!appointment) throw new ApiError(404, 'Appointment topilmadi.');

  const data = completeSchema.parse(req.body);

  if (appointment.status === 'cancelled') throw new ApiError(400, 'Bekor qilingan navbatni yakunlab bo\'lmaydi.');
  const existing = await MedicalRecord.findOne({ appointment: appointment._id });
  if (existing) throw new ApiError(400, 'Bu ko\'rik allaqachon yakunlangan.');

  let record;
  try {
    record = await MedicalRecord.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      clinic: appointment.clinic,
      department: appointment.department,
      appointment: appointment._id,
      date: appointment.date,
      ...data,
    });
  } catch (err) {
    // Unique index on MedicalRecord.appointment: a double click lost the race.
    if (err.code === 11000) throw new ApiError(400, 'Bu ko\'rik allaqachon yakunlangan.');
    throw err;
  }

  appointment.status = 'completed';
  await appointment.save();

  // The patient has been seen: their queue entry is done too.
  await Queue.updateOne({ appointment: appointment._id, status: { $ne: 'CANCELLED' } }, { status: 'COMPLETED' });

  await notify(
    appointment.patient,
    'health_summary',
    'Ko\'rik yakunlandi',
    'Sizning ko\'rikingiz yakunlandi. Natijalar Medical History bo\'limida.'
  );

  emitToUser(appointment.patient, 'records:changed', { recordId: String(record._id) });
  emitToUser(appointment.patient, 'appointments:changed', { reason: 'completed' });
  await emitQueueChanged(appointment.doctor, appointment.date, 'completed');

  res.status(201).json({ record });
});

module.exports = { getTodayQueue, callNextPatient, completeAppointment };
