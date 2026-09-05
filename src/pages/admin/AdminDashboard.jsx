import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCases: 0,
    publishedCases: 0,
    draftCases: 0,
    totalViews: 0,
    totalContacts: 0,
    unreadContacts: 0,
    todayContacts: 0,
    yesterdayContacts: 0,
    last7DaysContacts: 0,
    last30DaysContacts: 0,
    mediaCount: 0,
    mediaSizeMb: 0
  })
  const [recentInquiries, setRecentInquiries] = useState([])
  const [integrations, setIntegrations] = useState({
    s3: 'Mock Mode',
    email: 'Mock Mode',
    db: 'Connected'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        
        const res = await fetch('/v1/dashboard', { headers })
        if (res.status === 401) {
          logout()
          navigate('/ownercontrols_panel/login')
          return
        }

        const payload = await res.json()
        if (payload.success && payload.data) {
          const metrics = payload.data
          setStats({
            totalCases: metrics.portfolio?.total || 0,
            publishedCases: metrics.portfolio?.published || 0,
            draftCases: metrics.portfolio?.drafts || 0,
            totalViews: metrics.portfolio?.totalViews || 0,
            unreadInquiries: metrics.crm?.unread || 0,
            totalInquiries: metrics.crm?.total || 0,
            resolvedInquiries: (metrics.crm?.read || 0) + (metrics.crm?.replied || 0),
            systemHealth: metrics.integrations?.db?.includes('Connected') ? 'Healthy' : 'Degraded'
          })
          setRecentInquiries(metrics.recentInquiries || [])
          if (metrics.integrations) {
            setIntegrations(metrics.integrations)
          }
        } else {
          throw new Error(payload.message || 'Failed to fetch dashboard data')
        }
      } catch (err) {
        setError(err.message || 'Error communicating with backend dashboard API')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, logout, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-2"></div>
          <p className="text-textSecondary text-xs">Loading admin dashboard metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white">
            Studio Overview
          </h1>
          <p className="text-textSecondary text-xs mt-1">
            Real-time analytics and management for Ekdrishti Web.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/ownercontrols_panel/cases"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-primary font-bold text-xs transition-all shadow"
          >
            ＋  Manage Portfolio
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-textSecondary hover:text-white transition-all"
          >
            🔄  Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-textSecondary text-xs font-medium">
            <span>Portfolio Cases</span>
            <span className="text-base">📁</span>
          </div>
          <div className="text-2xl font-black text-white font-heading">{stats.totalCases}</div>
          <div className="text-[10px] text-textSecondary">
            <span className="text-emerald-400 font-bold">{stats.publishedCases} Published</span> • {stats.draftCases} Drafts
          </div>
        </div>

        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-textSecondary text-xs font-medium">
            <span>Client Inquiries</span>
            <span className="text-base">📩</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-heading">{stats.totalInquiries}</div>
          <div className="text-[10px] text-textSecondary">
            <span className="text-amber-400 font-bold">{stats.unreadInquiries} New Unread</span> • {stats.resolvedInquiries} Resolved
          </div>
        </div>

        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-textSecondary text-xs font-medium">
            <span>Portfolio Views</span>
            <span className="text-base">👁️</span>
          </div>
          <div className="text-2xl font-black text-white font-heading">{stats.totalViews}</div>
          <div className="text-[10px] text-textSecondary">
            Global audience engagement
          </div>
        </div>

        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-textSecondary text-xs font-medium">
            <span>System Health</span>
            <span className="text-base">❤️</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading">{stats.systemHealth}</div>
          <div className="text-[10px] text-emerald-400/80 font-bold">
            MongoDB Atlas connected
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT INQUIRIES & QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Recent Inquiries */}
        <div className="md:col-span-2 bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-heading font-bold text-white">Recent Inquiries</h2>
            <Link to="/ownercontrols_panel/contacts" className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              View CRM →
            </Link>
          </div>
          
          <div className="space-y-2.5">
            {recentInquiries.length === 0 ? (
              <div className="text-center py-6 text-xs text-textSecondary">
                No inquiry submissions logged yet.
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq._id} className="p-3 bg-[#0B1120] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-textPrimary truncate">{inq.name}</p>
                    <p className="text-[10px] text-textSecondary truncate">{inq.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/5 text-textSecondary px-2 py-0.5 rounded-full capitalize">
                      {inq.service?.replace('-', ' ') || 'General'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      inq.status === 'unread' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-textSecondary'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Actions & Quick Links */}
        <div className="bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-white mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/ownercontrols_panel/cases"
                className="flex items-center justify-between p-3 bg-[#0B1120] border border-white/5 rounded-xl hover:border-amber-500/30 text-xs font-semibold text-textPrimary hover:text-amber-400 transition-all group"
              >
                <span>📁  Manage Case Studies</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/ownercontrols_panel/contacts"
                className="flex items-center justify-between p-3 bg-[#0B1120] border border-white/5 rounded-xl hover:border-amber-500/30 text-xs font-semibold text-textPrimary hover:text-amber-400 transition-all group"
              >
                <span>📩  Open Lead CRM</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/ownercontrols_panel/settings"
                className="flex items-center justify-between p-3 bg-[#0B1120] border border-white/5 rounded-xl hover:border-amber-500/30 text-xs font-semibold text-textPrimary hover:text-amber-400 transition-all group"
              >
                <span>⚙️  Configure Global Settings</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center">
            <span className="text-[10px] text-textSecondary uppercase tracking-widest">
              Server Version: 1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
