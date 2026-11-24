const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getAvailableSlots } = require('../services/slot.service');

const isId = (v) => mongoose.isValidObjectId(v);

const listDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) {
    if (!isId(req.query.department)) throw new ApiError(400, 'Bo\'lim identifikatori noto\'g\'ri.');
    filter.department = req.query.department;
  }
  if (req.query.clinic) {
    if (!isId(req.query.clinic)) throw new ApiError(400, 'Klinika identifikatori noto\'g\'ri.');
    filter.clinic = req.query.clinic;
  }

  const doctors = await Doctor.find(filter).populate('clinic').populate('department').sort({ rating: -1 });
  res.json({ doctors });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('clinic').populate('department');
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');
  res.json({ doctor });
});

// Slots are computed live (see slot.service) — never persisted, so they can
// never go stale or disagree with what Appointment/Queue actually contain.
const getDoctorSlots = asyncHandler(async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, 'date=YYYY-MM-DD kerak.');

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');

  res.json({ slots: await getAvailableSlots(doctor, date) });
});

module.exports = { listDoctors, getDoctor, getDoctorSlots };
