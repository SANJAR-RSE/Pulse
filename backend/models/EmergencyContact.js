const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Tez yordam", "Yong'in xavfsizligi"
    phone: { type: String, required: true },
    type: { type: String, required: true }, // ambulance | police | fire | poison_control
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
