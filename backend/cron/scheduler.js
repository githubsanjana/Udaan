const cron = require('node-cron')
const User = require('../models/User')
const { sendWeeklyReport, sendDailyReminder } = require('../services/emailService')

function startScheduler() {

  // ── Daily Reminder — har roz raat 7 baje ──────────────────
  cron.schedule('0 19 * * *', async () => {
    console.log('🔔 Sending daily reminders...')
    try {
      const users = await User.find({ 'notifications.daily': true })
      const today = new Date().toISOString().slice(0, 10)

      for (const user of users) {
        const learnedToday = user.completedLessons.some(l => {
          return new Date(l.completedAt).toISOString().slice(0, 10) === today
        })
        if (!learnedToday) {
          await sendDailyReminder(user.name, user.email, user.streak)
        }
      }
      console.log(`✅ Daily reminders sent`)
    } catch (err) {
      console.log('Daily reminder error:', err.message)
    }
  })

  // ── Weekly Report — har Sunday raat 8 baje ────────────────
  cron.schedule('0 20 * * 0', async () => {
    console.log('📊 Sending weekly reports...')
    try {
      const users  = await User.find({ 'notifications.weekly': true })
      const weekAgo = new Date(Date.now() - 7 * 86400000)

      for (const user of users) {
        const weekLessons = user.completedLessons.filter(l => new Date(l.completedAt) > weekAgo)
        const weekXP      = weekLessons.reduce((s, l) => s + (l.xpEarned || 0), 0)
        await sendWeeklyReport(user.name, user.email, {
          xpEarned: weekXP, lessonsCompleted: weekLessons.length, streak: user.streak,
        })
      }
      console.log(`✅ Weekly reports sent`)
    } catch (err) {
      console.log('Weekly report error:', err.message)
    }
  })

  console.log('⏰ Scheduler started — Daily 7PM · Weekly Sunday 8PM')
}

module.exports = { startScheduler }