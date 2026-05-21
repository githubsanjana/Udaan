const Transaction = require('../models/Transaction')
const User = require('../models/User')
const { sendFraudAlertEmail } = require('../services/emailService')

const ML_SERVICE_URL = 'https://udaan-ml.onrender.com/predict'
// ── Call ML Service ─────────────────────────────────────────
async function getMLScore(merchant, amount, txType, txTime, location) {
  try {
    const response = await fetch(ML_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, amount, txType, txTime, location }),
      signal: AbortSignal.timeout(5000),
    })
    const data = await response.json()
    if (data.success) return { score: data.riskScore, level: data.riskLevel }
  } catch (err) {
    console.log('⚠️  ML service unavailable, using rule-based scoring:', err.message)
  }
  return null
}

// ── Rule-based fallback ─────────────────────────────────────
function ruleBasedScore(merchant, amount, txType, txTime, location) {
  let score = 0
  const amt   = parseFloat(amount) || 0
  const merch = (merchant || '').toLowerCase()

  if (amt > 10000) score += 25
  else if (amt > 5000) score += 15
  else if (amt > 1000) score += 5

  const suspiciousWords = ['unknown','lottery','prize','lucky','winner','free','claim','urgent','reward']
  if (suspiciousWords.some(w => merch.includes(w))) score += 35
  if (!merchant) score += 20
  if (txType === 'International') score += 20
  if (txTime && (txTime.includes('Late Night') || txTime.includes('Early Morning'))) score += 15
  if (location) {
    if (location.includes('International')) score += 20
    else if (location.includes('Multiple'))  score += 25
    else if (location.includes('Different')) score += 10
  }

  score = Math.min(98, Math.max(2, score + Math.floor(Math.random() * 8)))
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'safe'
  return { score, level }
}

// ── @POST /api/transactions/analyze ────────────────────────
const analyzeTransaction = async (req, res) => {
  try {
    const { merchant, amount, txType, txTime, location } = req.body

    let result = await getMLScore(merchant, amount, txType, txTime, location)
    const usedML = !!result
    if (!result) result = ruleBasedScore(merchant, amount, txType, txTime, location)

    const { score, level } = result

    const transaction = await Transaction.create({
      user:      req.user.id,
      merchant:  merchant || 'Unknown Merchant',
      amount:    parseFloat(amount) || 0,
      txType:    txType    || 'UPI Transfer',
      txTime:    txTime    || 'Business Hours (9AM–6PM)',
      location:  location  || 'Usual Location',
      riskScore: score,
      riskLevel: level,
      flagged:   level === 'high',
    })

    console.log(`✅ Transaction — Risk: ${score}% (${level}) — ${usedML ? '🤖 ML Model' : '📏 Rule-based'}`)

    // Send fraud alert email if high risk
    if (level === 'high') {
      try {
        const user = await User.findById(req.user.id)
        if (user?.notifications?.fraud !== false) {
          sendFraudAlertEmail(user.name, user.email, merchant, score, amount)
        }
      } catch (e) { console.log('Email error:', e.message) }
    }

    res.json({
      success: true, riskScore: score, riskLevel: level,
      flagged: level === 'high',
      modelUsed: usedML ? 'random_forest' : 'rule_based',
      transaction,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @GET /api/transactions ──────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, transactions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── @DELETE /api/transactions/:id ──────────────────────────
const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id })
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' })
    await tx.deleteOne()
    res.json({ success: true, message: 'Transaction deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { analyzeTransaction, getTransactions, deleteTransaction }