const { z } = require('zod');
const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const Workout = require('../models/Workout');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const HealthProfile = require('../models/HealthProfile');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Queue = require('../models/Queue');
const { getQueueStatus } = require('../services/queue.service');
const { todayStr, addDays } = require('../utils/date');

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// The patient's daily targets + who set them (doctor or PULSE defaults).
function goalsOf(profile) {
  return {
    waterMl: profile?.waterGoalMl || 2500,
    sleepHours: profile?.sleepGoalHours || 8,
    workoutMinutes: profile?.workoutGoalMinutes ?? 30,
    setBy: profile?.goalsSetBy || '',
    setAt: profile?.goalsSetAt || null,
    note: profile?.goalsNote || '',
  };
}

// ---------- Dashboard ----------

// The one screen PULSE wants users to open every day — every number here is
// read live from the same collections Water/Sleep/Workout/Medication/
// Appointment/Queue write to, nothing is pre-computed or cached stale.
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = todayStr();

  const [waterLogs, sleepLog, workouts, medications, profile, nextAppointment] = await Promise.all([
    WaterLog.find({ user: userId, date }),
    SleepLog.findOne({ user: userId, date }),
    Workout.find({ user: userId, date }),
    Medication.find({ user: userId, ...Medication.activeOn(date) }),
    HealthProfile.findOne({ user: userId }),
    Appointment.findOne({
      patient: userId,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: date },
    })
      .sort({ date: 1, time: 1 })
      .populate('doctor')
      .populate('department'),
  ]);

  const medicationLogs = await MedicationLog.find({
    user: userId,
    date,
    medication: { $in: medications.map((m) => m._id) },
  });

  const waterMl = waterLogs.reduce((s, l) => s + l.amountMl, 0);
  const takenCount = medicationLogs.filter((l) => l.taken).length;

  let queue = null;
  if (nextAppointment) queue = await getQueueStatus(nextAppointment._id);

  // Health Score is NOT a medical diagnosis — it's a simple, transparent
  // progress indicator over the day's logged activity (see promt.md #9).
  // Measured against the patient's own daily targets (set by their doctor
  // at an exam, otherwise PULSE defaults).
  const g = goalsOf(profile);
  const workoutMin = workouts.reduce((s, w) => s + w.durationMinutes, 0);
  const checks = [
    waterMl >= g.waterMl,
    !!sleepLog && sleepLog.durationMinutes >= g.sleepHours * 60 * 0.9, // within 10% counts
    workoutMin >= Math.max(1, g.workoutMinutes),
    medications.length === 0 || takenCount === medications.length,
  ];
  const healthScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  res.json({
    goals: g,
    water: { consumedMl: waterMl, goalMl: g.waterMl },
    sleep: sleepLog ? { durationMinutes: sleepLog.durationMinutes } : null,
    workout: { totalMinutes: workoutMin },
    medication: { taken: takenCount, total: medications.length },
    nextAppointment: nextAppointment
      ? {
          id: nextAppointment._id,
          date: nextAppointment.date,
          time: nextAppointment.time,
          doctorName: nextAppointment.doctor
            ? `${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}`
            : 'Shifokor',
          departmentName: nextAppointment.department?.name || '',
        }
      : null,
    queue,
    healthScore,
  });
});

// ---------- Water ----------

const addWaterSchema = z.object({
  amountMl: z
    .number('Suv miqdorini ml da raqam bilan kiriting.')
    .int('Suv miqdori butun son (ml) bo\'lishi kerak.')
    .positive('Suv miqdori 0 dan katta bo\'lishi kerak.')
    .max(5000, 'Bir martada 5000 ml dan ko\'p qo\'shib bo\'lmaydi.'),
});

const addWater = asyncHandler(async (req, res) => {
  const { amountMl } = addWaterSchema.parse(req.body);
  const log = await WaterLog.create({ user: req.user._id, amountMl, date: todayStr() });
  res.status(201).json({ log });
});

const listWater = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  const logs = await WaterLog.find({ user: req.user._id, date }).sort({ createdAt: -1 });
  res.json({ logs, totalMl: logs.reduce((s, l) => s + l.amountMl, 0) });
});

// ---------- Sleep ----------

const addSleepSchema = z.object({
  sleepTime: z.string().regex(HHMM, 'Uxlagan vaqt HH:mm formatida bo\'lsin.'),
  wakeTime: z.string().regex(HHMM, 'Uyg\'ongan vaqt HH:mm formatida bo\'lsin.'),
});

function computeSleepMinutes(sleepTime, wakeTime) {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let minutes = wh * 60 + wm - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60; // crossed midnight
  return minutes;
}

const addSleep = asyncHandler(async (req, res) => {
  const { sleepTime, wakeTime } = addSleepSchema.parse(req.body);
  const durationMinutes = computeSleepMinutes(sleepTime, wakeTime);
  const date = todayStr();

  const log = await SleepLog.findOneAndUpdate(
    { user: req.user._id, date },
    { user: req.user._id, date, sleepTime, wakeTime, durationMinutes },
    { upsert: true, returnDocument: 'after' }
  );
  res.status(201).json({ log });
});

const listSleep = asyncHandler(async (req, res) => {
  const logs = await SleepLog.find({ user: req.user._id }).sort({ date: -1 }).limit(14);
  res.json({ logs });
});

// ---------- Workout ----------

const addWorkoutSchema = z.object({
  type: z.string().trim().min(2, 'Mashg\'ulot turini kiriting (kamida 2 belgi).'),
  durationMinutes: z
    .number('Davomiylikni daqiqada kiriting.')
    .int('Davomiylik butun son bo\'lishi kerak.')
    .positive('Davomiylik 0 dan katta bo\'lishi kerak.')
    .max(600, 'Davomiylik 600 daqiqadan oshmasin.'),
  calories: z.number().int('Kaloriya butun son bo\'lishi kerak.').nonnegative('Kaloriya manfiy bo\'lmaydi.').optional(),
});

const addWorkout = asyncHandler(async (req, res) => {
  const data = addWorkoutSchema.parse(req.body);
  const workout = await Workout.create({ ...data, user: req.user._id, date: todayStr() });
  res.status(201).json({ workout });
});

const listWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ workouts });
});

// ---------- Medication ----------

const addMedicationSchema = z.object({
  name: z.string().trim().min(2, 'Dori nomini kiriting (kamida 2 belgi).'),
  time: z.string().regex(HHMM, 'Vaqt HH:mm formatida bo\'lsin.'),
});

const addMedication = asyncHandler(async (req, res) => {
  const data = addMedicationSchema.parse(req.body);
  const medication = await Medication.create({ ...data, user: req.user._id });
  res.status(201).json({ medication });
});

const listMedications = asyncHandler(async (req, res) => {
  const date = todayStr();
  // Only what is due today: active, and inside its course dates.
  const medications = await Medication.find({ user: req.user._id, ...Medication.activeOn(date) }).sort({ time: 1 });
  const logs = await MedicationLog.find({
    user: req.user._id,
    date,
    medication: { $in: medications.map((m) => m._id) },
  });
  const takenIds = new Set(logs.filter((l) => l.taken).map((l) => l.medication.toString()));
  res.json({
    medications: medications.map((m) => ({ ...m.toObject(), takenToday: takenIds.has(m._id.toString()) })),
  });
});

// PULSE never suggests a new medication or dose — it only records what the
// user (or their doctor, via Medical Record) already decided (promt.md #10).
const logMedicationTaken = asyncHandler(async (req, res) => {
  const medication = await Medication.findOne({ _id: req.params.id, user: req.user._id });
  if (!medication) throw new ApiError(404, 'Dori topilmadi.');

  const date = todayStr();
  const log = await MedicationLog.findOneAndUpdate(
    { medication: medication._id, date },
    { medication: medication._id, user: req.user._id, date, taken: true, takenAt: new Date() },
    { upsert: true, returnDocument: 'after' }
  );
  res.json({ log });
});

// ---------- Statistics ----------

// One 7-day window [from, to] of real logged data.
async function weekStats(userId, from, to, medications) {
  const inWindow = { $gte: from, $lte: to };
  const [waterLogs, sleepLogs, workouts, takenLogs, appointments, queues] = await Promise.all([
    WaterLog.find({ user: userId, date: inWindow }),
    SleepLog.find({ user: userId, date: inWindow }),
    Workout.find({ user: userId, date: inWindow }),
    MedicationLog.find({ user: userId, taken: true, date: inWindow }),
    Appointment.find({ patient: userId, date: inWindow, status: { $ne: 'cancelled' } }),
    Queue.find({ patient: userId, status: 'COMPLETED', date: inWindow }),
  ]);

  // Adherence = doses taken / doses scheduled. Only "taken" is ever logged,
  // so the denominator comes from the schedule: each medication is due once
  // per day from the later of (added, course start, window start) to the
  // earlier of (course end, window end).
  let scheduled = 0;
  const due = new Set();
  for (const m of medications) {
    let start = todayStr(m.createdAt);
    if (m.startDate && m.startDate > start) start = m.startDate;
    if (from > start) start = from;
    let end = to;
    if (m.endDate && m.endDate < end) end = m.endDate;
    for (let d = start; d <= end; d = addDays(d, 1)) {
      scheduled += 1;
      due.add(`${m._id}|${d}`);
    }
  }
  const taken = takenLogs.filter((l) => due.has(`${l.medication}|${l.date}`)).length;

  // Approximates time-in-queue from real timestamps (joined -> done) —
  // no synthetic constant, since that would misrepresent an actual metric.
  const queueMinutes = queues.map((q) => Math.max(0, Math.round((q.updatedAt - q.createdAt) / 60000)));
  const waterMl = waterLogs.reduce((s, l) => s + l.amountMl, 0);
  const sleepMin = sleepLogs.reduce((s, l) => s + l.durationMinutes, 0);

  return {
    from,
    to,
    waterLiters: +(waterMl / 1000).toFixed(1),
    sleepHours: Math.round(sleepMin / 60),
    avgSleepHours: sleepLogs.length ? +(sleepMin / sleepLogs.length / 60).toFixed(1) : null,
    workoutSessions: workouts.length,
    workoutMinutes: workouts.reduce((s, w) => s + w.durationMinutes, 0),
    medicationAdherence: scheduled === 0 ? null : Math.min(100, Math.round((taken / scheduled) * 100)),
    appointments: appointments.length,
    queueAverageMinutes:
      queueMinutes.length === 0 ? null : Math.round(queueMinutes.reduce((s, m) => s + m, 0) / queueMinutes.length),
  };
}

// This week = the last 7 days INCLUDING today; last week = the 7 days before.
// Weekly targets = the patient's daily goals x 7.
const getStatistics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = todayStr();
  const [medications, profile] = await Promise.all([
    Medication.find({ user: userId, active: true }),
    HealthProfile.findOne({ user: userId }),
  ]);

  const [thisWeek, lastWeek] = await Promise.all([
    weekStats(userId, addDays(today, -6), today, medications),
    weekStats(userId, addDays(today, -13), addDays(today, -7), medications),
  ]);
  const g = goalsOf(profile);

  res.json({
    // Flat fields kept for existing clients (= this week).
    waterLiters: thisWeek.waterLiters,
    sleepHours: thisWeek.sleepHours,
    workoutSessions: thisWeek.workoutSessions,
    medicationAdherence: thisWeek.medicationAdherence,
    appointments: thisWeek.appointments,
    queueAverageMinutes: thisWeek.queueAverageMinutes,
    thisWeek,
    lastWeek,
    weeklyGoals: {
      waterLiters: +((g.waterMl * 7) / 1000).toFixed(1),
      sleepHours: g.sleepHours * 7,
      workoutMinutes: g.workoutMinutes * 7,
      setBy: g.setBy,
    },
  });
});

module.exports = {
  getDashboard,
  addWater,
  listWater,
  addSleep,
  listSleep,
  addWorkout,
  listWorkouts,
  addMedication,
  listMedications,
  logMedicationTaken,
  getStatistics,
};
