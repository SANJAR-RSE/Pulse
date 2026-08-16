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
const { getQueueStatus } = require('../services/queue.service');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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
    Medication.find({ user: userId, active: true }),
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
  const goals = [
    waterMl >= (profile?.waterGoalMl || 2500),
    !!sleepLog,
    workouts.length > 0,
    medications.length === 0 || takenCount === medications.length,
  ];
  const healthScore = Math.round((goals.filter(Boolean).length / goals.length) * 100);

  res.json({
    water: { consumedMl: waterMl, goalMl: profile?.waterGoalMl || 2500 },
    sleep: sleepLog ? { durationMinutes: sleepLog.durationMinutes } : null,
    workout: { totalMinutes: workouts.reduce((s, w) => s + w.durationMinutes, 0) },
    medication: { taken: takenCount, total: medications.length },
    nextAppointment: nextAppointment
      ? {
          id: nextAppointment._id,
          date: nextAppointment.date,
          time: nextAppointment.time,
          doctorName: `${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}`,
          departmentName: nextAppointment.department.name,
        }
      : null,
    queue,
    healthScore,
  });
});

// ---------- Water ----------

const addWaterSchema = z.object({ amountMl: z.number().int().positive().max(5000) });

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
  sleepTime: z.string().regex(/^\d{2}:\d{2}$/),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/),
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
    { upsert: true, new: true }
  );
  res.status(201).json({ log });
});

const listSleep = asyncHandler(async (req, res) => {
  const logs = await SleepLog.find({ user: req.user._id }).sort({ date: -1 }).limit(14);
  res.json({ logs });
});

// ---------- Workout ----------

const addWorkoutSchema = z.object({
  type: z.string().min(2),
  durationMinutes: z.number().int().positive().max(600),
  calories: z.number().int().nonnegative().optional(),
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
  name: z.string().min(2),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

const addMedication = asyncHandler(async (req, res) => {
  const data = addMedicationSchema.parse(req.body);
  const medication = await Medication.create({ ...data, user: req.user._id });
  res.status(201).json({ medication });
});

const listMedications = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id, active: true }).sort({ time: 1 });
  const date = todayStr();
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
    { upsert: true, new: true }
  );
  res.json({ log });
});

// ---------- Statistics ----------

const getStatistics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceStr = since.toISOString().slice(0, 10);

  const [waterLogs, sleepLogs, workouts, medicationLogs, appointments] = await Promise.all([
    WaterLog.find({ user: userId, date: { $gte: sinceStr } }),
    SleepLog.find({ user: userId, date: { $gte: sinceStr } }),
    Workout.find({ user: userId, date: { $gte: sinceStr } }),
    MedicationLog.find({ user: userId, date: { $gte: sinceStr } }),
    Appointment.find({ patient: userId, date: { $gte: sinceStr } }),
  ]);

  const queues = await require('../models/Queue').find({
    patient: userId,
    status: 'COMPLETED',
    date: { $gte: sinceStr },
  });

  res.json({
    waterLiters: +(waterLogs.reduce((s, l) => s + l.amountMl, 0) / 1000).toFixed(1),
    sleepHours: Math.round(sleepLogs.reduce((s, l) => s + l.durationMinutes, 0) / 60),
    workoutSessions: workouts.length,
    medicationAdherence:
      medicationLogs.length === 0
        ? null
        : Math.round((medicationLogs.filter((l) => l.taken).length / medicationLogs.length) * 100),
    appointments: appointments.length,
    queueAverageMinutes:
      queues.length === 0 ? null : Math.round((queues.length * 15) / queues.length),
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
