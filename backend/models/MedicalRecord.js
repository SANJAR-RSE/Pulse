const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String, default: '' },
    normalRange: { type: String, default: '' },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    date: { type: String, required: true },
    examination: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    labResults: [labResultSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
