import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, setToken } from '../services/api'

export default function Login() {
  const navigate    = useNavigate()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function validate() {
    if (!email.includes('@') || email.trim().length < 5) { setError('Please enter a valid email'); return false }
    if (password.length < 6)                             { setError('Password must be at least 6 characters'); return false }
    if (mode === 'signup' && name.trim().length < 2)     { setError('Please enter your full name'); return false }
    return true
  }

  async function handleSubmit() {
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      let data
      if (mode === 'signup') {
        data = await authAPI.signup(name.trim(), email.trim(), password)
      } else {
        data = await authAPI.login(email.trim(), password)
      }
      setToken(data.token)
      localStorage.setItem('udaan_user', JSON.stringify({
        id:    data.user.id,
        name:  data.user.name,
        email: data.user.email,
      }))
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-[#111427] border border-[#1c2038] focus:border-indigo-500 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
  const labelCls = "text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block"

  return (
    <div className="min-h-screen bg-[#07080f] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-1">
            ✦ Udaan
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Financial Literacy Platform</div>
        </div>

        {/* Card */}
        <div className="bg-[#161929] border border-indigo-500/20 rounded-2xl p-8 shadow-2xl">

          {/* Toggle */}
          <div className="flex bg-[#111427] rounded-xl p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 className="font-black text-xl text-slate-100 mb-1">
            {mode === 'login' ? 'Welcome back 👋' : 'Create account 🚀'}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            {mode === 'login' ? 'Sign in to continue your learning journey' : 'Start your financial literacy journey today'}
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={labelCls}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  type="text" placeholder="Arjun Sharma"
                  className={inputCls} />
              </div>
            )}

            <div>
              <label className={labelCls}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="you@example.com"
                className={inputCls} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={labelCls} style={{marginBottom:0}}>Password</label>
                {mode === 'login' && (
                  <button onClick={() => navigate('/forgot-password')}
                    className="text-xs text-indigo-400 hover:text-cyan-400 transition">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                  className={`${inputCls} pr-20`}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 transition whitespace-nowrap">
                  {showPass ? '🙈 Hide' : '👁 Show'}
                </button>
              </div>
            </div>

            {/* Password strength for signup */}
            {mode === 'signup' && password && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                      password.length >= i * 3
                        ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-yellow-400' : 'bg-green-500'
                        : 'bg-[#1c2038]'
                    }`} />
                  ))}
                </div>
                <div className="text-[11px] text-slate-500">
                  Strength: {password.length < 6 ? 'Too short' : password.length < 9 ? 'Weak' : password.length < 12 ? 'Good' : '✓ Strong'}
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-1">
              {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-indigo-400 hover:text-cyan-400 font-semibold transition">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Your data is securely stored in MongoDB Atlas 🔒
        </p>
      </div>
    </div>
  )
}