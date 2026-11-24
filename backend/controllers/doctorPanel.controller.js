const { z } = require('zod');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const MedicalRecord = require('../models/MedicalRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { callNext, SERVE_ORDER } = require('../services/queue.service');
const { notify } = require('../services/notification.service');
const crypto = require('crypto');
const Doctor = require('../models/Doctor');
const Medication = require('../models/Medication');
const HealthProfile = require('../models/HealthProfile');
const { todayStr, addDays } = require('../utils/date');

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
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
  prescriptions: z
    .array(
      z.object({
        name: z.string().trim().min(2, 'Dori nomini kiriting.'),
        dosage: z.string().trim().max(60).default(''),
        times: z
          .array(z.string().regex(HHMM, 'Qabul vaqti HH:mm formatida bo\'lsin.'))
          .min(1, 'Kamida bitta qabul vaqtini kiriting.')
          .max(6, 'Kuniga 6 mahaldan ko\'p bo\'lmasin.'),
        mealRelation: z.enum(['any', 'before', 'after', 'with']).default('any'),
        durationDays: z.number().int('Kun soni butun son bo\'lsin.').min(1, 'Davomiylik kamida 1 kun.').max(365, 'Davomiylik 365 kundan oshmasin.'),
        note: z.string().trim().max(300).default(''),
      })
    )
    .max(20)
    .default([]),
  goals: z
    .object({
      waterMl: z.number().int().min(500, 'Suv me\'yori kamida 500 ml.').max(6000, 'Suv me\'yori 6000 ml dan oshmasin.').optional(),
      sleepHours: z.number().min(4, 'Uyqu me\'yori kamida 4 soat.').max(14, 'Uyqu me\'yori 14 soatdan oshmasin.').optional(),
      workoutMinutes: z.number().int().min(0).max(300, 'Workout me\'yori 300 daqiqadan oshmasin.').optional(),
      note: z.string().trim().max(300).default(''),
    })
    .optional(),
});

const MEAL_LABEL = { any: '', before: 'och qoringa (ovqatdan oldin)', after: 'to\'q qoringa (ovqatdan keyin)', with: 'ovqat bilan birga' };

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

  // Prescriptions start today (Tashkent) and run for durationDays, inclusive.
  const startDate = todayStr();
  const prescriptions = data.prescriptions.map((p) => ({
    ...p,
    times: [...new Set(p.times)].sort(),
    startDate,
    endDate: addDays(startDate, p.durationDays - 1),
  }));
  const hasGoals = data.goals && ['waterMl', 'sleepHours', 'workoutMinutes'].some((k) => data.goals[k] !== undefined);

  let record;
  try {
    record = await MedicalRecord.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      clinic: appointment.clinic,
      department: appointment.department,
      appointment: appointment._id,
      date: appointment.date,
      examination: data.examination,
      recommendation: data.recommendation,
      labResults: data.labResults,
      prescriptions,
      goals: hasGoals ? data.goals : undefined,
    });
  } catch (err) {
    // Unique index on MedicalRecord.appointment: a double click lost the race.
    if (err.code === 11000) throw new ApiError(400, 'Bu ko\'rik allaqachon yakunlangan.');
    throw err;
  }

  appointment.status = 'completed';
  await appointment.save();

  const doctor = await Doctor.findById(appointment.doctor);
  const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Shifokor';

  // Each prescribed intake time becomes the patient's daily medication with
  // reminders (Telegram + Web + mobile) for the length of the course.
  if (prescriptions.length) {
    const docs = [];
    for (const p of prescriptions) {
      const courseId = crypto.randomUUID();
      p.times.forEach((time, i) =>
        docs.push({
          user: appointment.patient,
          name: p.name,
          time,
          source: 'doctor',
          dosage: p.dosage,
          mealRelation: p.mealRelation,
          note: p.note,
          startDate: p.startDate,
          endDate: p.endDate,
          timesPerDay: p.times.length,
          intakeIndex: i + 1,
          courseId,
          prescribedBy: appointment.doctor,
          doctorName,
          record: record._id,
        })
      );
    }
    await Medication.insertMany(docs);
  }

  // Doctor's daily targets replace the patient's current goals.
  if (hasGoals) {
    const g = data.goals;
    await HealthProfile.findOneAndUpdate(
      { user: appointment.patient },
      {
        $set: {
          ...(g.waterMl !== undefined ? { waterGoalMl: g.waterMl } : {}),
          ...(g.sleepHours !== undefined ? { sleepGoalHours: g.sleepHours } : {}),
          ...(g.workoutMinutes !== undefined ? { workoutGoalMinutes: g.workoutMinutes } : {}),
          goalsSetBy: doctorName,
          goalsSetAt: new Date(),
          goalsNote: g.note || '',
        },
      },
      { upsert: true }
    );
  }

  // The patient has been seen: their queue entry is done too.
  await Queue.updateOne({ appointment: appointment._id, status: { $ne: 'CANCELLED' } }, { status: 'COMPLETED' });

  await notify(
    appointment.patient,
    'health_summary',
    'Ko\'rik yakunlandi',
    'Sizning ko\'rikingiz yakunlandi. Natijalar Medical History bo\'limida.'
  );

  if (prescriptions.length) {
    const lines = prescriptions.map((p) => {
      const meal = MEAL_LABEL[p.mealRelation] ? `, ${MEAL_LABEL[p.mealRelation]}` : '';
      return `• ${p.name}${p.dosage ? ` — ${p.dosage}` : ''}, kuniga ${p.times.length} mahal (${p.times.join(', ')})${meal}, ${p.durationDays} kun`;
    });
    await notify(
      appointment.patient,
      'prescription',
      `${doctorName} dori yozdi`,
      `${lines.join('\n')}\nEslatmalar har qabul vaqtida keladi.`
    );
  }
  if (hasGoals) {
    const g = data.goals;
    const parts = [
      g.waterMl !== undefined ? `suv ${(g.waterMl / 1000).toFixed(1)} L` : null,
      g.sleepHours !== undefined ? `uyqu ${g.sleepHours} soat` : null,
      g.workoutMinutes !== undefined ? `workout ${g.workoutMinutes} daqiqa` : null,
    ].filter(Boolean);
    await notify(appointment.patient, 'health_summary', 'Shifokoringiz kunlik me\'yor belgiladi', `Har kuni: ${parts.join(', ')}.`);
  }
  // Mobile re-schedules on-device reminders; Web refreshes medications/goals.
  emitToUser(appointment.patient, 'health:changed', { reason: 'prescription' });

  emitToUser(appointment.patient, 'records:changed', { recordId: String(record._id) });
  emitToUser(appointment.patient, 'appointments:changed', { reason: 'completed' });
  await emitQueueChanged(appointment.doctor, appointment.date, 'completed');

  res.status(201).json({ record });
});

module.exports = { getTodayQueue, callNextPatient, completeAppointment };
