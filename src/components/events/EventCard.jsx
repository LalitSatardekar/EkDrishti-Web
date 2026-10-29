export default function EventCard({ event, layout = event.layout }) {
  return <article className={`event-card event-card--${layout}`}>
    <img src={event.image} alt={event.title} loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden' }} onLoad={e => { e.currentTarget.style.visibility = 'visible' }} />
    <div className="event-card-caption">
      <h3>{event.title}</h3>
      {(event.date || event.location) && <p>{[event.date ? new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '', event.location].filter(Boolean).join(' · ')}</p>}
      {event.description && <p>{event.description}</p>}
    </div>
  </article>
}
