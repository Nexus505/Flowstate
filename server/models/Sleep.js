const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: Date, required: true, default: Date.now },
  hours:   { type: Number, required: true },
  quality: { type: Number, min: 1, max: 5, default: 3 },
  notes:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Sleep', sleepSchema);
