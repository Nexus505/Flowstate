const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/workouts',  require('./routes/workouts'));
app.use('/api/sleep',     require('./routes/sleep'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/expenses',  require('./routes/expenses'));
app.use('/api/work',      require('./routes/work'));
app.use('/api/habits',    require('./routes/habits'));
app.use('/api/water',     require('./routes/water'));
app.use('/api/ai',        require('./routes/ai'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── DB + Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
