const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    workingHours: { type: String, default: '09:00 - 18:00' },
    description: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
