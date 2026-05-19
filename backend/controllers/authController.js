const User  = require('../models/User')
const { sendWelcomeEmail, sendOtpEmail } = require('../services/emailService')
const jwt   = require('jsonwebtoken')
const crypto = require('crypto')

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

// ── @POST /api/auth/signup ──────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' })
    }

    // Create user
    const user = await User.create({ name, email, password })

    // Update streak for first login
    user.updateStreak()
    await user.save()

    const token = generateToken(user._id)

    // Send welcome email
    sendWelcomeEmail(user.name, user.email)

    res.status(201).json({
      success: true,
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        xp:     user.xp,
        level:  user.level,
        streak: user.streak,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @POST /api/auth/login ───────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' })
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    // Update streak
    user.updateStreak()
    await user.save()

    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        xp:         user.xp,
        level:      user.level,
        streak:     user.streak,
        streakDays: user.streakDays,
        notifications: user.notifications,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @POST /api/auth/forgot-password ────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If this email exists, OTP has been sent.' })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.resetPasswordToken  = crypto.createHash('sha256').update(otp).digest('hex')
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 mins
    await user.save()

    // Send OTP via email
    await sendOtpEmail(user.name, user.email, otp)
    console.log(`OTP for ${email}: ${otp}`)

    res.json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @POST /api/auth/verify-otp ──────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken:  hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
    }

    res.json({ success: true, message: 'OTP verified' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @POST /api/auth/reset-password ─────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken:  hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
    }

    user.password            = newPassword
    user.resetPasswordToken  = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword }