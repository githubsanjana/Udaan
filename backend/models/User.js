const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  // Progress
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  streakDays: {
    type: [String],
    default: [],
  },
  completedLessons: [{
    moduleId:  String,
    lessonId:  String,
    xpEarned:  Number,
    completedAt: { type: Date, default: Date.now },
  }],
  quizHistory: [{
    module:  String,
    score:   Number,
    grade:   String,
    date:    String,
    takenAt: { type: Date, default: Date.now },
  }],
  // Notifications
  notifications: {
    daily:  { type: Boolean, default: true  },
    fraud:  { type: Boolean, default: true  },
    weekly: { type: Boolean, default: false },
  },
  // Forgot password
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Update streak on login
UserSchema.methods.updateStreak = function () {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const last      = this.lastLogin ? new Date(this.lastLogin).toISOString().slice(0, 10) : null

  if (last === today) return // already logged in today

  if (last === yesterday) {
    this.streak += 1
  } else if (last !== today) {
    this.streak = 1 // reset streak
  }

  if (!this.streakDays.includes(today)) {
    this.streakDays = [...this.streakDays.slice(-29), today]
  }
  this.lastLogin = new Date()
}

module.exports = mongoose.model('User', UserSchema)