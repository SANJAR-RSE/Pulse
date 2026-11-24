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

// Snapshot of what the doctor prescribed at this visit (the live schedule
// lives in Medication documents, linked back via Medication.record).
const prescriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, default: '' },
    times: [{ type: String }], // HH:mm
    mealRelation: { type: String, enum: ['any', 'before', 'after', 'with'], default: 'any' },
    durationDays: { type: Number, default: 7 },
    note: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String },
  },
  { _id: false }
);

const goalsSchema = new mongoose.Schema(
  {
    waterMl: { type: Number },
    sleepHours: { type: Number },
    workoutMinutes: { type: Number },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    // One record per appointment — a double submit can never create two.
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    date: { type: String, required: true },
    examination: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    labResults: [labResultSchema],
    prescriptions: [prescriptionSchema],
    goals: { type: goalsSchema, default: undefined },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
