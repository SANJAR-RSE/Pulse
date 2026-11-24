const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    time: { type: String, required: true }, // HH:mm
    frequency: { type: String, enum: ['daily'], default: 'daily' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
