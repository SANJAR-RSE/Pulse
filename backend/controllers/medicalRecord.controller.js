const MedicalRecord = require('../models/MedicalRecord');
const asyncHandler = require('../utils/asyncHandler');

// Faqat shu userning medical data'si ko'rinsin — scoped strictly to req.user,
// never accepts a patient id from the client (promt.md #22).
const listMyRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user._id })
    .populate('doctor')
    .populate('clinic')
    .populate('department')
    .sort({ date: -1 });
  res.json({ records });
});

module.exports = { listMyRecords };
