import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read', 'archived'
  const [searchTerm, setSearchTerm] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    fetchContacts()
  }, [token])

  const fetchContacts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/v1/contact', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const list = data.data || []
        setContacts(list)
        if (list.length > 0) {
          setSelectedContact(list[0])
        }
      } else {
        throw new Error(data.message || 'Failed to fetch contacts')
      }
    } catch (err) {
      setError(err.message || 'Error occurred fetching database contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (item, nextStatus) => {
    try {
      const res = await fetch(`/v1/contact?id=${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (data.success) {
        const updated = { ...item, status: nextStatus }
        setContacts(prev => prev.map(c => c._id === item._id ? updated : c))
        if (selectedContact?._id === item._id) {
          setSelectedContact(updated)
        }
      } else {
        throw new Error(data.message || 'Update failed')
      }
    } catch (err) {
      alert(`Error updating inquiry status: ${err.message}`)
    }
  }

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact inquiry forever?')) {
      return
    }

    try {
      const res = await fetch(`/v1/contact?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const remaining = contacts.filter(c => c._id !== id)
        setContacts(remaining)
        setSelectedContact(remaining.length > 0 ? remaining[0] : null)
      } else {
        throw new Error(data.message || 'Deletion failed')
      }
    } catch (err) {
      alert(`Error deleting inquiry: ${err.message}`)
    }
  }

  const handleExportCSV = () => {
    if (contacts.length === 0) {
      alert('No contacts available to export.')
      return
    }

    const headers = ['Name', 'Company', 'Email', 'Phone', 'Service', 'Message', 'Status', 'IP Address', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Landing Page', 'Created At']
    const rows = contacts.map(c => [
      `"${c.name?.replace(/"/g, '""') || ''}"`,
      `"${c.company?.replace(/"/g, '""') || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.service || ''}"`,
      `"${c.message?.replace(/"/g, '""') || ''}"`,
      `"${c.status || ''}"`,
      `"${c.ip || ''}"`,
      `"${c.utm_source || ''}"`,
      `"${c.utm_medium || ''}"`,
      `"${c.utm_campaign || ''}"`,
      `"${c.landingPage || ''}"`,
      `"${new Date(c.created_at).toLocaleString()}"`
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ekdrishti_crm_leads_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter & Search logic
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch && c.status !== 'archived'
    return matchesSearch && c.status === filter
  })

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Inquiries & CRM</h1>
          <p className="text-textSecondary text-xs">View, categorize, and respond to incoming project leads</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-textPrimary hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all text-xs"
        >
          📥 Export CRM Leads (CSV)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️  {error}
        </div>
      )}

      {/* CRM PANEL WORKSPACE */}
      <div className="flex-1 min-h-[500px] grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#0F172A]/40 border border-white/5 rounded-2xl overflow-hidden">
        {/* LEFT COLUMN: LIST */}
        <div className="lg:col-span-1 border-r border-white/5 flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-white/5 space-y-3">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 text-xs"
            />
            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#0B1120] p-1 rounded-xl border border-white/5 text-[10px] text-center font-bold font-heading">
              {['all', 'unread', 'read', 'archived'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-1.5 rounded-lg capitalize transition-all ${
                    filter === tab ? 'bg-amber-500 text-primary' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List contents */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[480px]">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
                <p className="text-textSecondary text-[10px]">Retrieving leads...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-20 text-[10px] text-textSecondary">
                No inquiries in this folder.
              </div>
            ) : (
              filteredContacts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelectedContact(c)
                    if (c.status === 'unread') {
                      handleUpdateStatus(c, 'read')
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-white/[0.02] transition-all text-xs space-y-1 relative ${
                    selectedContact?._id === c._id ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  {c.status === 'unread' && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <div className="flex justify-between items-start pr-4">
                    <p className="font-bold text-white truncate max-w-[140px]">
                      {c.name} {c.company ? <span className="font-normal text-textSecondary text-[10px]">({c.company})</span> : ''}
                    </p>
                    <span className="text-[9px] text-textSecondary text-right font-mono">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-textSecondary truncate">{c.email}</p>
                  <p className="text-[10px] text-textSecondary/50 truncate italic mt-1">"{c.message}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS VIEW */}
        <div className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
          {selectedContact ? (
            <>
              {/* DETAILS CARD HEADER */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                      <span>{selectedContact.name}</span>
                      {selectedContact.company && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-textSecondary border border-white/10 font-normal">
                          {selectedContact.company}
                        </span>
                      )}
                    </h2>
                    <p className="text-textSecondary text-xs">Submitted on {new Date(selectedContact.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedContact, selectedContact.status === 'unread' ? 'read' : 'unread')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        selectedContact.status === 'unread'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-white/5 text-textSecondary border-white/10'
                      }`}
                    >
                      {selectedContact.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                    </button>
                    {selectedContact.status !== 'archived' ? (
                      <button
                        onClick={() => handleUpdateStatus(selectedContact, 'archived')}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 text-textSecondary border border-white/10 transition-all"
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(selectedContact, 'read')}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 text-textSecondary border border-white/10 transition-all"
                      >
                        Unarchive
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteContact(selectedContact._id)}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* DETAILS FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-[#0B1120] p-4 rounded-xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Email Address</p>
                    <p className="text-white font-mono break-all"><a href={`mailto:${selectedContact.email}`} className="text-amber-400 hover:underline">{selectedContact.email}</a></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Phone Number</p>
                    <p className="text-white font-mono">{selectedContact.phone ? <a href={`tel:${selectedContact.phone}`} className="text-amber-400 hover:underline">{selectedContact.phone}</a> : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Company / Brand</p>
                    <p className="text-white">{selectedContact.company || 'Personal / None'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Requested Service</p>
                    <p className="text-white capitalize">{selectedContact.service?.replace('-', ' ') || 'General / Unspecified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Attribution Source</p>
                    <p className="text-white text-[11px]">
                      {selectedContact.utm_source ? (
                        <span>Source: <strong>{selectedContact.utm_source}</strong> {selectedContact.utm_campaign ? `(${selectedContact.utm_campaign})` : ''}</span>
                      ) : (
                        <span>Direct / Organic</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Landing Page</p>
                    <p className="text-[11px] text-textSecondary truncate" title={selectedContact.landingPage || 'Direct'}>
                      {selectedContact.landingPage || 'Home'}
                    </p>
                  </div>
                </div>

                {/* MESSAGE BOX */}
                <div className="space-y-2">
                  <p className="text-textSecondary font-semibold uppercase tracking-wider text-[9px]">Message Body</p>
                  <div className="bg-[#0B1120] border border-white/5 rounded-xl p-4 text-textPrimary text-xs leading-relaxed white-space-pre-wrap font-body max-h-[200px] overflow-y-auto select-text">
                    {selectedContact.message}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (MULTI-CHANNEL) */}
              <div className="border-t border-white/5 pt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: Ekdrishti Inquiry&body=Hi ${selectedContact.name},%0D%0A%0D%0AThank you for reaching out to Ekdrishti Studios regarding ${selectedContact.service || 'your inquiry'}...`}
                  className="flex-1 text-center bg-amber-500 hover:bg-amber-400 text-primary font-bold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  ✉️  Reply via Email
                </a>

                {selectedContact.phone && (
                  <>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 border border-blue-500/20"
                      title="Call Lead directly"
                    >
                      📞 Call Phone
                    </a>
                    <a
                      href={`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedContact.name)},%20thank%20you%20for%20contacting%20Ekdrishti%20Studios!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 border border-emerald-500/20"
                      title="Chat on WhatsApp"
                    >
                      💬 WhatsApp
                    </a>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-textSecondary">
              No inquiry selected. Choose one from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
