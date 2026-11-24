const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true }, // date of waking up, YYYY-MM-DD
    sleepTime: { type: String, required: true }, // HH:mm
    wakeTime: { type: String, required: true }, // HH:mm
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SleepLog', sleepLogSchema);
