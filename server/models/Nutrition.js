const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
});

const nutritionSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:  { type: Date, required: true, default: Date.now },
  meals: [mealSchema],
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema);
