const router = require('express').Router();
const auth = require('../middleware/auth');
const Nutrition = require('../models/Nutrition');

// GET /api/nutrition
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Nutrition.find({ user: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/nutrition  — adds a meal to today's entry or creates new
router.post('/', auth, async (req, res) => {
  try {
    const { meal, date } = req.body;
    const dayStr = (date || new Date().toISOString()).split('T')[0];
    const dayStart = new Date(dayStr);
    const dayEnd   = new Date(dayStr);
    dayEnd.setDate(dayEnd.getDate() + 1);

    let entry = await Nutrition.findOne({ user: req.user.id, date: { $gte: dayStart, $lt: dayEnd } });

    if (entry) {
      entry.meals.push(meal);
      await entry.save();
    } else {
      entry = await Nutrition.create({ user: req.user.id, date: dayStart, meals: [meal] });
    }

    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/nutrition/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
