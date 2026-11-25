const { z } = require('zod');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const MedicalRecord = require('../models/MedicalRecord');
const Medication = require('../models/Medication');
const AIMessage = require('../models/AIMessage');
const Notification = require('../models/Notification');
const TelegramConnection = require('../models/TelegramConnection');
const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const Workout = require('../models/Workout');
const { TZ, todayStr, addDays } = require('../utils/date');

const SERIES_DAYS = 14;

// { key: count } from an aggregate grouped by `_id`.
const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
const countBy = (Model, match, field) =>
  Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]).then(toMap);

// GET /api/admin/overview — everything the admin dashboard shows, in one call.
async function overview(req, res, next) {
  try {
    const today = todayStr();
    const weekStart = addDays(today, -6); // last 7 days incl. today
    const prevStart = addDays(today, -13);
    const prevEnd = addDays(today, -7);
    const seriesStart = addDays(today, -(SERIES_DAYS - 1));
    const dayOf = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } };

    const [
      roles,
      usersByDay,
      telegramLinked,
      apptStatus,
      apptByDay,
      apptThisWeek,
      apptLastWeek,
      apptToday,
      apptUpcoming,
      queueToday,
      records,
      prescriptions,
      aiQuestions,
      notifications,
      waterUsers,
      sleepUsers,
      workoutUsers,
      waterLogs,
      sleepLogs,
      workouts,
      doctors,
      clinics,
      departments,
      topDoctors,
      topDepartments,
    ] = await Promise.all([
      countBy(User, {}, 'role'),
      User.aggregate([{ $project: { day: dayOf } }, { $match: { day: { $gte: prevStart } } }, { $group: { _id: '$day', count: { $sum: 1 } } }]).then(toMap),
      TelegramConnection.countDocuments(),
      countBy(Appointment, {}, 'status'),
      Appointment.aggregate([
        { $match: { date: { $gte: seriesStart, $lte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$date', count: { $sum: 1 } } },
      ]).then(toMap),
      Appointment.countDocuments({ date: { $gte: weekStart, $lte: today }, status: { $ne: 'cancelled' } }),
      Appointment.countDocuments({ date: { $gte: prevStart, $lte: prevEnd }, status: { $ne: 'cancelled' } }),
      Appointment.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
      Appointment.countDocuments({ date: { $gt: today }, status: { $in: ['pending', 'confirmed'] } }),
      countBy(Queue, { date: today }, 'status'),
      MedicalRecord.countDocuments(),
      Medication.distinct('courseId', { source: 'doctor' }).then((ids) => ids.filter(Boolean).length),
      AIMessage.countDocuments({ role: 'user' }),
      Notification.countDocuments(),
      WaterLog.distinct('user', { date: { $gte: weekStart } }),
      SleepLog.distinct('user', { date: { $gte: weekStart } }),
      Workout.distinct('user', { date: { $gte: weekStart } }),
      WaterLog.countDocuments({ date: { $gte: weekStart } }),
      SleepLog.countDocuments({ date: { $gte: weekStart } }),
      Workout.countDocuments({ date: { $gte: weekStart } }),
      Doctor.countDocuments(),
      Clinic.countDocuments(),
      Department.countDocuments(),
      Appointment.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$doctor', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'd' } },
        { $unwind: '$d' },
        { $project: { _id: 1, count: 1, name: { $concat: ['$d.firstName', ' ', '$d.lastName'] }, specialty: '$d.specialty' } },
      ]),
      Appointment.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dep' } },
        { $unwind: '$dep' },
        { $project: { _id: 1, count: 1, name: '$dep.name' } },
      ]),
    ]);

    const sumRange = (map, from, to) => Object.entries(map).reduce((s, [d, n]) => (d >= from && d <= to ? s + n : s), 0);
    const activeUsers = new Set([...waterUsers, ...sleepUsers, ...workoutUsers].map(String)).size;

    const series = [];
    for (let i = 0; i < SERIES_DAYS; i += 1) {
      const date = addDays(seriesStart, i);
      series.push({ date, users: usersByDay[date] || 0, appointments: apptByDay[date] || 0 });
    }

    res.json({
      today,
      users: {
        total: Object.values(roles).reduce((a, b) => a + b, 0),
        patients: roles.patient || 0,
        doctors: roles.doctor || 0,
        admins: roles.admin || 0,
        newThisWeek: sumRange(usersByDay, weekStart, today),
        newLastWeek: sumRange(usersByDay, prevStart, prevEnd),
        telegramLinked,
        activeThisWeek: activeUsers,
      },
      appointments: {
        total: Object.values(apptStatus).reduce((a, b) => a + b, 0),
        today: apptToday,
        upcoming: apptUpcoming,
        thisWeek: apptThisWeek,
        lastWeek: apptLastWeek,
        byStatus: {
          pending: apptStatus.pending || 0,
          confirmed: apptStatus.confirmed || 0,
          completed: apptStatus.completed || 0,
          cancelled: apptStatus.cancelled || 0,
        },
      },
      queueToday: {
        waiting: (queueToday.WAITING || 0) + (queueToday.NEAR || 0),
        called: queueToday.CALLED || 0,
        completed: queueToday.COMPLETED || 0,
        cancelled: queueToday.CANCELLED || 0,
      },
      clinical: { records, prescriptions, aiQuestions, notifications },
      health: { waterLogs, sleepLogs, workouts },
      catalog: { doctors, clinics, departments },
      series,
      topDoctors,
      topDepartments,
    });
  } catch (err) {
    next(err);
  }
}

const usersQuery = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(['patient', 'doctor', 'admin']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/users?search=&role=&page=&limit=
async function listUsers(req, res, next) {
  try {
    const { search, role, page, limit } = usersQuery.parse(req.query);
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('name email role telegramId createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    const ids = users.map((u) => u._id);
    const [appts, linked] = await Promise.all([
      Appointment.aggregate([{ $match: { patient: { $in: ids } } }, { $group: { _id: '$patient', count: { $sum: 1 } } }]),
      TelegramConnection.find({ user: { $in: ids } }).distinct('user'),
    ]);
    const apptMap = Object.fromEntries(appts.map((a) => [String(a._id), a.count]));
    const linkedSet = new Set(linked.map(String));
    res.json({
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        telegramLinked: linkedSet.has(String(u._id)) || Boolean(u.telegramId),
        appointments: apptMap[String(u._id)] || 0,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/appointments?limit= — most recently booked visits.
async function recentAppointments(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patient', 'name email')
      .populate('doctor', 'firstName lastName specialty')
      .populate('department', 'name')
      .populate('clinic', 'name')
      .lean();
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

module.exports = { overview, listUsers, recentAppointments };
