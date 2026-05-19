const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')

// Modules are stored in frontend for now
// This route will serve module data in future
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Modules served from frontend context' })
})

module.exports = router