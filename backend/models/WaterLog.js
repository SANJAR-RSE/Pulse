const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountMl: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, groups logs by day
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
