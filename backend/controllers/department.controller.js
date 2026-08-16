const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ departments });
});

module.exports = { listDepartments };
