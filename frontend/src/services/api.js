
const BASE_URL = 'https://udaan-backend-w244.onrender.com/api'

// ── Token helpers ───────────────────────────────────────────
export const getToken = () => localStorage.getItem('udaan_token')
export const setToken = (token) => localStorage.setItem('udaan_token', token)
export const removeToken = () => localStorage.removeItem('udaan_token')

// ── Base fetch function ─────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

// ── AUTH APIs ───────────────────────────────────────────────
export const authAPI = {
  signup: (name, email, password) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email, otp) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, otp, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
}

// ── USER APIs ───────────────────────────────────────────────
export const userAPI = {
  getDashboard: () => request('/user/dashboard'),

  getMe: () => request('/user/me'),

  updateProfile: (name, email) =>
    request('/user/update-profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    }),

  changePassword: (currentPassword, newPassword) =>
    request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  completeLesson: (moduleId, lessonId, xpEarned, quizScore, quizGrade, moduleName) =>
    request('/user/complete-lesson', {
      method: 'POST',
      body: JSON.stringify({ moduleId, lessonId, xpEarned, quizScore, quizGrade, moduleName }),
    }),

  updateNotifications: (daily, fraud, weekly) =>
    request('/user/notifications', {
      method: 'PUT',
      body: JSON.stringify({ daily, fraud, weekly }),
    }),
}

// ── TRANSACTION APIs ────────────────────────────────────────
export const transactionAPI = {
  analyze: (merchant, amount, txType, txTime, location) =>
    request('/transactions/analyze', {
      method: 'POST',
      body: JSON.stringify({ merchant, amount, txType, txTime, location }),
    }),

  getAll: () => request('/transactions'),

  delete: (id) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),
}