const router = require('express').Router();
const auth = require('../middleware/auth');
const Sleep = require('../models/Sleep');

// GET /api/sleep
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Sleep.find({ user: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sleep
router.post('/', auth, async (req, res) => {
  try {
    const entry = await Sleep.create({ ...req.body, user: req.user.id });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/sleep/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Sleep.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/sleep/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Sleep.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
