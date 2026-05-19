import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { userAPI } from '../services/api'

const allBadges = [
  { icon: '🔥', label: '7-Day Streak',  hint: 'Maintain a 7-day login streak'     },
  { icon: '📚', label: 'First Lesson',  hint: 'Complete your first lesson'         },
  { icon: '💡', label: 'Quiz Master',   hint: 'Complete 5 lessons'                 },
  { icon: '🛡️', label: 'Fraud Aware',  hint: 'Complete a Fraud Prevention lesson' },
  { icon: '🏆', label: 'Top Scorer',    hint: 'Get 90%+ average quiz score'        },
  { icon: '⚡', label: 'Speed Runner',  hint: 'Maintain a 30-day streak'           },
  { icon: '💰', label: 'Saver Pro',     hint: 'Complete all Saving lessons'        },
  { icon: '📈', label: 'Investor',      hint: 'Complete all Investing lessons'     },
  { icon: '🎯', label: 'Perfectionist', hint: 'Score 100% on any quiz'             },
  { icon: '🌟', label: 'All-Star',      hint: 'Unlock all other badges'            },
]

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-500' : 'bg-[#1c2038] border border-[#2a2f4a]'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

function Toast({ msg, type }) {
  const colors = { success: 'border-green-500/30 text-green-300', info: 'border-indigo-500/30 text-slate-200', error: 'border-red-500/30 text-red-300' }
  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-[#1c2038] border text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 ${colors[type] || colors.info}`}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {msg}
    </div>
  )
}

// ── Edit Profile Modal ──────────────────────────────────────
function EditModal({ user, onClose, onSave }) {
  const [tab, setTab]                   = useState('profile') // profile | password
  const [name, setName]                 = useState(user.name || '')
  const [email, setEmail]               = useState(user.email || '')
  const [currentPass, setCurrentPass]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirmPass]   = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  async function saveProfile() {
    setError('')
    if (!name.trim()) { setError('Name cannot be empty'); return }
    if (!email.includes('@')) { setError('Invalid email'); return }
    setLoading(true)
    try {
      await userAPI.updateProfile(name.trim(), email.trim())
      localStorage.setItem('udaan_user', JSON.stringify({ ...user, name: name.trim(), email: email.trim() }))
      onSave(name.trim(), email.trim())
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function savePassword() {
    setError('')
    if (!currentPass) { setError('Enter current password'); return }
    if (newPass.length < 6) { setError('New password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await userAPI.changePassword(currentPass, newPass)
      onClose()
      onSave(null, null, 'Password changed successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-[#111427] border border-[#1c2038] focus:border-indigo-500 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition"

  return (
    <div className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161929] border border-indigo-500/30 rounded-2xl w-full max-w-md relative">

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1c2038] text-slate-400 hover:text-slate-200 flex items-center justify-center transition">✕</button>

        <div className="p-6 border-b border-[#1c2038]">
          <h2 className="font-black text-lg text-slate-100">Edit Profile</h2>
          <p className="text-xs text-slate-500 mt-1">Update your personal information</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#111427] mx-6 mt-4 rounded-xl p-1">
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {t === 'profile' ? '👤 Profile' : '🔒 Password'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {tab === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your name" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputCls} placeholder="your@email.com" />
              </div>
              <button onClick={saveProfile} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all disabled:opacity-60">
                {loading ? '⏳ Saving...' : 'Save Changes →'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Current Password</label>
                <input value={currentPass} onChange={e => setCurrentPass(e.target.value)} type="password" className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" className={inputCls} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
                <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type="password" className={inputCls} placeholder="Repeat new password" />
              </div>
              {newPass && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full ${newPass.length >= i*3 ? i<=1?'bg-red-500':i<=2?'bg-amber-500':i<=3?'bg-yellow-400':'bg-green-500' : 'bg-[#1c2038]'}`} />
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500">{newPass.length < 6 ? 'Too short' : newPass.length < 9 ? 'Weak' : newPass.length < 12 ? 'Good' : '✓ Strong'}</div>
                </div>
              )}
              <button onClick={savePassword} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all disabled:opacity-60">
                {loading ? '⏳ Changing...' : 'Change Password →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Profile Page ───────────────────────────────────────
export default function Profile() {
  const { totalXP, streak, level, completedLessons, quizHistory, avgScore, earnedBadges, transactions } = useApp()

  const userRaw = localStorage.getItem('udaan_user')
  const [user, setUser] = useState(userRaw ? JSON.parse(userRaw) : { name: 'User', email: 'user@udaan.in' })
  const initial = user.name?.charAt(0).toUpperCase() || 'U'

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('udaan_notif') || '{"daily":true,"fraud":true,"weekly":false}') }
    catch { return { daily: true, fraud: true, weekly: false } }
  })
  const [toast,          setToast]          = useState(null)
  const [showEdit,       setShowEdit]       = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [hoveredBadge,   setHoveredBadge]   = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function handleSave(newName, newEmail, customMsg) {
    if (newName && newEmail) {
      setUser(prev => ({ ...prev, name: newName, email: newEmail }))
      showToast(customMsg || 'Profile updated successfully!')
    } else if (customMsg) {
      showToast(customMsg)
    }
  }

  async function updateNotif(key, val) {
    const updated = { ...notifPrefs, [key]: val }
    setNotifPrefs(updated)
    localStorage.setItem('udaan_notif', JSON.stringify(updated))
    try { await userAPI.updateNotifications(updated.daily, updated.fraud, updated.weekly) } catch {}
    showToast('Setting saved')
  }

  function exportJSON() {
    const data = {
      user: { name: user.name, email: user.email, exportedAt: new Date().toISOString() },
      stats: { totalXP, streak, level, completedLessons, avgScore },
      quizHistory, earnedBadges,
      transactions: transactions.map(t => ({ merchant: t.merchant, amount: t.amount || '?', risk: t.risk || 0, status: t.level || t.riskLevel || 'safe' })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `udaan-data-${new Date().toISOString().slice(0,10)}.json`; a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
    showToast('Data exported!')
  }

  function exportCSV() {
    const headers = ['Merchant', 'Amount', 'Risk %', 'Status']
    const rows    = transactions.map(t => [`"${t.merchant}"`, `"${t.amount || '?'}"`, t.risk || 0, (t.level || t.riskLevel || 'safe').toUpperCase()])
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href = url; a.download = `udaan-transactions-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
    showToast('CSV exported!')
  }

  function handleSignOut() {
    showToast('Signing out...', 'info')
    setTimeout(() => {
      localStorage.removeItem('udaan_user')
      localStorage.removeItem('udaan_token')
      localStorage.removeItem('udaan_notif')
      window.location.href = '/login'
    }, 800)
  }

  const profileStats = [
    { val: totalXP.toLocaleString(), lab: 'XP',    color: 'text-indigo-400' },
    { val: streak,                   lab: 'Streak', color: 'text-amber-400'  },
    { val: level,                    lab: 'Level',  color: 'text-cyan-400'   },
    { val: earnedBadges.length,      lab: 'Badges', color: 'text-green-400'  },
  ]

  return (
    <div className="p-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showEdit && <EditModal user={user} onClose={() => setShowEdit(false)} onSave={handleSave} />}

      {/* Profile Header */}
      <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-8 flex flex-wrap items-center gap-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white border-4 border-indigo-500/30 flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-slate-100">{user.name}</h1>
          <p className="text-sm text-slate-500 mt-1 mb-4">{user.email}</p>
          <div className="flex gap-6 flex-wrap">
            {profileStats.map(({ val, lab, color }) => (
              <div key={lab} className="text-center">
                <div className={`text-2xl font-black ${color}`}>{val}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{lab}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setShowEdit(true)}
          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition self-start">
          ✏️ Edit Profile
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Lessons Done',  val: completedLessons,                    color: 'text-indigo-400' },
          { label: 'Quizzes Taken', val: quizHistory.length,                  color: 'text-cyan-400'   },
          { label: 'Avg Score',     val: avgScore > 0 ? `${avgScore}%` : '—', color: 'text-green-400'  },
          { label: 'Badges Earned', val: earnedBadges.length,                 color: 'text-amber-400'  },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-[#161929] border border-[#1c2038] rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Badges */}
        <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
          <h2 className="font-bold text-sm text-slate-200 mb-1">Achievements</h2>
          <p className="text-xs text-slate-500 mb-4">{earnedBadges.length} of {allBadges.length} badges unlocked</p>
          <div className="h-1.5 bg-[#111427] rounded-full overflow-hidden mb-5">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {allBadges.map((b) => {
              const earned = earnedBadges.includes(b.label)
              return (
                <div key={b.label}
                  onMouseEnter={() => setHoveredBadge(b.label)}
                  onMouseLeave={() => setHoveredBadge(null)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-default ${earned ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-[#1c2038] border-[#1c2038] text-slate-500'}`}>
                  <span className={earned ? '' : 'opacity-30'}>{b.icon}</span>
                  {b.label}
                  {hoveredBadge === b.label && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0d0f1c] border border-indigo-500/30 text-slate-300 text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
                      {earned ? '✅ Unlocked!' : `🔒 ${b.hint}`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">

          {/* Notifications */}
          <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
            <h2 className="font-bold text-sm text-slate-200 mb-1">Notifications</h2>
            <p className="text-xs text-slate-500 mb-4">Saved to your account</p>
            <div className="space-y-4">
              {[
                { key: 'daily',  label: 'Daily learning reminders', sub: 'Reminder to complete lessons',   val: notifPrefs.daily  },
                { key: 'fraud',  label: 'Fraud alerts',             sub: 'Alerts for suspicious activity', val: notifPrefs.fraud  },
                { key: 'weekly', label: 'Weekly progress reports',  sub: 'Summary every Sunday',           val: notifPrefs.weekly },
              ].map(({ key, label, sub, val }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </div>
                  <Toggle value={val} onChange={(v) => updateNotif(key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
            <h2 className="font-bold text-sm text-slate-200 mb-4">Account Settings</h2>
            <div className="space-y-2">

              <button onClick={() => setShowEdit(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#111427] hover:bg-[#1c2038] border border-transparent hover:border-indigo-500/20 rounded-lg transition-all text-left">
                <span>✏️</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">Edit Profile</div>
                  <div className="text-xs text-slate-500">Change name, email or password</div>
                </div>
                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">NOW</span>
              </button>

              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#111427] hover:bg-[#1c2038] border border-transparent hover:border-indigo-500/20 rounded-lg transition-all text-left">
                  <span>📤</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">Export My Data</div>
                    <div className="text-xs text-slate-500">Download your learning history</div>
                  </div>
                  <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">NOW</span>
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#161929] border border-indigo-500/30 rounded-xl p-2 z-20 w-52 shadow-xl">
                    <button onClick={exportJSON} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-indigo-500/10 rounded-lg transition">📄 Export as JSON</button>
                    <button onClick={exportCSV}  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-indigo-500/10 rounded-lg transition">📊 Export as CSV</button>
                  </div>
                )}
              </div>

              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/25 rounded-lg transition-all text-left">
                <span>🚪</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400">Sign Out</div>
                  <div className="text-xs text-slate-500">Clears session, go to login</div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}