const { z } = require('zod');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const MedicalRecord = require('../models/MedicalRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { callNext } = require('../services/queue.service');
const { notify } = require('../services/notification.service');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const getTodayQueue = asyncHandler(async (req, res) => {
  if (!req.user.doctor) throw new ApiError(403, 'Bu foydalanuvchi shifokor sifatida ulanmagan.');
  const date = req.query.date || todayStr();

  const queue = await Queue.find({ doctor: req.user.doctor, date })
    .populate('patient', 'name')
    .populate('appointment')
    .sort({ position: 1 });

  res.json({ queue });
});

// One button on the Doctor Panel: finish serving the current patient (if
// any) and call the next WAITING one. Both Web (patient dashboard) and
// Telegram get notified in the same request — see promt.md #16.
const callNextPatient = asyncHandler(async (req, res) => {
  if (!req.user.doctor) throw new ApiError(403, 'Bu foydalanuvchi shifokor sifatida ulanmagan.');
  const date = req.body.date || todayStr();

  const result = await callNext(req.user.doctor, date);
  res.json(result);
});

const completeSchema = z.object({
  examination: z.string().min(1),
  recommendation: z.string().default(''),
  labResults: z
    .array(z.object({ name: z.string(), value: z.string(), unit: z.string().optional(), normalRange: z.string().optional() }))
    .default([]),
});

// Turns an appointment into a real, patient-visible Medical Record — the
// clinical counterpart to callNextPatient's queue-only "next" action.
const completeAppointment = asyncHandler(async (req, res) => {
  if (!req.user.doctor) throw new ApiError(403, 'Bu foydalanuvchi shifokor sifatida ulanmagan.');

  const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user.doctor });
  if (!appointment) throw new ApiError(404, 'Appointment topilmadi.');

  const data = completeSchema.parse(req.body);

  appointment.status = 'completed';
  await appointment.save();

  const record = await MedicalRecord.create({
    patient: appointment.patient,
    doctor: appointment.doctor,
    clinic: appointment.clinic,
    department: appointment.department,
    appointment: appointment._id,
    date: appointment.date,
    ...data,
  });

  await notify(
    appointment.patient,
    'health_summary',
    'Ko\'rik yakunlandi',
    'Sizning ko\'rikingiz yakunlandi. Natijalar Medical History bo\'limida.'
  );

  res.status(201).json({ record });
});

module.exports = { getTodayQueue, callNextPatient, completeAppointment };
