const mongoose = require('mongoose');

// One pending email-code challenge (login 2-step or sign-up verification).
// The code itself is never stored — only a salted hash. Expired challenges
// are removed by the TTL index.
const emailCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    purpose: { type: String, enum: ['login', 'register'], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    sends: { type: Number, default: 1 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // login
    pending: { name: String, passwordHash: String }, // register — account is created only after the code is confirmed
  },
  { timestamps: true }
);

emailCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailCode', emailCodeSchema);
