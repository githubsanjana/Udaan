import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Fraud from './pages/Fraud'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

function RequireAuth({ children }) {
  const user = localStorage.getItem('udaan_user')
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const userRaw  = localStorage.getItem('udaan_user')
  const user     = userRaw ? JSON.parse(userRaw) : { name: 'User', email: 'user@udaan.in' }
  const initial  = user.name?.charAt(0).toUpperCase() || 'U'

  const navItems = [
    { to: '/',          icon: '⊞', label: 'Dashboard'      },
    { to: '/learn',     icon: '◈', label: 'Learn'           },
    { to: '/fraud',     icon: '⚡', label: 'Fraud Detector' },
    { to: '/analytics', icon: '◎', label: 'Analytics'       },
    { to: '/profile',   icon: '◉', label: 'Profile'         },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <nav className={`fixed top-0 left-0 h-screen w-60 bg-[#0d0f1c] border-r border-indigo-900/30 flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-7 border-b border-indigo-900/30 flex items-center justify-between">
          <div>
            <div className="text-xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">✦ Udaan</div>
            <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Financial Literacy</div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-300 text-xl transition">✕</button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 px-3 py-2">Menu</div>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25'
                    : 'text-slate-400 hover:bg-indigo-500/5 hover:text-slate-200'
                }`
              }>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-900/30">
          <div onClick={() => { navigate('/profile'); onClose() }}
            className="flex items-center gap-3 bg-[#161929] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#1c2038] transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-200 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

function Topbar({ onMenuClick }) {
  const location = useLocation()
  const titles = {
    '/': 'Dashboard', '/learn': 'Learn', '/fraud': '⚡ Fraud Detector',
    '/analytics': 'Analytics', '/profile': 'Profile',
  }
  return (
    <div className="h-14 bg-[#07080f]/80 backdrop-blur-md border-b border-indigo-900/20 flex items-center px-4 gap-3 sticky top-0 z-30">
      <button onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-lg bg-[#161929] border border-[#1c2038] flex items-center justify-center text-slate-400 hover:text-slate-200 transition flex-shrink-0">
        ☰
      </button>
      <div className="font-black text-base flex-1 truncate">
        {titles[location.pathname] || 'Udaan'}
      </div>
    </div>
  )
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-[#07080f] text-slate-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/"          element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
        <Route path="/learn"     element={<RequireAuth><Layout><Learn /></Layout></RequireAuth>} />
        <Route path="/fraud"     element={<RequireAuth><Layout><Fraud /></Layout></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Layout><Analytics /></Layout></RequireAuth>} />
        <Route path="/profile"   element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}