import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminCasesListing() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCaseData, setNewCaseData] = useState({ title: '', slug: '', service: 'family-events', category: 'EVENTS' })
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCases()
  }, [token])

  const fetchCases = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/cases', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setCases(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch cases')
      }
    } catch (err) {
      setError(err.message || 'Error occurred fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/v1/cases?id=${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (data.success) {
        setCases(prev => prev.map(c => c._id === item._id ? { ...c, status: nextStatus } : c))
      } else {
        throw new Error(data.message || 'Update failed')
      }
    } catch (err) {
      alert(`Error toggling status: ${err.message}`)
    }
  }

  const handleToggleFeatured = async (item) => {
    const nextFeatured = !item.featured
    try {
      const res = await fetch(`/api/v1/cases?id=${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: nextFeatured })
      })
      const data = await res.json()
      if (data.success) {
        setCases(prev => prev.map(c => c._id === item._id ? { ...c, featured: nextFeatured } : c))
      } else {
        throw new Error(data.message || 'Update failed')
      }
    } catch (err) {
      alert(`Error toggling featured: ${err.message}`)
    }
  }

  const handleDeleteCase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case study? This action is irreversible.')) {
      return
    }

    try {
      const res = await fetch(`/api/v1/cases?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setCases(prev => prev.filter(c => c._id !== id))
      } else {
        throw new Error(data.message || 'Deletion failed')
      }
    } catch (err) {
      alert(`Error deleting case study: ${err.message}`)
    }
  }

  const handleDuplicateCase = async (item) => {
    try {
      const timestamp = Date.now().toString().slice(-4)
      const clonedSlug = `${item.slug}-copy-${timestamp}`
      
      const clone = {
        ...item,
        _id: undefined,
        slug: clonedSlug,
        title: `${item.title} (Cloned)`,
        featured: false,
        status: 'draft',
        created_at: undefined,
        updated_at: undefined
      }

      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(clone)
      })

      const data = await res.json()
      if (data.success) {
        setCases(prev => [data.data, ...prev])
      } else {
        throw new Error(data.message || 'Duplication failed')
      }
    } catch (err) {
      alert(`Error duplicating case: ${err.message}`)
    }
  }

  const handleCreateCase = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')

    try {
      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCaseData)
      })

      const data = await res.json()
      if (data.success) {
        setShowCreateModal(false)
        setNewCaseData({ title: '', slug: '', service: 'family-events', category: 'EVENTS' })
        navigate(`/admin/cases/${data.data._id}`)
      } else {
        throw new Error(data.message || 'Creation failed')
      }
    } catch (err) {
      setCreateError(err.message || 'Error occurred creating case study')
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredCases = cases.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === '' || item.category?.toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Case Studies</h1>
          <p className="text-textSecondary text-xs">Manage project galleries, section layouts, and client links</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-primary font-bold py-2.5 px-5 rounded-xl transition-all text-xs flex items-center gap-2"
        >
          <span>＋</span> New Case Study
        </button>
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
          placeholder="Search by title or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#0F172A]/40 border border-white/5 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 focus:bg-[#0d1428] transition-all text-xs"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-[#0F172A]/40 border border-white/5 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60 focus:bg-[#0d1428] transition-all text-xs"
        >
          <option value="">All Categories</option>
          <option value="EVENTS">Events</option>
          <option value="PRODUCTION">Production</option>
          <option value="DIGITAL MARKETING">Digital Marketing</option>
        </select>
      </div>

      {/* LIST TABLE */}
      <div className="bg-[#0F172A]/40 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
            <p className="text-textSecondary text-xs">Retrieving portfolio listing...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-20 text-xs text-textSecondary">
            No case studies found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#0F172A]/80 text-textSecondary uppercase font-semibold tracking-wider">
                  <th className="p-4">Case Study</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCases.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-all">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-[10px] text-textSecondary font-mono mt-0.5">/{item.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          item.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.status || 'draft'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`text-lg transition-transform active:scale-95 ${
                          item.featured ? 'text-amber-400' : 'text-textSecondary/20 hover:text-textSecondary'
                        }`}
                      >
                        ★
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/admin/cases/${item._id}`}
                        className="inline-block bg-white/5 hover:bg-amber-500/20 text-textPrimary hover:text-amber-400 font-bold py-1.5 px-3 rounded transition-all"
                      >
                        ⚙️  Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicateCase(item)}
                        className="bg-white/5 hover:bg-white/10 text-textSecondary hover:text-textPrimary font-bold py-1.5 px-3 rounded transition-all"
                        title="Duplicate study"
                      >
                        🗐  Clone
                      </button>
                      <button
                        onClick={() => handleDeleteCase(item._id)}
                        className="bg-white/5 hover:bg-red-500/20 text-textSecondary hover:text-red-400 font-bold py-1.5 px-3 rounded transition-all"
                        title="Delete study"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F172A] border border-white/5 p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h2 className="text-lg font-heading font-bold text-white">Create Case Study</h2>
            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                ⚠️  {createError}
              </div>
            )}
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Brand Campaign 2026"
                  value={newCaseData.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    setNewCaseData(prev => ({ ...prev, title, slug }))
                  }}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Slug</label>
                <input
                  type="text"
                  required
                  placeholder="brand-campaign-2026"
                  value={newCaseData.slug}
                  onChange={(e) => setNewCaseData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Category</label>
                  <select
                    value={newCaseData.category}
                    onChange={(e) => {
                      const category = e.target.value
                      const service = category === 'EVENTS' ? 'family-events' : category === 'PRODUCTION' ? 'production' : 'digital-marketing'
                      setNewCaseData(prev => ({ ...prev, category, service }))
                    }}
                    className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="EVENTS">Events</option>
                    <option value="PRODUCTION">Production</option>
                    <option value="DIGITAL MARKETING">Digital Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Service Slug</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={newCaseData.service}
                    className="w-full px-3 py-2 bg-[#0B1120]/40 border border-white/5 rounded-xl text-textSecondary focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-textPrimary font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-primary font-bold transition-all disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create & Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
