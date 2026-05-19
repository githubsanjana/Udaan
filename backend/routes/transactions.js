const express = require('express')
const router  = express.Router()
const { analyzeTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController')
const { protect } = require('../middleware/auth')

router.post('/analyze',   protect, analyzeTransaction)
router.get('/',           protect, getTransactions)
router.delete('/:id',     protect, deleteTransaction)

module.exports = router