import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      login(data.token, data.user)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0F172A]/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Ekdrishti Studios
          </div>
          <h1 className="text-2xl font-heading font-black text-white">CMS LOGIN</h1>
          <p className="text-textSecondary text-xs mt-2">Enter credentials to manage your portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            ⚠️  {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-textSecondary text-xs font-medium mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 focus:bg-[#0d1428] transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-textSecondary text-xs font-medium mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 focus:bg-[#0d1428] transition-all duration-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-primary font-bold py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
