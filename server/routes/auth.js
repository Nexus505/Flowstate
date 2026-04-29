const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const auth = require('../middleware/auth');

/* ── Nodemailer transporter (Gmail App Password) ── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, joinDate: user.joinDate, goals: user.goals },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, joinDate: user.joinDate, goals: user.goals },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/auth/profile  (protected)
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar, goals } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar, goals },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/auth/password  (protected)
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(currentPassword);
    if (!match)
      return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/auth/account  (protected)
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: 'Password is required to delete account' });

    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ message: 'Incorrect password' });

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/forgot-password  (public)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    // Always respond OK to prevent email enumeration attacks
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

    await transporter.sendMail({
      from: `"Flowstate" <${process.env.EMAIL_USER}>`,
      to:   user.email,
      subject: 'Reset your Flowstate password',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#080b12;color:#fff;border-radius:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
            <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px">Fs.</span>
            <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px">Flowstate</span>
          </div>
          <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Reset your password</h2>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px">
            We received a request to reset the password for your Flowstate account.
            Click the button below — the link expires in <strong style="color:#fff">1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#8b5cf6,#22d3ee);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;letter-spacing:0.3px">
            Reset Password →
          </a>
          <p style="color:#475569;font-size:12px;margin:28px 0 0;line-height:1.6">
            If you didn't request this, you can safely ignore this email.
            Your password won't change until you click the link above.
          </p>
          <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0" />
          <p style="color:#334155;font-size:11px;margin:0">
            © ${new Date().getFullYear()} Flowstate. All rights reserved.
          </p>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/reset-password  (public)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

    user.password             = newPassword;
    user.passwordResetToken   = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
