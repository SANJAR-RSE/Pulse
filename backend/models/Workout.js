const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    calories: { type: Number },
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
