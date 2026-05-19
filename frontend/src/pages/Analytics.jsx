import { useApp } from '../context/AppContext'

const colorMap = {
  indigo: { top: 'bg-indigo-500', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  green:  { top: 'bg-green-500',  text: 'text-green-400',  bar: 'bg-green-500'  },
  cyan:   { top: 'bg-cyan-500',   text: 'text-cyan-400',   bar: 'bg-cyan-500'   },
  amber:  { top: 'bg-amber-500',  text: 'text-amber-400',  bar: 'bg-amber-500'  },
}

function gradeColor(grade) {
  if (grade.startsWith('A')) return 'text-green-400 bg-green-500/10 border-green-500/20'
  if (grade.startsWith('B')) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
}

// Read real XP log from localStorage
function getWeeklyXP() {
  try {
    const xpLog = JSON.parse(localStorage.getItem('udaan_xp_log') || '{}')
    const days  = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 6; i >= 0; i--) {
      const d   = new Date(Date.now() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      const xp  = xpLog[key] || 0
      days.push({ day: dayNames[d.getDay()], xp, key })
    }
    return days
  } catch {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => ({ day, xp: 0 }))
  }
}

export default function Analytics() {
  const {
    completedLessons, totalLessons, totalXP,
    avgScore, quizHistory, moduleProgress, modules, streak,
  } = useApp()

  const weeklyData = getWeeklyXP()
  const maxXP      = Math.max(...weeklyData.map(d => d.xp), 1) // avoid div by 0
  const totalWeekXP = weeklyData.reduce((s, d) => s + d.xp, 0)

  const stats = [
    { label: 'Lessons Completed', value: completedLessons,                      icon: '📚', change: `of ${totalLessons} total`,                              color: 'indigo' },
    { label: 'Avg Quiz Score',    value: avgScore > 0 ? `${avgScore}%` : '—',   icon: '🎯', change: quizHistory.length > 0 ? `${quizHistory.length} quizzes` : 'No quizzes yet', color: 'green' },
    { label: 'XP Earned',         value: totalXP.toLocaleString(),               icon: '⭐', change: `+${totalWeekXP} this week`,                            color: 'cyan'   },
    { label: 'Day Streak',        value: streak,                                 icon: '🔥', change: 'Keep logging in daily!',                               color: 'amber'  },
  ]

  return (
    <div className="p-4 sm:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1">◎ Analytics</h1>
        <p className="text-sm text-slate-400">Track your learning progress and financial awareness growth.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#161929] border border-[#1c2038] rounded-xl p-5 relative overflow-hidden hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${colorMap[s.color].top}`} />
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-black text-slate-100">{s.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{s.label}</div>
            <div className={`text-xs font-semibold mt-2 ${colorMap[s.color].text}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* ── Two Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Weekly XP — REAL DATA from localStorage */}
        <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm">Weekly XP Activity</h2>
            <span className="text-xs text-slate-500">{totalWeekXP > 0 ? `${totalWeekXP} XP this week` : 'Complete lessons to earn XP'}</span>
          </div>

          {totalWeekXP === 0 ? (
            /* Empty state */
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-slate-400 text-sm font-medium">No XP earned this week yet</div>
              <div className="text-slate-600 text-xs mt-1">Complete lessons to see your activity here</div>
            </div>
          ) : (
            /* Real chart */
            <>
              <div className="flex items-end gap-2 h-36 mt-4">
                {weeklyData.map((d, i) => {
                  const heightPct = maxXP > 0 ? Math.max((d.xp / maxXP) * 100, d.xp > 0 ? 8 : 0) : 0
                  const isToday   = i === weeklyData.length - 1
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                      {d.xp > 0 && (
                        <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 transition">{d.xp}</span>
                      )}
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            isToday ? 'bg-cyan-500' : d.xp > 0 ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-[#1c2038]'
                          }`}
                          style={{ height: `${heightPct}%`, minHeight: d.xp > 0 ? '6px' : '0' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 mt-2">
                {weeklyData.map((d, i) => (
                  <div key={d.day} className={`flex-1 text-center text-[10px] ${i === weeklyData.length - 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {d.day}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Module Breakdown — DYNAMIC */}
        <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
          <h2 className="font-bold text-sm mb-6">Module Breakdown</h2>
          {modules.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">No modules yet</div>
          ) : (
            <div className="space-y-5">
              {modules.map((m) => {
                const progress  = moduleProgress(m.id)
                const done      = m.lessons.filter(l => l.completed).length
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{m.emoji} {m.title}</span>
                      <span className={`font-bold ${colorMap[m.color].text}`}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-[#111427] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${colorMap[m.color].bar}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {done} of {m.lessons.length} lessons · {m.lessons.reduce((s, l) => s + (l.completed ? l.xp : 0), 0)} XP earned
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Quiz History — DYNAMIC ── */}
      <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm">Quiz History</h2>
          {quizHistory.length > 0 && (
            <span className="text-xs text-slate-500">{quizHistory.length} quizzes taken · avg {avgScore}%</span>
          )}
        </div>
        {quizHistory.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-slate-400 text-sm font-medium">No quizzes taken yet</div>
            <div className="text-slate-600 text-xs mt-1">Complete lessons in the Learn section to take quizzes</div>
          </div>
        ) : (
          <div className="divide-y divide-[#1c2038]">
            {quizHistory.map((q, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm flex-shrink-0">📝</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{q.module}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{q.date}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20 sm:w-24 h-1.5 bg-[#111427] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      q.score >= 80 ? 'bg-green-500' : q.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`} style={{ width: `${q.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 w-8">{q.score}%</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${gradeColor(q.grade)}`}>{q.grade}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}