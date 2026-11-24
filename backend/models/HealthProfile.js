const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    heightCm: { type: Number },
    weightKg: { type: Number },
    // Daily targets. Defaults until a doctor sets personal ones at an exam.
    waterGoalMl: { type: Number, default: 2500 },
    sleepGoalHours: { type: Number, default: 8 },
    workoutGoalMinutes: { type: Number, default: 30 },
    // Who set the current targets (shown to the patient as "Shifokoringiz tavsiyasi").
    goalsSetBy: { type: String, default: '' }, // doctor's name; empty = PULSE defaults
    goalsSetAt: { type: Date },
    goalsNote: { type: String, default: '' },
    conditions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
