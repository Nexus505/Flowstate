const router = require('express').Router();
const auth = require('../middleware/auth');
const Work = require('../models/Work');

// GET /api/work
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Work.find({ user: req.user.id }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/work
router.post('/', auth, async (req, res) => {
  try {
    const session = await Work.create({ ...req.body, user: req.user.id });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/work/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Work.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
