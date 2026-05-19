import { createContext, useContext, useState, useEffect } from 'react'
import { userAPI, transactionAPI, getToken } from '../services/api'

// ── Initial Modules Data ───────────────────────────────────
const initialModules = [
  {
    id: 'budgeting', title: 'Smart Budgeting', emoji: '💰', color: 'indigo',
    lessons: [
      { id: 'b1', videoId: 'Yom_1yw5FIo', num: '01', title: 'What is a Budget?', desc: 'Understanding income, expenses, and why budgeting is the foundation of financial health.', duration: '8 min', xp: 80, completed: false,
        content: `A budget is a plan for your money. It tells your rupees where to go instead of wondering where they went.\n\nKey concepts:\n• Income — money coming in (salary, freelance, business)\n• Expenses — money going out (rent, food, travel, fun)\n• Surplus — income minus expenses (positive = good!)\n• Deficit — spending more than you earn (danger zone!)\n\nWhy budget?\nMost people overspend not because they earn less, but because they don't track. A simple budget gives you clarity, control, and confidence over your finances.\n\nReal example:\nRamesh earns ₹40,000/month. Without a budget he runs out by the 20th. With a budget, he saves ₹6,000 every month. Same income — completely different result.`,
        quiz: [ { q: 'What is a budget?', opts: ['A loan from bank', 'A plan for your money', 'A type of investment', 'A savings account'], ans: 1 }, { q: 'What is a surplus?', opts: ['Spending more than income', 'Income minus expenses (positive)', 'A type of expense', 'Monthly salary'], ans: 1 } ] },
      { id: 'b2', videoId: 'uYNfT6B2Hqg', num: '02', title: 'Tracking Your Spending', desc: 'Tools and habits for tracking daily expenses — apps, notebooks, and categorization.', duration: '10 min', xp: 80, completed: false,
        content: `You cannot improve what you don't measure. Tracking spending is the first real step to financial control.\n\nMethods to track:\n• Apps — Walnut, Money Manager, YNAB\n• Spreadsheet — simple Excel or Google Sheets\n• Notebook — old school but works great\n\nCategories to track:\n1. Needs — rent, groceries, electricity, medicine\n2. Wants — eating out, shopping, entertainment\n3. Savings — SIP, FD, emergency fund\n\nPro tip:\nReview your spending every Sunday for 10 minutes. This single habit can save you ₹2,000–5,000 per month.`,
        quiz: [ { q: 'Which of these is a "Need"?', opts: ['Netflix subscription', 'Monthly rent', 'Weekend dining', 'New shoes'], ans: 1 }, { q: 'Best time to review your weekly spending?', opts: ['Never', 'Every Sunday', 'Once a year', 'Only when broke'], ans: 1 } ] },
      { id: 'b3', videoId: 'WkTuyRqIOA0', num: '03', title: 'The 50/30/20 Rule', desc: 'Allocate 50% needs, 30% wants, 20% savings — a simple framework for any income.', duration: '12 min', xp: 100, completed: false,
        content: `The 50/30/20 rule is the simplest budgeting framework.\n\nHow it works:\n• 50% → Needs (rent, food, bills, transport)\n• 30% → Wants (dining out, movies, shopping)\n• 20% → Savings & investments\n\nExample with ₹50,000 salary:\n• ₹25,000 → Needs\n• ₹15,000 → Wants\n• ₹10,000 → Savings`,
        quiz: [ { q: 'In the 50/30/20 rule, what % goes to savings?', opts: ['10%', '30%', '20%', '50%'], ans: 2 }, { q: 'You earn ₹60,000. How much should go to Needs?', opts: ['₹12,000', '₹18,000', '₹30,000', '₹60,000'], ans: 2 } ] },
      { id: 'b4', videoId: '6mQTmaxlXM4', num: '04', title: 'Zero-Based Budgeting', desc: 'Every rupee has a job — learn the zero-based method for total control.', duration: '10 min', xp: 100, completed: false,
        content: `Zero-based budgeting means: Income - All Expenses = Zero.\n\nExample:\nIncome: ₹50,000\n• Rent: ₹12,000\n• Groceries: ₹6,000\n• SIP: ₹8,000\n• Emergency fund: ₹2,000\n• Entertainment: ₹4,000\n• Remaining to savings: ₹18,000\nTotal: ₹50,000 ✓`,
        quiz: [ { q: 'In zero-based budgeting, Income minus All Expenses equals?', opts: ['Your profit', 'Zero', 'Your savings', '10% of income'], ans: 1 }, { q: 'Zero-based budgeting is best for?', opts: ['People who hate math', 'Aggressive savers', 'Only rich people', 'Only businesses'], ans: 1 } ] },
    ]
  },
  {
    id: 'saving', title: 'Saving Strategies', emoji: '🏦', color: 'cyan',
    lessons: [
      { id: 's1', videoId: 'cosjtcWyWlI', num: '01', title: 'Why Save at All?', desc: 'The psychology of saving and how small amounts compound over time.', duration: '7 min', xp: 80, completed: false,
        content: `Saving is not about how much you earn — it's about the gap between what you earn and what you spend.\n\nThe power of compound interest:\n₹1,000/month at 12% for 20 years = ₹9.99 lakhs\n₹1,000/month at 12% for 30 years = ₹34.95 lakhs\n\nThe golden rule:\nPay yourself first. Transfer savings before spending anything.`,
        quiz: [ { q: 'What is compound interest?', opts: ['Interest on loan only', 'Earning interest on interest', 'Fixed bank rate', 'Government scheme'], ans: 1 }, { q: 'What does "pay yourself first" mean?', opts: ['Buy what you want first', 'Save before spending', 'Pay your EMIs first', 'Invest in stocks first'], ans: 1 } ] },
      { id: 's2', videoId: 'g-hir-4WzfU', num: '02', title: 'Emergency Fund', desc: 'How to build a 3–6 month safety net and where to keep it.', duration: '10 min', xp: 80, completed: false,
        content: `An emergency fund is 3–6 months of expenses kept liquid.\n\nWhat counts as emergency?\n✅ Job loss\n✅ Medical emergency\n✅ Major home repair\n\nWhat does NOT count?\n❌ Sale on Amazon\n❌ Vacation\n❌ New phone\n\nWhere to keep it:\n• High-interest savings account\n• Liquid mutual fund\n• NOT in stocks`,
        quiz: [ { q: 'How many months of expenses should emergency fund cover?', opts: ['1 month', '3-6 months', '10 months', '2 years'], ans: 1 }, { q: 'Where should you NOT keep emergency fund?', opts: ['Liquid mutual fund', 'Savings account', 'Stock market', 'FD'], ans: 2 } ] },
      { id: 's3', videoId: 'UzNk9iM7O48', num: '03', title: 'SIPs Explained', desc: 'Systematic Investment Plans — start with just ₹500/month.', duration: '12 min', xp: 100, completed: false,
        content: `SIP means investing a fixed amount every month automatically.\n\nWhy SIP works:\n• Rupee cost averaging\n• Discipline — automatic\n• Start with ₹500/month\n\nHow to start:\n1. Get KYC done (Aadhaar + PAN)\n2. Choose Groww or Zerodha\n3. Select index fund\n4. Set SIP amount and date`,
        quiz: [ { q: 'What does SIP stand for?', opts: ['Safe Investment Plan', 'Systematic Investment Plan', 'Standard Income Protocol', 'Savings Interest Plan'], ans: 1 }, { q: 'Minimum SIP amount?', opts: ['₹10,000', '₹5,000', '₹500', '₹50,000'], ans: 2 } ] },
    ]
  },
  {
    id: 'investing', title: 'Investing Basics', emoji: '📈', color: 'green',
    lessons: [
      { id: 'i1', videoId: 'JS1imtdTZxU', num: '01', title: 'Why Invest at All?', desc: 'Beat inflation, grow wealth, and understand why keeping money idle is risky.', duration: '7 min', xp: 80, completed: false,
        content: `Inflation silently eats your money.\n\nSaving vs Investing:\n• Savings account: 3-4% return\n• FD: 6-7% return\n• Mutual funds: 10-14% return\n\n₹1 lakh for 20 years:\n• Savings account (4%): ₹2.19 lakhs\n• Index fund (12%): ₹9.65 lakhs`,
        quiz: [ { q: 'What does inflation do to your money?', opts: ['Increases its value', 'Reduces its purchasing power', 'Has no effect', 'Doubles it'], ans: 1 }, { q: 'Which gives highest long-term return?', opts: ['Savings account', 'FD', 'Equity mutual funds', 'Cash at home'], ans: 2 } ] },
      { id: 'i2', videoId: 'rcA2PycBQr4', num: '02', title: 'Mutual Funds & SIPs', desc: 'How to start investing with just ₹500/month using systematic plans.', duration: '15 min', xp: 120, completed: false,
        content: `A mutual fund pools money from thousands of investors.\n\nTypes:\n• Equity funds — high return, high risk\n• Debt funds — lower return, lower risk\n• Index funds — track Nifty/Sensex, best for beginners\n\nWhy index funds?\n• Low cost (expense ratio ~0.1%)\n• Beats 80% of actively managed funds`,
        quiz: [ { q: 'What is an index fund?', opts: ['A bank FD', 'A fund tracking Nifty/Sensex', 'Only for rich investors', 'A government scheme'], ans: 1 }, { q: 'Best strategy during market fall?', opts: ['Stop SIP', 'Withdraw everything', 'Continue or increase SIP', 'Switch to FD'], ans: 2 } ] },
      { id: 'i3', videoId: 'GT_auP0fh90', num: '03', title: 'Stock Markets', desc: 'BSE, NSE, Sensex, Nifty — demystifying the Indian stock market.', duration: '18 min', xp: 150, completed: false,
        content: `The stock market is where shares are bought and sold.\n\nIndian Markets:\n• BSE — oldest in Asia, 5000+ companies\n• NSE — more volume, tech-focused\n\nIndices:\n• Sensex — top 30 on BSE\n• Nifty 50 — top 50 on NSE\n\nWarning: Never invest based on WhatsApp tips!`,
        quiz: [ { q: 'What is Nifty 50?', opts: ['50 richest people', 'Top 50 companies on NSE', 'A bank scheme', 'A savings plan'], ans: 1 }, { q: 'What should you NOT do?', opts: ['Research company', 'Invest long term', 'Follow WhatsApp tips', 'Use Demat account'], ans: 2 } ] },
    ]
  },
  {
    id: 'fraud', title: 'Fraud Prevention', emoji: '🛡️', color: 'amber',
    lessons: [
      { id: 'f1', videoId: 'XGDIdmoLOKE', num: '01', title: 'Common Scam Types', desc: 'Phishing, fake lottery, UPI fraud — know your enemy.', duration: '8 min', xp: 80, completed: false,
        content: `Top scams in India:\n1. UPI Fraud — scammer sends collect request\n2. Fake lottery — "You won ₹25 lakhs"\n3. Phishing — fake bank websites\n4. Investment scam — "Guaranteed 30% returns"\n\nRed flags:\n• Urgency — "Act now!"\n• Too good to be true\n• Asking for OTP, PIN, CVV`,
        quiz: [ { q: 'In UPI fraud, what does scammer send?', opts: ['Free money', 'A collect request', 'A genuine bill', 'An OTP'], ans: 1 }, { q: 'Which is a RED FLAG?', opts: ['Bank sends statement', 'Urgency to act now', 'Salary credited', 'Bill reminder'], ans: 1 } ] },
      { id: 'f2', videoId: 'ZFkAkN5T8_0', num: '02', title: 'Protecting Your UPI', desc: 'Never share OTP, PIN rules, and safe transaction habits.', duration: '10 min', xp: 100, completed: false,
        content: `Golden rules:\n1. NEVER share UPI PIN with anyone\n2. Receiving money NEVER requires PIN\n3. Check UPI ID before paying\n4. Don't click links from unknown numbers\n\nIf scammed:\n• Call 1930 (Cyber Crime helpline)\n• Block UPI in bank app\n• File at cybercrime.gov.in`,
        quiz: [ { q: 'When do you enter UPI PIN?', opts: ['While receiving money', 'While sending money', 'While checking balance', 'While adding beneficiary'], ans: 1 }, { q: 'Cyber Crime helpline?', opts: ['100', '1930', '112', '1800'], ans: 1 } ] },
      { id: 'f3', videoId: '809wsGVIHsI', num: '03', title: 'Online Safety', desc: 'Secure browsing, fake websites, and social engineering.', duration: '12 min', xp: 100, completed: false,
        content: `Safe browsing:\n• Always check URL spelling\n• Never enter passwords on public WiFi\n• Use different passwords for accounts\n• Enable 2FA everywhere\n\nSocial engineering:\n• "Your account will be blocked"\n• "You have a refund of ₹4,999"\n\nPassword safety:\n• Minimum 12 characters\n• Mix letters, numbers, symbols`,
        quiz: [ { q: 'How to identify fake website?', opts: ['Check design', 'Check URL for misspellings', 'Check if loads fast', 'See images'], ans: 1 }, { q: 'What is social engineering?', opts: ['Building apps', 'Manipulating people to steal info', 'A type of encryption', 'Network security'], ans: 1 } ] },
    ]
  },
]

const initialTransactions = [
  { id: 1, merchant: 'Unknown Merchant · Mumbai', meta: 'Dec 15, 2024 · 11:34 PM · International', amount: '−₹12,500', risk: 87, level: 'high', icon: '⚠️', iconBg: 'bg-red-500/10', flagged: true },
  { id: 2, merchant: 'Amazon India · Online', meta: 'Dec 14, 2024 · 3:20 PM · Debit Card', amount: '−₹2,349', risk: 4, level: 'safe', icon: '✓', iconBg: 'bg-green-500/10', flagged: false },
  { id: 3, merchant: 'Lucky Draw Prize · SMS Link', meta: 'Dec 13, 2024 · 9:12 AM · UPI', amount: '−₹500', risk: 92, level: 'high', icon: '⚠️', iconBg: 'bg-red-500/10', flagged: true },
  { id: 4, merchant: 'Zepto Groceries · Bengaluru', meta: 'Dec 12, 2024 · 7:45 PM · UPI', amount: '−₹876', risk: 2, level: 'safe', icon: '✓', iconBg: 'bg-green-500/10', flagged: false },
  { id: 5, merchant: 'Unknown UPI ID · New Contact', meta: 'Dec 11, 2024 · 12:00 AM · UPI', amount: '−₹3,000', risk: 54, level: 'medium', icon: '⚡', iconBg: 'bg-amber-500/10', flagged: false },
]

// ── Streak helpers ─────────────────────────────────────────
function getTodayKey() { return new Date().toISOString().slice(0, 10) }

function sendBrowserNotif(title, body) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') new Notification(title, { body, icon: '/vite.svg' })
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [modules,      setModules]      = useState(initialModules)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [activity,     setActivity]     = useState([])
  const [quizHistory,  setQuizHistory]  = useState([])
  const [backendUser,  setBackendUser]  = useState(null)
  const [loadingUser,  setLoadingUser]  = useState(true)

  // ── Streak from backend or localStorage ───────────────────
  const streak     = backendUser?.streak     || 0
  const streakDays = backendUser?.streakDays || []

  // ── Load user data from backend on mount ──────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const token = getToken()
    if (!token) { setLoadingUser(false); return }

    userAPI.getDashboard()
      .then(data => {
        const u = data.user
        setBackendUser(u)

        // Restore completed lessons
        if (u.completedLessons?.length > 0) {
          setModules(prev => prev.map(mod => ({
            ...mod,
            lessons: mod.lessons.map(l => ({
              ...l,
              completed: u.completedLessons.some(cl => cl.moduleId === mod.id && cl.lessonId === l.id)
            }))
          })))
        }

        // Restore quiz history
        if (u.quizHistory?.length > 0) setQuizHistory(u.quizHistory)

        // Restore transactions from backend
        transactionAPI.getAll().then(txData => {
          if (txData.transactions?.length > 0) {
            const backendTx = txData.transactions.map(t => ({
              id:      t._id,
              merchant: t.merchant,
              meta:    `${new Date(t.createdAt).toLocaleDateString('en-IN')} · ${t.txType}`,
              amount:  `−₹${t.amount.toLocaleString('en-IN')}`,
              risk:    t.riskScore,
              level:   t.riskLevel,
              icon:    t.riskLevel === 'high' ? '⚠️' : t.riskLevel === 'medium' ? '⚡' : '✓',
              iconBg:  t.riskLevel === 'high' ? 'bg-red-500/10' : t.riskLevel === 'medium' ? 'bg-amber-500/10' : 'bg-green-500/10',
              flagged: t.flagged,
            }))
            setTransactions([...backendTx, ...initialTransactions])
          }
        }).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false))
  }, [])

  // ── Computed Stats ─────────────────────────────────────────
  const allLessons      = modules.flatMap(m => m.lessons)
  const completedArr    = allLessons.filter(l => l.completed)
  const totalXP         = backendUser?.xp ?? completedArr.reduce((s, l) => s + l.xp, 0)
  const totalLessons    = allLessons.length
  const overallProgress = totalLessons > 0 ? Math.round((completedArr.length / totalLessons) * 100) : 0
  const fraudAlerts     = transactions.filter(t => t.level === 'high' || t.riskLevel === 'high').length
  const avgScore        = quizHistory.length > 0 ? Math.round(quizHistory.reduce((s, q) => s + q.score, 0) / quizHistory.length) : 0
  const level           = backendUser?.level ?? (Math.floor(totalXP / 1000) + 1)
  const xpForNextLevel  = level * 1000
  const xpProgress      = Math.min(100, Math.round(((totalXP % 1000) / 1000) * 100))

  // ── Dynamic Badges ─────────────────────────────────────────
  const earnedBadges = []
  if (completedArr.length >= 1)  earnedBadges.push('First Lesson')
  if (completedArr.length >= 5)  earnedBadges.push('Quiz Master')
  if (streak >= 7)               earnedBadges.push('7-Day Streak')
  if (streak >= 30)              earnedBadges.push('Speed Runner')
  if (avgScore >= 90)            earnedBadges.push('Top Scorer')
  if (modules.find(m => m.id === 'fraud')?.lessons.some(l => l.completed))    earnedBadges.push('Fraud Aware')
  if (modules.find(m => m.id === 'saving')?.lessons.every(l => l.completed))  earnedBadges.push('Saver Pro')
  if (modules.find(m => m.id === 'investing')?.lessons.every(l => l.completed)) earnedBadges.push('Investor')

  // ── Streak Calendar dots ───────────────────────────────────
  const streakDotsList = Array.from({ length: 14 }, (_, i) => {
    const d    = new Date(Date.now() - (13 - i) * 86400000)
    const key  = d.toISOString().slice(0, 10)
    const label = ['S','M','T','W','T','F','S'][d.getDay()]
    return { label, isToday: key === getTodayKey(), done: streakDays.includes(key) }
  })

  // ── Actions ────────────────────────────────────────────────
  async function completeLesson(moduleId, lessonId, quizScore) {
    const mod    = modules.find(m => m.id === moduleId)
    const lesson = mod?.lessons.find(l => l.id === lessonId)
    if (!lesson) return

    // Update UI immediately
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l) } : m
    ))

    // Save to backend
    try {
      const grade = quizScore >= 90 ? 'A+' : quizScore >= 80 ? 'A' : quizScore >= 70 ? 'B+' : 'B'
      const res = await userAPI.completeLesson(moduleId, lessonId, lesson.xp, quizScore, grade, mod.title)
      if (res.xp) setBackendUser(prev => prev ? { ...prev, xp: res.xp, level: res.level } : prev)
    } catch (err) {
      console.log('Backend save failed, using local:', err.message)
    }

    // Save quiz history
    if (quizScore !== undefined) {
      const grade = quizScore >= 90 ? 'A+' : quizScore >= 80 ? 'A' : quizScore >= 70 ? 'B+' : 'B'
      const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      setQuizHistory(prev => [{ module: mod.title, score: quizScore, grade, date: today }, ...prev])
    }

    // Track XP in localStorage for weekly chart
    try {
      const xpLog = JSON.parse(localStorage.getItem('udaan_xp_log') || '{}')
      xpLog[getTodayKey()] = (xpLog[getTodayKey()] || 0) + lesson.xp
      localStorage.setItem('udaan_xp_log', JSON.stringify(xpLog))
    } catch {}

    setActivity(prev => [
      { icon: '📗', bg: 'bg-indigo-500/10 text-indigo-300', title: `Completed: "${lesson.title}"`, sub: `${mod.title} · +${lesson.xp} XP`, time: 'Just now' },
      ...(quizScore !== undefined ? [{ icon: '✓', bg: 'bg-green-500/10 text-green-400', title: `Quiz passed: ${quizScore}%`, sub: mod.title, time: 'Just now' }] : []),
      ...prev.slice(0, 6),
    ])
  }

  async function addFraudAlert(merchant, risk, amount, txType, level) {
    const now    = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const amtStr = amount ? `−₹${parseFloat(amount).toLocaleString('en-IN')}` : '−₹?'
    const icon   = level === 'high' ? '⚠️' : level === 'medium' ? '⚡' : '✓'
    const iconBg = level === 'high' ? 'bg-red-500/10' : level === 'medium' ? 'bg-amber-500/10' : 'bg-green-500/10'

    // Just update UI — API call already done in Fraud.jsx
    setTransactions(prev => [{
      id: Date.now(), merchant: merchant || 'Unknown',
      meta: `${now} · ${txType || 'Manual'}`,
      amount: amtStr, risk, level, icon, iconBg, flagged: level === 'high',
    }, ...prev])

    if (level === 'high') {
      sendBrowserNotif('🚨 Fraud Alert — Udaan', `High risk: ${merchant} — ${risk}% risk`)
      setActivity(prev => [{ icon: '⚠️', bg: 'bg-red-500/10 text-red-400', title: 'Suspicious transaction flagged', sub: `${merchant} · Risk: ${risk}%`, time: 'Just now' }, ...prev.slice(0, 6)])
    } else if (level === 'medium') {
      setActivity(prev => [{ icon: '⚡', bg: 'bg-amber-500/10 text-amber-400', title: 'Transaction needs review', sub: `${merchant} · Risk: ${risk}%`, time: 'Just now' }, ...prev.slice(0, 6)])
    }
  }

  function moduleProgress(moduleId) {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return 0
    return Math.round((mod.lessons.filter(l => l.completed).length / mod.lessons.length) * 100)
  }

  return (
    <AppContext.Provider value={{
      modules, transactions, activity, quizHistory, loadingUser,
      totalXP, totalLessons, completedLessons: completedArr.length,
      overallProgress, fraudAlerts, streak, streakDots: streakDotsList,
      level, xpForNextLevel, xpProgress, avgScore, earnedBadges,
      completeLesson, addFraudAlert, moduleProgress,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }