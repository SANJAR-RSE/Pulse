const Clinic = require('../models/Clinic');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listClinics = asyncHandler(async (req, res) => {
  const clinics = await Clinic.find().sort({ rating: -1 });
  res.json({ clinics });
});

const getClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) throw new ApiError(404, 'Klinika topilmadi.');
  res.json({ clinic });
});

module.exports = { listClinics, getClinic };
