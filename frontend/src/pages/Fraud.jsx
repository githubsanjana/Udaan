import { useState, useEffect } from 'react'
import { transactionAPI } from '../services/api'

function RiskBadge({ level, risk }) {
  const styles = {
    safe:   'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high:   'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide whitespace-nowrap ${styles[level] || styles.safe}`}>
      {risk}% Risk
    </span>
  )
}

const resultConfig = {
  safe:   { color: 'text-green-400', bar: 'bg-green-500', label: '✅ LOW RISK — Looks Safe', msg: 'No significant fraud indicators. Transaction appears legitimate.' },
  medium: { color: 'text-amber-400', bar: 'bg-amber-500', label: '⚠️ MEDIUM RISK — Verify Before Proceeding', msg: 'Some unusual patterns. Verify the merchant before completing.' },
  high:   { color: 'text-red-400',   bar: 'bg-red-500',   label: '🚨 HIGH RISK — Likely Fraudulent', msg: 'Multiple fraud indicators. Do not proceed. Contact your bank immediately.' },
}

export default function Fraud() {
  const [transactions, setTransactions] = useState([])
  const [amount,   setAmount]   = useState('')
  const [merchant, setMerchant] = useState('')
  const [txType,   setTxType]   = useState('UPI Transfer')
  const [txTime,   setTxTime]   = useState('Business Hours (9AM–6PM)')
  const [location, setLocation] = useState('Usual Location')
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState('')

  // Load transactions from backend on mount
  useEffect(() => {
    transactionAPI.getAll()
      .then(data => {
        if (data.transactions?.length > 0) {
          const formatted = data.transactions.map(t => ({
            id:      t._id,
            merchant: t.merchant,
            meta:    `${new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · ${t.txType}`,
            amount:  `−₹${t.amount.toLocaleString('en-IN')}`,
            risk:    t.riskScore,
            level:   t.riskLevel,
            icon:    t.riskLevel === 'high' ? '⚠️' : t.riskLevel === 'medium' ? '⚡' : '✓',
            iconBg:  t.riskLevel === 'high' ? 'bg-red-500/10' : t.riskLevel === 'medium' ? 'bg-amber-500/10' : 'bg-green-500/10',
            flagged: t.flagged,
          }))
          setTransactions(formatted)
        }
      })
      .catch(() => {})
  }, [])

  const suspiciousCount = transactions.filter(t => t.level === 'high').length

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function downloadReport() {
    const headers = ['Merchant', 'Amount', 'Risk %', 'Status', 'Date']
    const rows    = transactions.map(t => [`"${t.merchant}"`, `"${t.amount}"`, t.risk, (t.level || 'safe').toUpperCase(), `"${t.meta}"`])
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href = url; a.download = `udaan-fraud-report-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    showToast('Report downloaded!')
  }

  async function analyze() {
    if (!amount && !merchant) { showToast('Please enter amount or merchant name'); return }
    setLoading(true)
    setResult(null)

    try {
      const data  = await transactionAPI.analyze(merchant || 'Unknown Merchant', parseFloat(amount) || 0, txType, txTime, location)
      const level = data.riskLevel
      const score = data.riskScore
      const t     = data.transaction

      setResult({ score, level })

      // Add ONE entry to UI
      const newTx = {
        id:      t._id,
        merchant: t.merchant,
        meta:    `${new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · ${t.txType}`,
        amount:  `−₹${t.amount.toLocaleString('en-IN')}`,
        risk:    score, level,
        icon:    level === 'high' ? '⚠️' : level === 'medium' ? '⚡' : '✓',
        iconBg:  level === 'high' ? 'bg-red-500/10' : level === 'medium' ? 'bg-amber-500/10' : 'bg-green-500/10',
        flagged: level === 'high',
      }
      setTransactions(prev => [newTx, ...prev])

      if (level === 'high')        showToast('🚨 High risk! Saved to database')
      else if (level === 'medium') showToast('⚠️ Medium risk — verify this transaction')
      else                         showToast('✅ Transaction looks safe!')

    } catch (err) {
      showToast('❌ Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c2038] border border-indigo-500/30 text-slate-200 text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1">⚡ Fraud Detection System</h1>
        <p className="text-sm text-slate-400">Real-time ML-powered transaction monitoring. Powered by Random Forest.</p>
      </div>

      {/* Alert Banner */}
      <div className={`flex items-center gap-4 rounded-xl px-5 py-4 mb-6 border ${suspiciousCount > 0 ? 'bg-red-500/5 border-red-500/25' : 'bg-green-500/5 border-green-500/20'}`}>
        <span className="text-xl">{suspiciousCount > 0 ? '🚨' : '✅'}</span>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${suspiciousCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {suspiciousCount > 0 ? `${suspiciousCount} suspicious transaction${suspiciousCount > 1 ? 's' : ''} detected` : 'No suspicious transactions — you are safe!'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {suspiciousCount > 0 ? 'Review flagged transactions below' : 'All recent transactions look legitimate'}
          </div>
        </div>
        <button onClick={downloadReport}
          className="text-xs font-semibold px-4 py-2 bg-[#1c2038] border border-[#1c2038] rounded-lg text-slate-300 hover:bg-[#252840] transition whitespace-nowrap">
          ⬇ Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transaction List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Recent Transactions</h2>
            <span className="text-xs text-slate-500">{transactions.length} total · {suspiciousCount} flagged</span>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">💳</div>
              <div className="text-slate-400 text-sm">No transactions yet — analyze one below!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div key={tx.id || idx}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
                    tx.level === 'high'   ? 'bg-red-500/3 border-red-500/20 hover:border-red-500/30'
                    : tx.level === 'medium' ? 'bg-amber-500/3 border-amber-500/15 hover:border-amber-500/30'
                    : 'bg-[#161929] border-[#1c2038] hover:border-indigo-500/30'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${tx.iconBg || 'bg-green-500/10'}`}>
                    {tx.icon || '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{tx.merchant}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{tx.meta}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className={`font-black text-sm ${tx.level === 'high' ? 'text-red-400' : 'text-slate-200'}`}>{tx.amount}</div>
                    <RiskBadge level={tx.level} risk={tx.risk} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyzer Panel */}
        <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6 self-start sticky top-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-bold text-sm">ML Fraud Analyzer</h3>
            <span className="text-[10px] text-slate-500 ml-auto">Random Forest</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 5000"
                className="w-full bg-[#111427] border border-[#1c2038] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Merchant / Description</label>
              <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Unknown Merchant"
                className="w-full bg-[#111427] border border-[#1c2038] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Transaction Type</label>
              <select value={txType} onChange={e => setTxType(e.target.value)}
                className="w-full bg-[#111427] border border-[#1c2038] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer">
                <option>UPI Transfer</option><option>Debit Card</option><option>Credit Card</option>
                <option>Net Banking</option><option>International</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Time of Transaction</label>
              <select value={txTime} onChange={e => setTxTime(e.target.value)}
                className="w-full bg-[#111427] border border-[#1c2038] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer">
                <option>Business Hours (9AM–6PM)</option><option>Evening (6PM–11PM)</option>
                <option>Late Night (11PM–3AM)</option><option>Early Morning (3AM–9AM)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Location Pattern</label>
              <select value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-[#111427] border border-[#1c2038] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer">
                <option>Usual Location</option><option>Different City</option>
                <option>International</option><option>Multiple rapid locations</option>
              </select>
            </div>

            <button onClick={analyze} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {loading ? '⏳ Analyzing...' : '⚡ Analyze Transaction'}
            </button>
          </div>

          {result && (
            <div className="mt-5 p-4 bg-[#111427] border border-[#1c2038] rounded-lg">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Risk Score</div>
              <div className={`text-4xl font-black text-center my-3 ${resultConfig[result.level]?.color}`}>{result.score}%</div>
              <div className="text-xs text-slate-400 text-center mb-3">{resultConfig[result.level]?.label}</div>
              <div className="h-1.5 bg-[#1c2038] rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all duration-700 ${resultConfig[result.level]?.bar}`} style={{ width: `${result.score}%` }} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{resultConfig[result.level]?.msg}</p>
              {/* {result.level === 'high' && (
                <div className="mt-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2 text-center font-semibold">
                  ⚠️ Saved to MongoDB database
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}