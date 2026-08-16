const { z } = require('zod');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createQueueEntry } = require('../services/queue.service');
const { notify } = require('../services/notification.service');

const createSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

// A booking always produces a real Appointment row AND a real Queue row in
// the same request — "fake frontend state yetarli emas" (promt.md #14).
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time } = createSchema.parse(req.body);

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      clinic: doctor.clinic,
      department: doctor.department,
      date,
      time,
      status: 'confirmed',
    });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(400, 'Bu vaqt band qilingan, boshqa vaqt tanlang.');
    throw err;
  }

  const queue = await createQueueEntry({
    appointment: appointment._id,
    patient: req.user._id,
    doctor: doctor._id,
    department: doctor.department,
    date,
  });

  await notify(
    req.user._id,
    'appointment_confirmed',
    'Navbat tasdiqlandi',
    `Sizning navbatingiz tasdiqlandi: ${queue.code} (${date} ${time}).`
  );

  res.status(201).json({ appointment, queue });
});

const listMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor')
    .populate('clinic')
    .populate('department')
    .sort({ date: -1, time: -1 });
  res.json({ appointments });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });
  if (!appointment) throw new ApiError(404, 'Navbat topilmadi.');
  if (appointment.status === 'completed') throw new ApiError(400, 'Yakunlangan navbatni bekor qilib bo\'lmaydi.');

  appointment.status = 'cancelled';
  await appointment.save();

  const Queue = require('../models/Queue');
  await Queue.findOneAndUpdate({ appointment: appointment._id }, { status: 'CANCELLED' });

  await notify(req.user._id, 'appointment_cancelled', 'Navbat bekor qilindi', 'Sizning navbatingiz bekor qilindi.');

  res.json({ appointment });
});

module.exports = { createAppointment, listMyAppointments, cancelAppointment };
