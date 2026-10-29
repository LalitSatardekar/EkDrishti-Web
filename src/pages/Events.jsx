import { useEffect, useState } from 'react'
import SEO from '../components/ui/SEO'
import EventCard from '../components/events/EventCard'
import { eventsRequest } from '../api/eventsApi'
import './events.css'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    eventsRequest({ signal: controller.signal }).then(setEvents).catch(e => { if (e.name !== 'AbortError') setError(e.message) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])
  return <main className="events-page">
    <SEO title="Events | Ekdrishti" description="Explore upcoming events and events covered by the Ekdrishti team." url="https://www.ekdrishti.com/events" />
    {loading ? <p role="status" className="events-message">Loading events…</p> : error ? <div role="alert" className="events-message">{error} <button onClick={() => setAttempt(v => v + 1)}>Try again</button></div> : [['upcoming', 'Upcoming Events'], ['covered', 'Featured events by Ekdrishti']].map(([category, title]) => {
      const items = events.filter(event => event.category === category).sort((a, b) => category === 'upcoming' ? (a.date || '9999').localeCompare(b.date || '9999') : (b.date || '').localeCompare(a.date || ''))
      return <section className="events-section" key={category}><h1>{title}</h1><div className="events-grid">{items.map(event => <EventCard key={event._id} event={event} />)}</div>{!items.length && <p className="events-message">{category === 'upcoming' ? 'Upcoming events will be announced here. Stay tuned.' : 'Our event coverage will appear here soon.'}</p>}</section>
    })}
  </main>
}
