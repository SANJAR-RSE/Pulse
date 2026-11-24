const mongoose = require('mongoose');

// One document = one daily intake time. A doctor's prescription "3 times a
// day for 7 days" becomes 3 documents sharing a courseId, each active from
// startDate to endDate — so reminders, "taken" logs and adherence keep
// working per intake without any special cases.
const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    time: { type: String, required: true }, // HH:mm
    frequency: { type: String, enum: ['daily'], default: 'daily' },
    active: { type: Boolean, default: true },

    // ---- Prescription details (filled when a doctor prescribes) ----
    source: { type: String, enum: ['self', 'doctor'], default: 'self' },
    dosage: { type: String, default: '' }, // e.g. "1 tabletka", "500 mg"
    // before = och qoringa (ovqatdan oldin), after = to'q qoringa (ovqatdan keyin)
    mealRelation: { type: String, enum: ['any', 'before', 'after', 'with'], default: 'any' },
    note: { type: String, default: '' }, // free-text instruction from the doctor
    startDate: { type: String }, // YYYY-MM-DD (inclusive)
    endDate: { type: String }, // YYYY-MM-DD (inclusive); empty = no end
    timesPerDay: { type: Number, default: 1 },
    intakeIndex: { type: Number, default: 1 }, // 1..timesPerDay
    courseId: { type: String, index: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String, default: '' },
    record: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  },
  { timestamps: true }
);

// Mongo filter for "should be taken on `date`" (active + inside the course).
medicationSchema.statics.activeOn = function activeOn(date) {
  return {
    active: true,
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: date } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: '' }, { endDate: { $gte: date } }] },
    ],
  };
};

module.exports = mongoose.model('Medication', medicationSchema);
