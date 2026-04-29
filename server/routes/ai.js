const router    = require('express').Router();
const auth      = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Workout   = require('../models/Workout');
const Sleep     = require('../models/Sleep');
const Nutrition = require('../models/Nutrition');
const Expense   = require('../models/Expense');
const Work      = require('../models/Work');
const Habit     = require('../models/Habit');

// POST /api/ai/insights
router.post('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Pull last 7 days of data from every module ────────────
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [workouts, sleep, nutrition, expenses, work, habits] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Sleep.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Nutrition.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Expense.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Work.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }),
      Habit.find({ user: userId }),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];

    // ── Summarise for prompt ───────────────────────────────────
    const avgSleep = sleep.length
      ? (sleep.reduce((a, s) => a + s.hours, 0) / sleep.length).toFixed(1)
      : 'N/A';
    const avgSleepQ = sleep.length
      ? (sleep.reduce((a, s) => a + s.quality, 0) / sleep.length).toFixed(1)
      : 'N/A';

    const workoutCount = workouts.length;
    const avgIntensity = workouts.length
      ? (workouts.reduce((a, w) => a + w.intensity, 0) / workouts.length).toFixed(1)
      : 'N/A';

    const totalCals = expenses
      .filter(e => e.type === 'expense')
      .reduce((a, e) => a + e.amount, 0).toFixed(2);
    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((a, e) => a + e.amount, 0).toFixed(2);

    const avgWorkHours = work.length
      ? (work.reduce((a, w) => a + w.hoursWorked, 0) / work.length).toFixed(1)
      : 'N/A';
    const avgMood = work.length
      ? (work.reduce((a, w) => a + w.mood, 0) / work.length).toFixed(1)
      : 'N/A';

    const habitsCompletedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
    const habitsSummary = habits.map(h => `${h.name} (streak: ${h.streak}, done today: ${h.completedDates.includes(todayStr)})`).join(', ');

    const nutritionSummary = nutrition.flatMap(d => d.meals).slice(0, 10)
      .map(m => `${m.name} (${m.calories}kcal, ${m.protein}g protein)`).join(', ');

    // ── Build prompt ───────────────────────────────────────────
    const prompt = `
You are Flowstate AI, an elite personal health & productivity coach with expertise across fitness, sleep science, nutrition, behavioural psychology, and financial wellness.

Analyse this user's last 7 days of biometric and productivity data and return a structured JSON response with 3 cross-module insights and 3 actionable recommendations.

DATA SUMMARY:
- Sleep: avg ${avgSleep}h/night, avg quality ${avgSleepQ}/5 (${sleep.length} entries)
- Workouts: ${workoutCount} sessions, avg intensity ${avgIntensity}/5
- Nutrition (recent meals): ${nutritionSummary || 'No data'}
- Finances: $${totalIncome} income, $${totalCals} expenses (last 7 days)
- Work: avg ${avgWorkHours}h/day, avg mood ${avgMood}/5 (${work.length} sessions)
- Habits: ${habitsCompletedToday}/${habits.length} done today. ${habitsSummary || 'No habits tracked'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "score": <number 0-100 representing overall wellbeing/readiness>,
  "scoreLabel": "<one word: Optimal|Strong|Good|Fair|Low>",
  "insights": [
    {
      "type": "<warning|positive|neutral>",
      "title": "<short title>",
      "description": "<2-3 sentence specific insight using the actual data above>",
      "modules": ["<Module1>", "<Module2>"]
    }
  ],
  "recommendations": [
    {
      "text": "<action title>",
      "subtext": "<one sentence specific recommendation>",
      "module": "<primary module>"
    }
  ]
}
`.trim();

    // ── Call Gemini ────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    // Strip any markdown code fences if present
    const clean  = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error('AI insights error:', err.message);
    res.status(500).json({ message: 'AI analysis failed', error: err.message });
  }
});

module.exports = router;
