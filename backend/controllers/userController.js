const User = require('../models/User')

// ── @GET /api/user/me ───────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @PUT /api/user/update-profile ──────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const updates = {}
    if (name)  updates.name  = name.trim()
    if (email) updates.email = email.toLowerCase().trim()

    // Check email not taken by another user
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase() })
      if (existing && existing._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' })
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @PUT /api/user/change-password ─────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @POST /api/user/complete-lesson ────────────────────────
const completeLesson = async (req, res) => {
  try {
    const { moduleId, lessonId, xpEarned, quizScore, quizGrade, moduleName } = req.body
    const user = await User.findById(req.user.id)

    // Check if already completed
    const alreadyDone = user.completedLessons.find(
      l => l.moduleId === moduleId && l.lessonId === lessonId
    )

    if (!alreadyDone) {
      user.completedLessons.push({ moduleId, lessonId, xpEarned })
      user.xp    += xpEarned || 0
      user.level  = Math.floor(user.xp / 1000) + 1
    }

    // Save quiz result
    if (quizScore !== undefined) {
      user.quizHistory.unshift({
        module: moduleName || moduleId,
        score:  quizScore,
        grade:  quizGrade || 'B',
        date:   new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      })
    }

    await user.save()

    res.json({
      success: true,
      xp:     user.xp,
      level:  user.level,
      message: 'Lesson completed!',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @PUT /api/user/notifications ───────────────────────────
const updateNotifications = async (req, res) => {
  try {
    const { daily, fraud, weekly } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notifications: { daily, fraud, weekly } },
      { new: true }
    )
    res.json({ success: true, notifications: user.notifications })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @GET /api/user/dashboard ────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    // Weekly XP calculation
    const weeklyXP = {}
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(now - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      weeklyXP[key] = 0
    }
    user.completedLessons.forEach(l => {
      const key = new Date(l.completedAt).toISOString().slice(0, 10)
      if (weeklyXP.hasOwnProperty(key)) {
        weeklyXP[key] += l.xpEarned || 0
      }
    })

    res.json({
      success: true,
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        xp:               user.xp,
        level:            user.level,
        streak:           user.streak,
        streakDays:       user.streakDays,
        completedLessons: user.completedLessons,
        quizHistory:      user.quizHistory,
        notifications:    user.notifications,
        weeklyXP,
        createdAt:        user.createdAt,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getMe, updateProfile, changePassword, completeLesson, updateNotifications, getDashboard }