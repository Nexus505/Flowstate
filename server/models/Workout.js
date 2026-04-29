const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true, default: Date.now },
  type:      { type: String, required: true },
  duration:  { type: Number, required: true }, // minutes
  intensity: { type: Number, min: 1, max: 5, default: 3 },
  calories:  { type: Number, default: 0 },
  notes:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
