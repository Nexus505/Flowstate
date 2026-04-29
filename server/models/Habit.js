const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  icon:           { type: String, default: 'Target' },
  color:          { type: String, default: '#34d399' },
  frequency:      { type: String, enum: ['daily', 'weekly', 'weekdays'], default: 'daily' },
  streak:         { type: Number, default: 0 },
  completedDates: [{ type: String }], // stored as 'YYYY-MM-DD'
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
