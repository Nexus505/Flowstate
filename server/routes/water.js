const router = require('express').Router();
const auth   = require('../middleware/auth');
const Water  = require('../models/Water');

// GET /api/water?date=YYYY-MM-DD  (defaults to today)
router.get('/', auth, async (req, res) => {
  try {
    const date   = req.query.date || new Date().toISOString().split('T')[0];
    const record = await Water.findOne({ user: req.user.id, date });
    res.json({ date, glasses: record ? record.glasses : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/water  { date, glasses }
router.put('/', auth, async (req, res) => {
  try {
    const date    = req.body.date || new Date().toISOString().split('T')[0];
    const glasses = Math.max(0, Math.min(20, Number(req.body.glasses) || 0));

    const record = await Water.findOneAndUpdate(
      { user: req.user.id, date },
      { glasses },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
