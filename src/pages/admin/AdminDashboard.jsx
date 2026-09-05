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
        
        const res = await fetch('/api/v1/dashboard', { headers })
        if (res.status === 401) {
          logout()
          navigate('/admin/login')
          return
        }

        const payload = await res.json()
        if (payload.success && payload.data) {
          const metrics = payload.data
          setStats({
            totalCases: metrics.portfolio.total,
            publishedCases: metrics.portfolio.published,
            draftCases: metrics.portfolio.drafts,
            totalViews: metrics.portfolio.totalViews || 0,
            unreadContacts: metrics.crm.unread,
            totalContacts: metrics.crm.total,
            todayContacts: metrics.crm.today,
            yesterdayContacts: metrics.crm.yesterday,
            last7DaysContacts: metrics.crm.last7Days,
            last30DaysContacts: metrics.crm.last30Days,
            mediaCount: metrics.media.count || 0,
            mediaSizeMb: metrics.media.sizeMb || 0
          })
          setRecentInquiries(metrics.recentInquiries || [])
          setIntegrations(metrics.integrations || { s3: 'Unknown', email: 'Unknown', db: 'Unknown' })
        } else {
          throw new Error(payload.message || 'Failed to load dashboard metrics')
        }
      } catch (err) {
        setError(err.message || 'An error occurred fetching dashboard metrics')
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
          <p className="text-textSecondary text-xs">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Dashboard Overview</h1>
        <p className="text-textSecondary text-xs">Real-time metrics and system health indicators</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️  {error}
        </div>
      )}

      {/* STATS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CRM Leads Tracker */}
        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 text-2xl">📩</div>
          <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Leads Growth (Today)</p>
          <p className="text-3xl font-heading font-bold text-amber-400 mt-2">{stats.todayContacts}</p>
          <p className="text-[10px] text-textSecondary mt-2">
            Yesterday: {stats.yesterdayContacts} · Last 30 Days: {stats.last30DaysContacts}
          </p>
        </div>

        {/* Portfolio Pageviews */}
        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 text-2xl">👁️</div>
          <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Portfolio Pageviews</p>
          <p className="text-3xl font-heading font-bold text-white mt-2">{stats.totalViews}</p>
          <p className="text-[10px] text-textSecondary mt-2">
            {stats.publishedCases} published · {stats.draftCases} drafts
          </p>
        </div>

        {/* Media Storage */}
        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 text-2xl">🖼️</div>
          <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Media Assets Capacity</p>
          <p className="text-3xl font-heading font-bold text-white mt-2">{stats.mediaSizeMb} MB</p>
          <p className="text-[10px] text-textSecondary mt-2">
            Total files: {stats.mediaCount} WebP assets
          </p>
        </div>

        {/* Integrators Health Status */}
        <div className="p-5 bg-[#0F172A]/40 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</div>
          <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Integrations Health</p>
          <p className="text-sm font-heading font-bold text-textPrimary mt-4 truncate">DB: Connected (Atlas)</p>
          <p className="text-[10px] text-textSecondary mt-1">
            S3: {integrations.s3.includes('Active') ? 'Active' : 'Offline'} · SMTP: {integrations.email.includes('Active') ? 'Active' : 'Offline'}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Recent Inquiries */}
        <div className="md:col-span-2 bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-heading font-bold text-white">Recent Inquiries</h2>
            <Link to="/admin/contacts" className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
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
                to="/admin/cases"
                className="flex items-center justify-between p-3 bg-[#0B1120] border border-white/5 rounded-xl hover:border-amber-500/30 text-xs font-semibold text-textPrimary hover:text-amber-400 transition-all group"
              >
                <span>📁  Manage Case Studies</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/admin/contacts"
                className="flex items-center justify-between p-3 bg-[#0B1120] border border-white/5 rounded-xl hover:border-amber-500/30 text-xs font-semibold text-textPrimary hover:text-amber-400 transition-all group"
              >
                <span>📩  Open Lead CRM</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/admin/settings"
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
