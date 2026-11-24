const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    heightCm: { type: Number },
    weightKg: { type: Number },
    waterGoalMl: { type: Number, default: 2500 },
    sleepGoalHours: { type: Number, default: 8 },
    conditions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
