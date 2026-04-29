const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
  goals: {
    calories:  { type: Number, default: 2500 },
    sleep:     { type: Number, default: 8 },
    workouts:  { type: Number, default: 4 },
    workHours: { type: Number, default: 8 },
    protein:   { type: Number, default: 180 },
    savings:   { type: Number, default: 1000 },
  },
  passwordResetToken:   { type: String, default: null },
  passwordResetExpires: { type: Date,   default: null },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password helper
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
