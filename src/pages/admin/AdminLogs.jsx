import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogs() {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterOutcome, setFilterOutcome] = useState('all') // 'all', 'success', 'failure'
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [token])

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/v1/logs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setLogs(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch logs')
      }
    } catch (err) {
      setError(err.message || 'Error loading logs database entries')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(item => {
    const matchesSearch = 
      item.user?.toLowerCase().includes(search.toLowerCase()) ||
      item.action?.toLowerCase().includes(search.toLowerCase()) ||
      item.details?.toLowerCase().includes(search.toLowerCase())
    
    if (filterOutcome === 'all') return matchesSearch
    return matchesSearch && item.outcome === filterOutcome
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Activity Logs</h1>
        <p className="text-textSecondary text-xs">Security audit trail tracking system adjustments and portal modifications</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️  {error}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Filter audit log by operator, action keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#0F172A]/40 border border-white/5 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 text-xs"
        />
        <select
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
          className="px-4 py-2.5 bg-[#0F172A]/40 border border-white/5 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60 text-xs"
        >
          <option value="all">All Outcomes</option>
          <option value="success">Success Only</option>
          <option value="failure">Failure Only</option>
        </select>
      </div>

      {/* LOGS GRID/LIST */}
      <div className="bg-[#0F172A]/40 border border-white/5 rounded-2xl overflow-hidden p-6 space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
            <p className="text-textSecondary text-xs">Retrieving audit timeline...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-xs text-textSecondary">
            No activity logs found.
          </div>
        ) : (
          <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6 text-xs">
            {filteredLogs.map((log) => (
              <div key={log._id} className="relative group">
                {/* Bullet */}
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                  log.outcome === 'success' ? 'bg-emerald-500 border-emerald-500/40' : 'bg-red-500 border-red-500/40'
                }`} />

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white uppercase tracking-wider">{log.action}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      log.outcome === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {log.outcome}
                    </span>
                    <span className="text-[10px] text-textSecondary font-mono ml-auto">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-textSecondary">
                    Operator: <span className="text-textPrimary font-semibold">{log.user}</span> · Target: <span className="text-textPrimary font-semibold">{log.resource}</span>
                  </p>
                  {log.details && (
                    <p className="text-[10px] text-textSecondary/50 bg-[#0B1120] px-3 py-1.5 rounded-lg border border-white/5 w-fit mt-1 italic">
                      "{log.details}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
