import { useState } from 'react'
import { useApp } from '../context/AppContext'

const colorMap = {
  indigo: { bar: 'bg-indigo-500', tag: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', glow: 'hover:border-indigo-500/40', dot: 'bg-indigo-500' },
  cyan:   { bar: 'bg-cyan-500',   tag: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',       glow: 'hover:border-cyan-500/40',   dot: 'bg-cyan-500'   },
  green:  { bar: 'bg-green-500',  tag: 'bg-green-500/10 text-green-300 border-green-500/20',    glow: 'hover:border-green-500/40',  dot: 'bg-green-500'  },
  amber:  { bar: 'bg-amber-500',  tag: 'bg-amber-500/10 text-amber-300 border-amber-500/20',    glow: 'hover:border-amber-500/40',  dot: 'bg-amber-500'  },
}

const filters = ['All Modules', '💰 Budgeting', '🏦 Saving', '📈 Investing', '🛡️ Fraud Safety']
const filterMap = { 'All Modules': null, '💰 Budgeting': 'budgeting', '🏦 Saving': 'saving', '📈 Investing': 'investing', '🛡️ Fraud Safety': 'fraud' }

// ── Quiz Modal ──────────────────────────────────────────────
function QuizModal({ lesson, moduleId, onClose, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)

  const questions = lesson.quiz
  const q = questions[current]

  function selectOption(idx) {
    if (selected !== null) return
    setSelected(idx)
  }

  function next() {
    const newAnswers = [...answers, selected === q.ans]
    if (current < questions.length - 1) {
      setAnswers(newAnswers)
      setCurrent(current + 1)
      setSelected(null)
    } else {
      setAnswers(newAnswers)
      setShowResult(true)
    }
  }

  function finish() {
    const correct = answers.filter(Boolean).length
    const score = Math.round((correct / questions.length) * 100)
    onComplete(moduleId, lesson.id, score)
    onClose()
  }

  if (showResult) {
    const correct = answers.filter(Boolean).length
    const score = Math.round((correct / questions.length) * 100)
    const xpEarned = score >= 80 ? lesson.xp : score >= 60 ? Math.round(lesson.xp * 0.7) : Math.round(lesson.xp * 0.5)
    return (
      <div className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#161929] border border-indigo-500/30 rounded-2xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">{score >= 80 ? '🏆' : score >= 60 ? '👍' : '📖'}</div>
          <div className={`text-5xl font-black mb-2 ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-slate-300'}`}>{score}%</div>
          <div className="text-slate-400 text-sm mb-4">{correct} of {questions.length} correct</div>
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm px-4 py-2 rounded-full mb-6">+{xpEarned} XP earned!</div>
          <div className="text-xs text-slate-500 mb-6">
            {score >= 80 ? 'Excellent! You have mastered this lesson.' : score >= 60 ? 'Good job! Review the lesson to improve further.' : 'Keep practicing — you will get better!'}
          </div>
          <button onClick={finish} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all">
            Done ✓
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161929] border border-indigo-500/30 rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1c2038] text-slate-400 hover:text-slate-200 flex items-center justify-center transition">✕</button>
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Quiz · {lesson.title}</div>
        <div className="font-bold text-base mb-4">Question {current + 1} of {questions.length}</div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < current ? 'bg-indigo-500' : i === current ? 'bg-cyan-400' : 'bg-[#1c2038]'}`} />
          ))}
        </div>

        <div className="text-sm font-semibold leading-relaxed mb-5">{q.q}</div>

        <div className="space-y-2">
          {q.opts.map((opt, i) => {
            let style = 'bg-[#111427] border-[#1c2038] text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/5'
            if (selected !== null) {
              if (i === q.ans) style = 'bg-green-500/10 border-green-500/50 text-green-300'
              else if (i === selected && i !== q.ans) style = 'bg-red-500/10 border-red-500/50 text-red-300'
              else style = 'bg-[#111427] border-[#1c2038] text-slate-500 opacity-50'
            }
            return (
              <button key={i} onClick={() => selectOption(i)} className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <button onClick={next} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all">
            {current < questions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Lesson Modal ────────────────────────────────────────────
function LessonModal({ lesson, module, onClose, onStartQuiz }) {
  return (
    <div className="fixed inset-0 bg-[#07080f]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161929] border border-[#1c2038] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1c2038] text-slate-400 hover:text-slate-200 flex items-center justify-center transition z-10">✕</button>

        {/* Header */}
        <div className={`p-6 border-b border-[#1c2038] flex-shrink-0`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{module.emoji}</span>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{module.title} · Lesson {lesson.num}</div>
              <div className="font-bold text-lg">{lesson.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">⏱ {lesson.duration}</span>
            <span className="text-xs font-bold text-amber-400">+{lesson.xp} XP</span>
            {lesson.completed && <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">✅ Completed</span>}
          </div>
        </div>

        {/* Video */}
        {lesson.videoId && (
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{paddingTop: '42%'}}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 mb-1">📺 Watch this video, then read the lesson below</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {lesson.content.split('\n').map((line, i) => {
              if (line === '') return <div key={i} className="h-3" />
              if (line.startsWith('•') || line.startsWith('✅') || line.startsWith('❌')) {
                return <div key={i} className="flex gap-2 text-sm text-slate-300 mb-1"><span className="flex-shrink-0">{line.split(' ')[0]}</span><span>{line.slice(line.indexOf(' ') + 1)}</span></div>
              }
              if (line.match(/^\d\./)) {
                return <div key={i} className="text-sm text-slate-300 mb-1 pl-2">{line}</div>
              }
              if (line === line.toUpperCase() && line.length > 3 && !line.startsWith('•')) {
                return null
              }
              return <p key={i} className="text-sm text-slate-300 leading-relaxed mb-1">{line}</p>
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1c2038] flex-shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#1c2038] border border-[#2a2f4a] rounded-lg text-sm font-semibold text-slate-300 hover:bg-[#252840] transition">
            Back
          </button>
          <button
            onClick={() => { onClose(); onStartQuiz(lesson, module) }}
            className="flex-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all text-sm"
          >
            {lesson.completed ? 'Retake Quiz →' : 'Take Quiz & Complete →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Learn Page ─────────────────────────────────────────
export default function Learn() {
  const { modules, overallProgress, completedLessons, totalLessons, moduleProgress, completeLesson } = useApp()
  const [activeFilter, setActiveFilter] = useState('All Modules')
  const [lessonModal, setLessonModal] = useState(null)
  const [quizModal, setQuizModal] = useState(null)

  const filtered = modules.filter((m) => {
    const f = filterMap[activeFilter]
    return f === null || m.id === f
  })

  function openLesson(lesson, module) {
    if (lesson.status === 'locked') return
    setLessonModal({ lesson, module })
  }

  function startQuiz(lesson, module) {
    setQuizModal({ lesson, module })
  }

  function statusIcon(lesson) {
    if (lesson.completed) return '✅'
    const mod = modules.find(m => m.lessons.some(l => l.id === lesson.id))
    if (!mod) return '▶'
    const idx = mod.lessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return '▶'
    const prev = mod.lessons[idx - 1]
    if (prev && !prev.completed) return '🔒'
    return '▶'
  }

  function isLocked(lesson, module) {
    const idx = module.lessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return false
    const prev = module.lessons[idx - 1]
    return prev && !prev.completed
  }

  return (
    <div className="p-8">

      {/* Lesson Modal */}
      {lessonModal && (
        <LessonModal
          lesson={lessonModal.lesson}
          module={lessonModal.module}
          onClose={() => setLessonModal(null)}
          onStartQuiz={(lesson, module) => startQuiz(lesson, module)}
        />
      )}

      {/* Quiz Modal */}
      {quizModal && (
        <QuizModal
          lesson={quizModal.lesson}
          moduleId={quizModal.module.id}
          onClose={() => setQuizModal(null)}
          onComplete={completeLesson}
        />
      )}

      {/* ── Hero ── */}
      <div className="bg-[#161929] border border-[#1c2038] rounded-xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-2xl font-black mb-2">📚 Learning Center</h1>
        <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
          Click any lesson to read content, then take a quiz to earn XP and mark it complete!
        </p>
        <div className="flex gap-4 mt-6 flex-wrap">
          {[
            { val: totalLessons,       label: 'Total Lessons',    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { val: completedLessons,   label: 'Completed',        color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20'     },
            { val: `${overallProgress}%`, label: 'Overall Progress', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20'   },
          ].map(({ val, label, color, bg }) => (
            <div key={label} className={`border rounded-lg px-4 py-3 text-center ${bg}`}>
              <div className={`text-xl font-black ${color}`}>{val}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              activeFilter === f
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-[#161929] border-[#1c2038] text-slate-400 hover:border-indigo-500/30 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Module Sections ── */}
      <div className="space-y-8">
        {filtered.map((mod) => {
          const progress = moduleProgress(mod.id)
          return (
            <div key={mod.id}>
              {/* Module Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mod.emoji}</span>
                  <h2 className="font-bold text-base">{mod.title}</h2>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${colorMap[mod.color].tag}`}>
                    {progress}% done
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-[#1c2038] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${colorMap[mod.color].bar}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{mod.lessons.length} lessons</span>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.lessons.map((lesson) => {
                  const locked = isLocked(lesson, mod)
                  const icon = lesson.completed ? '✅' : locked ? '🔒' : '▶'
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => !locked && openLesson(lesson, mod)}
                      className={`bg-[#161929] border rounded-xl p-5 transition-all ${
                        locked
                          ? 'border-[#1c2038] opacity-50 cursor-not-allowed'
                          : lesson.completed
                          ? 'border-green-500/20 hover:border-green-500/40 cursor-pointer hover:-translate-y-0.5'
                          : `border-[#1c2038] ${colorMap[mod.color].glow} cursor-pointer hover:-translate-y-0.5`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Lesson {lesson.num}</span>
                        <span className="text-base">{icon}</span>
                      </div>
                      {!lesson.completed && !locked && (
                        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[mod.color].dot} mb-2`} />
                      )}
                      <div className="font-bold text-sm mb-2">{lesson.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed mb-4">{lesson.desc}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">⏱ {lesson.duration}</span>
                        <span className="text-[11px] font-bold text-amber-400">+{lesson.xp} XP</span>
                      </div>
                      {!locked && (
                        <div className={`mt-3 text-[11px] font-semibold text-center py-1.5 rounded-md ${
                          lesson.completed
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-indigo-500/10 text-indigo-300'
                        }`}>
                          {lesson.completed ? '✅ Completed — Click to review' : '👆 Click to start lesson'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}