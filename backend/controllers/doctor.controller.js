const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const WEEKDAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_MINUTES = 30;

const listDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.clinic) filter.clinic = req.query.clinic;

  const doctors = await Doctor.find(filter).populate('clinic').populate('department').sort({ rating: -1 });
  res.json({ doctors });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('clinic').populate('department');
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');
  res.json({ doctor });
});

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Slots are computed live from the doctor's working hours minus already
// booked Appointments — never persisted, so they can never go stale or
// disagree with what Appointment/Queue actually contain.
const getDoctorSlots = asyncHandler(async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, 'date=YYYY-MM-DD kerak.');

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');

  const weekday = WEEKDAY_CODES[new Date(`${date}T00:00:00`).getDay()];
  if (!doctor.workingDays.includes(weekday)) return res.json({ slots: [] });

  const start = timeToMinutes(doctor.workingHours.start);
  const end = timeToMinutes(doctor.workingHours.end);

  const booked = await Appointment.find({
    doctor: doctor._id,
    date,
    status: { $in: ['pending', 'confirmed'] },
  }).distinct('time');
  const bookedSet = new Set(booked);

  const slots = [];
  for (let t = start; t < end; t += SLOT_MINUTES) {
    const time = minutesToTime(t);
    if (!bookedSet.has(time)) slots.push(time);
  }

  res.json({ slots });
});

module.exports = { listDoctors, getDoctor, getDoctorSlots };
