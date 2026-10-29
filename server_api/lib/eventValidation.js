export function validateEvent(body = {}) {
  if (!body || typeof body !== 'object') throw new Error('Event details are required.')
  const data = {}
  for (const [key, limit] of Object.entries({ title: 160, description: 2000, image: 4096, date: 10, location: 240 })) {
    if (body[key] != null && typeof body[key] !== 'string') throw new Error(`Invalid ${key}.`)
    data[key] = (body[key] || '').trim()
    if (data[key].length > limit) throw new Error(`${key} is too long.`)
  }
  if (!data.title || !data.image) throw new Error('Title and event image are required.')
  if (!/^https?:\/\//i.test(data.image) && !/^\/(?!\/)/.test(data.image)) throw new Error('Use an HTTPS image URL or a local image path.')
  if (data.date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date)) throw new Error('Choose a valid event date.')
  if (!['upcoming', 'covered'].includes(body.category)) throw new Error('Choose upcoming or covered.')
  if (!['banner', 'square'].includes(body.layout)) throw new Error('Choose banner or square.')
  if (typeof body.published !== 'boolean') throw new Error('Choose a publication status.')
  return { ...data, category: body.category, layout: body.layout, published: body.published }
}
