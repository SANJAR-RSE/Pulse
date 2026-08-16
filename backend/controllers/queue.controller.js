const Queue = require('../models/Queue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getQueueStatus } = require('../services/queue.service');

const getMyQueue = asyncHandler(async (req, res) => {
  const entry = await Queue.findOne({ appointment: req.params.appointmentId, patient: req.user._id });
  if (!entry) throw new ApiError(404, 'Navbat topilmadi.');
  const status = await getQueueStatus(entry.appointment);
  res.json(status);
});

module.exports = { getMyQueue };
