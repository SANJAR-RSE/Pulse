const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    // false once cancelled — frees the slot for someone else (see index below).
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One ACTIVE booking per doctor+date+time. Cancelled appointments stay in the
// history but no longer hold the slot, so it can be re-booked.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { active: true }, name: 'doctor_date_time_active_unique' }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
