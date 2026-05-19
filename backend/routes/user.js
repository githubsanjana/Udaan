const express = require('express')
const router  = express.Router()
const { getMe, updateProfile, changePassword, completeLesson, updateNotifications, getDashboard } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.get('/me',                 protect, getMe)
router.get('/dashboard',          protect, getDashboard)
router.put('/update-profile',     protect, updateProfile)
router.put('/change-password',    protect, changePassword)
router.post('/complete-lesson',   protect, completeLesson)
router.put('/notifications',      protect, updateNotifications)

module.exports = router