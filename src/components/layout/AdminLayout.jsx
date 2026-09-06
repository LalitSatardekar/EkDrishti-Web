import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/ownercontrols_panel/login')
  }

  const navItems = [
    { path: '/ownercontrols_panel', label: '📊  Dashboard', exact: true },
    { path: '/ownercontrols_panel/cases', label: '📁  Case Studies' },
    { path: '/ownercontrols_panel/media', label: '🖼️  Media Library' },
    { path: '/ownercontrols_panel/contacts', label: '📩  Contact Forms' },
    { path: '/ownercontrols_panel/logs', label: '📋  Activity Logs' },
    { path: '/ownercontrols_panel/memory', label: '🧠  Project Memory' },
    { path: '/ownercontrols_panel/health', label: '❤️  System Health' },
    { path: '/ownercontrols_panel/settings', label: '⚙️  Settings' }
  ]

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path) && location.pathname !== '/ownercontrols_panel'
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-textPrimary flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0F172A] border-r border-white/5 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="text-amber-400 text-sm font-semibold tracking-[0.2em] uppercase block hover:opacity-85">
              Ekdrishti Group
            </Link>
            <span className="text-[10px] text-textSecondary uppercase tracking-widest block mt-1">CMS Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary border border-transparent'
                    }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="mt-8 pt-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
              {user?.username?.substring(0, 2) || 'AD'}
            </div>
            <div>
              <p className="text-xs font-semibold text-textPrimary">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-textSecondary capitalize">{user?.role || 'Administrator'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-red-500/20"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  )
}
