import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep]             = useState(1)
  const [email, setEmail]           = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass]       = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')


  function handleOtpChange(i, val) {
    if (!/^\d*$/.test(val)) return
    const updated = [...otp]
    updated[i] = val.slice(-1)
    setOtp(updated)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }

  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus()
  }

  async function submitEmail() {
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.forgotPassword(email)

      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitOtp() {
    const otpStr = otp.join('')
    if (otpStr.length < 6) { setError('Enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyOtp(email, otpStr)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitNewPass() {
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword(email, otp.join(''), newPass)
      setStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-[#111427] border border-[#1c2038] focus:border-indigo-500 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition"

  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'OTP' },
    { num: 3, label: 'New Password' },
    { num: 4, label: 'Done' },
  ]

  return (
    <div className="min-h-screen bg-[#07080f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-1">✦ Udaan</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Reset Password</div>
        </div>

        <div className="bg-[#161929] border border-indigo-500/20 rounded-2xl p-8">

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                    s.num < step  ? 'bg-green-500 text-white'
                    : s.num === step ? 'bg-indigo-500 text-white'
                    : 'bg-[#1c2038] text-slate-500'
                  }`}>
                    {s.num < step ? '✓' : s.num}
                  </div>
                  <span className={`text-[10px] mt-1 whitespace-nowrap ${s.num === step ? 'text-slate-200' : 'text-slate-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 ${s.num < step ? 'bg-green-500' : 'bg-[#1c2038]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Step 1 — Email */}
          {step === 1 && (
            <div>
              <h2 className="font-black text-xl text-slate-100 mb-1">Forgot password?</h2>
              <p className="text-sm text-slate-400 mb-6">Enter your email and we'll send a 6-digit OTP.</p>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="you@example.com"
                className={inputCls}
                onKeyDown={e => e.key === 'Enter' && submitEmail()} />
              <button onClick={submitEmail} disabled={loading}
                className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all disabled:opacity-60">
                {loading ? '⏳ Sending...' : 'Send OTP →'}
              </button>
            </div>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <div>
              <h2 className="font-black text-xl text-slate-100 mb-1">Check your email</h2>
              <p className="text-sm text-slate-400 mb-2">
                Enter the 6-digit OTP sent to <span className="text-indigo-400">{email}</span>
              </p>
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-2 rounded-lg mb-4">
                📧 OTP sent to your email — check your inbox!
              </div>
              <div className="flex gap-2 justify-center my-6">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    maxLength={1} type="text" inputMode="numeric"
                    className="w-11 h-12 text-center text-lg font-bold bg-[#111427] border border-[#1c2038] focus:border-indigo-500 rounded-lg text-slate-200 outline-none transition" />
                ))}
              </div>
              <button onClick={submitOtp} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-60 mb-3">
                {loading ? '⏳ Verifying...' : 'Verify OTP →'}
              </button>
              <button onClick={submitEmail} className="w-full text-sm text-slate-500 hover:text-indigo-400 transition py-1">
                Didn't receive? Resend OTP
              </button>
            </div>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <div>
              <h2 className="font-black text-xl text-slate-100 mb-1">Set new password</h2>
              <p className="text-sm text-slate-400 mb-6">Choose a strong password.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                  <input value={newPass} onChange={e => setNewPass(e.target.value)}
                    type="password" placeholder="Min 6 characters" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                  <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    type="password" placeholder="Repeat password" className={inputCls} />
                </div>
                {newPass && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${
                          newPass.length >= i*3 ? i<=1?'bg-red-500':i<=2?'bg-amber-500':i<=3?'bg-yellow-400':'bg-green-500' : 'bg-[#1c2038]'
                        }`} />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {newPass.length < 6 ? 'Too short' : newPass.length < 9 ? 'Weak' : newPass.length < 12 ? 'Good' : '✓ Strong'}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={submitNewPass} disabled={loading}
                className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-60">
                {loading ? '⏳ Saving...' : 'Reset Password →'}
              </button>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-black text-xl text-slate-100 mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-400 mb-6">Your password has been updated successfully.</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-lg transition-all hover:-translate-y-0.5">
                Back to Sign In →
              </button>
            </div>
          )}

          {step < 4 && (
            <button onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition mt-4 block">
              ← {step === 1 ? 'Back to login' : 'Go back'}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}