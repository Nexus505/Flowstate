const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true, default: Date.now },
  hoursWorked:    { type: Number, required: true },
  tasksCompleted: { type: Number, default: 0 },
  focusSessions:  { type: Number, default: 0 },
  mood:           { type: Number, min: 1, max: 5, default: 3 },
  notes:          { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Work', workSchema);
