const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    code: { type: String, required: true }, // e.g. "A-24"
    position: { type: Number, required: true }, // order within doctor+date queue
    status: {
      type: String,
      enum: ['WAITING', 'NEAR', 'CALLED', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING',
    },
  },
  { timestamps: true }
);

queueSchema.index({ doctor: 1, date: 1, position: 1 });

module.exports = mongoose.model('Queue', queueSchema);
