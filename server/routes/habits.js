const router = require('express').Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');

// GET /api/habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/habits
router.post('/', auth, async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user.id });
    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/habits/:id  — update habit details
router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: 'Not found' });
    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/habits/:id/toggle  — toggle today's completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Not found' });

    const doneToday = habit.completedDates.includes(todayStr);
    if (doneToday) {
      habit.completedDates = habit.completedDates.filter(d => d !== todayStr);
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      habit.completedDates.unshift(todayStr);
      habit.streak += 1;
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
