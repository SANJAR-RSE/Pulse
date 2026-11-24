const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema(
  {
    medication: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    taken: { type: Boolean, default: false },
    takenAt: { type: Date },
  },
  { timestamps: true }
);

medicationLogSchema.index({ medication: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
