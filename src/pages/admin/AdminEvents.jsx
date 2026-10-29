import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { eventsRequest } from '../../api/eventsApi'
import { uploadMediaFile } from '../../api/mediaApi'
import EventCard from '../../components/events/EventCard'
import '../events.css'

const blank = () => ({ title: '', description: '', image: '', date: '', location: '', category: 'upcoming', layout: 'banner', published: false })
const inputClass = 'w-full rounded-lg bg-[#0B1120] border border-white/20 p-3 text-sm mt-2'

export default function AdminEvents() {
  const { token } = useAuth()
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState(null)
  async function load() {
    setLoading(true)
    try { setEvents(await eventsRequest({ token, admin: true })) } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token])
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }))
  async function save(e) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      await eventsRequest({ token, method: editing ? 'PUT' : 'POST', id: editing, body: form })
      setForm(null); setEditing(null); setMessage('Event saved.'); await load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function upload(file) {
    if (!file) return
    setBusy(true); setError('')
    try { const media = await uploadMediaFile(file, token); change('image', media.src) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function remove(id) {
    setBusy(true); setError(''); setMessage('')
    try { await eventsRequest({ token, method: 'DELETE', id }); setDeleting(null); setMessage('Event deleted.'); await load() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="max-w-6xl mx-auto">
    <div className="flex flex-wrap justify-between items-center gap-4 mb-8"><div><h1 className="text-3xl font-bold">Events</h1><p className="text-textSecondary mt-2">Manage upcoming events and events covered by Ekdrishti.</p></div><div className="flex gap-4 items-center"><Link className="text-amber-400" to="/events" target="_blank" rel="noopener noreferrer">View events ↗</Link><button disabled={busy} className="rounded-lg bg-amber-500 text-black px-4 py-3" onClick={() => { setForm(blank()); setEditing(null); setError(''); setMessage('') }}>Create event</button></div></div>
    {error && <p role="alert" className="p-4 mb-4 bg-red-500/10 text-red-300">{error}</p>}
    {message && <p role="status" className="p-4 mb-4 text-green-300">{message}</p>}
    {form && <form onSubmit={save} className="p-6 rounded-xl border border-white/10 bg-[#0F172A] mb-8 space-y-5">
      <h2 className="text-xl font-semibold">{editing ? 'Update event' : 'Create event'}</h2>
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
        <label className="block">Event title<input required maxLength={160} className={inputClass} value={form.title} onChange={e => change('title', e.target.value)} /></label>
        <div className="grid md:grid-cols-2 gap-5"><label>Section<select className={inputClass} value={form.category} onChange={e => change('category', e.target.value)}><option value="upcoming">Upcoming Events</option><option value="covered">Featured events / Covered</option></select></label><label>Display style<select className={inputClass} value={form.layout} onChange={e => change('layout', e.target.value)}><option value="banner">Wide banner</option><option value="square">Square card</option></select></label></div>
        <div className="grid md:grid-cols-2 gap-5"><label>Event date<input type="date" className={inputClass} value={form.date} onChange={e => change('date', e.target.value)} /></label><label>Location<input maxLength={240} className={inputClass} value={form.location} onChange={e => change('location', e.target.value)} /></label></div>
        <label className="block">Description<textarea rows={3} maxLength={2000} className={inputClass} value={form.description} onChange={e => change('description', e.target.value)} /></label>
        <label className="block">Event image URL<input required className={inputClass} value={form.image} placeholder="https://… or /assets/…" onChange={e => change('image', e.target.value)} /></label>
        <label className="block">Or upload an image<input type="file" accept="image/*" className="block mt-2 text-sm" onChange={e => upload(e.target.files[0])} /></label>
        <p className="text-sm text-textSecondary">Recommended: 1920 × 400 for banners, 800 × 800 for squares. Images are shown in full without cropping.</p>
        <label className="flex gap-3 items-center"><input type="checkbox" checked={form.published} onChange={e => change('published', e.target.checked)} />Publish on the events page</label>
        {form.image && <div><p className="mb-3 text-sm text-textSecondary">Preview</p><div className="events-grid"><EventCard event={form} /></div></div>}
        <div className="flex gap-4"><button className="px-5 py-3 rounded-lg bg-amber-500 text-black" type="submit">Save event</button><button type="button" onClick={() => setForm(null)}>Cancel</button></div>
      </fieldset>{busy && <p role="status">Saving changes / uploading image…</p>}
    </form>}
    {loading ? <p role="status">Loading events…</p> : !events.length ? <p className="text-textSecondary p-8 border border-white/10 rounded-xl">No events yet. Create your first event to get started.</p> : <div className="space-y-4">{events.map(event => <article key={event._id} className="flex flex-wrap items-center gap-5 p-4 border border-white/10 rounded-xl bg-[#0F172A]">
      <img src={event.image} alt="" className="w-28 h-20 object-contain bg-[#0B1120]" /><div className="flex-1 min-w-0"><h2 className="font-semibold break-words">{event.title}</h2><p className="text-sm text-textSecondary mt-1">{event.category === 'covered' ? 'Covered' : 'Upcoming'} · {event.layout} · {event.published ? 'Published' : 'Draft'}{event.date ? ` · ${event.date}` : ''}</p></div>
      {deleting === event._id ? <div className="flex gap-3 items-center flex-wrap"><span>Delete this event permanently?</span><button disabled={busy} className="text-red-400" onClick={() => remove(event._id)}>Confirm delete</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div> : <div className="flex gap-4"><button disabled={busy} className="text-amber-400" onClick={() => { setEditing(event._id); setForm({ ...event }); setError(''); setMessage(''); window.scrollTo({ top: 0 }) }}>Edit</button><button disabled={busy} className="text-red-400" onClick={() => setDeleting(event._id)}>Delete</button></div>}
    </article>)}</div>}
  </div>
}
