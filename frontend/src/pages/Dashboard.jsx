import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const colorMap = {
  indigo: { bar: 'bg-indigo-500', tag: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', top: 'bg-indigo-500' },
  cyan:   { bar: 'bg-cyan-500',   tag: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',       top: 'bg-cyan-500'   },
  green:  { bar: 'bg-green-500',  tag: 'bg-green-500/10 text-green-300 border-green-500/20',    top: 'bg-green-500'  },
  amber:  { bar: 'bg-amber-500',  tag: 'bg-amber-500/10 text-amber-300 border-amber-500/20',    top: 'bg-amber-500'  },
}

const allBadges = [
  { icon: '🔥', label: '7-Day Streak' },
  { icon: '📚', label: 'First Lesson' },
  { icon: '💡', label: 'Quiz Master' },
  { icon: '🛡️', label: 'Fraud Aware' },
  { icon: '🏆', label: 'Top Scorer' },
  { icon: '⚡', label: 'Speed Runner' },
  { icon: '💰', label: 'Saver Pro' },
  { icon: '📈', label: 'Investor' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    modules, activity, totalXP, overallProgress,
    fraudAlerts, streak, streakDots, level, xpForNextLevel,
    xpProgress, completedLessons, quizHistory,
    avgScore, earnedBadges, moduleProgress,
  } = useApp()

  const stats = [
    { label: 'Course Progress', value: `${overallProgress}%`,        icon: '📚', change: '↑ Completing lessons',      color: 'indigo' },
    { label: 'Day Streak',      value: `${streak}`,                  icon: '🔥', change: streak > 0 ? `↑ Keep it up!` : 'Start today!', color: 'cyan' },
    { label: 'Total XP',        value: totalXP.toLocaleString(),     icon: '⭐', change: '↑ Earn more via quizzes',   color: 'green'  },
    { label: 'Fraud Alerts',    value: `${fraudAlerts}`,             icon: '🛡️', change: `→ ${fraudAlerts} high risk`, color: 'amber'  },
  ]

  return (
    <div className="p-8">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#161929] border border-[#1c2038] rounded-xl p-5 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${colorMap[s.color].top}`} />
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-black text-slate-100">{s.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{s.label}</div>
            <div className="text-xs text-green-400 font-semibold mt-2">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Modules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base">Learning Modules</h2>
              <button onClick={() => navigate('/learn')} className="text-sm text-indigo-400 hover:text-cyan-400 transition">View all →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map((m) => {
                const progress = moduleProgress(m.id)
                const doneLessons = m.lessons.filter(l => l.completed).length
                return (
                  <div key={m.id} onClick={() => navigate('/learn')} className="bg-[#161929] border border-[#1c2038] rounded-xl p-5 cursor-pointer hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all">
                    <div className="text-3xl mb-3">{m.emoji}</div>
                    <div className="font-bold text-sm mb-1">{m.title}</div>
                    <div className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">{m.lessons[0]?.desc}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${colorMap[m.color].tag}`}>{m.lessons.length} lessons</span>
                      <span className="text-[11px] text-slate-500">{doneLessons} done</span>
                    </div>
                    <div className="h-1 bg-[#111427] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${colorMap[m.color].bar}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1.5">{progress}% complete</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="font-bold text-base mb-4">Recent Activity</h2>
            <div className="bg-[#161929] border border-[#1c2038] rounded-xl divide-y divide-[#1c2038]">
              {activity.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="text-slate-400 text-sm font-medium">No activity yet</div>
                  <div className="text-slate-600 text-xs mt-1">Complete a lesson to get started!</div>
                </div>
              ) : (
                activity.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${a.bg}`}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{a.sub}</div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">{a.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="space-y-4">

          {/* XP / Level */}
          <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-5">
            <h3 className="font-bold text-sm mb-4">Level Progress</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Level {level} → Level {level + 1}</span>
              <span className="text-indigo-400 font-bold">{totalXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-2 bg-[#111427] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-1.5">{xpForNextLevel - totalXP} XP needed to unlock Level {level + 1}</div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { val: completedLessons,                         lab: 'Lessons'   },
                { val: quizHistory.length,                       lab: 'Quizzes'   },
                { val: avgScore > 0 ? `${avgScore}%` : '—',     lab: 'Avg Score' },
              ].map(({ val, lab }) => (
                <div key={lab} className="bg-[#111427] rounded-lg p-3 text-center">
                  <div className="font-black text-lg text-indigo-300">{val}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Calendar — DYNAMIC */}
          <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-5">
            <h3 className="font-bold text-sm">
              {streak > 0 ? `🔥 ${streak}-Day Streak` : '🔥 Start Your Streak!'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              {streak >= 7 ? 'Amazing! Keep it going!' : streak > 0 ? 'Keep logging in daily!' : 'Visit every day to build your streak'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {streakDots.map((d, i) => (
                <div key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  d.isToday && d.done ? 'bg-cyan-500 text-[#07080f]'
                  : d.done             ? 'bg-indigo-500 text-white'
                  : d.isToday          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                  :                      'bg-[#1c2038] text-slate-600'
                }`}>{d.label}</div>
              ))}
            </div>
          </div>

          {/* Badges — DYNAMIC */}
          <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-5">
            <h3 className="font-bold text-sm">Achievements</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">{earnedBadges.length} of {allBadges.length} badges unlocked</p>
            <div className="flex flex-wrap gap-2">
              {allBadges.map((b) => {
                const earned = earnedBadges.includes(b.label)
                return (
                  <div key={b.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    earned ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-[#1c2038] border-[#1c2038] text-slate-500'
                  }`}>
                    <span className={earned ? '' : 'opacity-30'}>{b.icon}</span>
                    {b.label}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}