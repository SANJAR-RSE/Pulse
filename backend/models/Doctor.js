const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, default: '' },
    specialty: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
    rating: { type: Number, default: 4.5 },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    workingDays: [{ type: String }], // e.g. ["Mon","Tue","Wed","Thu","Fri"]
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // linked login account, if any
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
