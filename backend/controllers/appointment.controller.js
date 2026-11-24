const { z } = require('zod');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Queue = require('../models/Queue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createQueueEntry } = require('../services/queue.service');
const { getAvailableSlots } = require('../services/slot.service');
const { notify } = require('../services/notification.service');

const createSchema = z.object({
  doctorId: z.string().refine((v) => mongoose.isValidObjectId(v), 'Shifokor identifikatori noto\'g\'ri.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana YYYY-MM-DD formatida bo\'lsin.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Vaqt HH:mm formatida bo\'lsin.'),
});

// A booking always produces a real Appointment row AND a real Queue row in
// the same request — "fake frontend state yetarli emas" (promt.md #14).
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time } = createSchema.parse(req.body);

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');

  // Same rules the slot picker uses: no past dates/times, only working days
  // and hours, only free slots. A client can't book what it wasn't offered.
  const slots = await getAvailableSlots(doctor, date);
  if (!slots.includes(time)) {
    throw new ApiError(400, 'Bu vaqt band yoki mavjud emas. Iltimos, bo\'sh vaqtlardan birini tanlang.');
  }

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
      active: true,
    });
  } catch (err) {
    // Two people grabbing the same slot at the same moment.
    if (err.code === 11000) throw new ApiError(400, 'Bu vaqt hozirgina band qilindi, boshqa vaqt tanlang.');
    throw err;
  }

  const queue = await createQueueEntry({
    appointment: appointment._id,
    patient: req.user._id,
    doctor: doctor._id,
    department: doctor.department,
    date,
    time,
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
  if (appointment.status === 'cancelled') throw new ApiError(400, 'Bu navbat allaqachon bekor qilingan.');

  appointment.status = 'cancelled';
  appointment.active = false; // frees the slot
  await appointment.save();

  await Queue.findOneAndUpdate({ appointment: appointment._id }, { status: 'CANCELLED' });

  await notify(req.user._id, 'appointment_cancelled', 'Navbat bekor qilindi', 'Sizning navbatingiz bekor qilindi.');

  res.json({ appointment });
});

module.exports = { createAppointment, listMyAppointments, cancelAppointment };
