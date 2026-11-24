const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // set when role === 'doctor'
    telegramId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
