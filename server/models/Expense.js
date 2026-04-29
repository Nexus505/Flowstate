const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: Date, required: true, default: Date.now },
  type:        { type: String, enum: ['expense', 'income'], required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  amount:      { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
