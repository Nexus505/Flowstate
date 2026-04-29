const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: String, required: true },   // 'YYYY-MM-DD'
  glasses: { type: Number, default: 0, min: 0, max: 20 },
}, { timestamps: true });

// One record per user per day
waterSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Water', waterSchema);
