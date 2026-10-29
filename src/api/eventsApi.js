export async function eventsRequest({ token, method = 'GET', body, id, admin = false, signal } = {}) {
  const query = new URLSearchParams({ ...(id ? { id } : {}), ...(admin ? { admin: '1' } : {}) })
  const response = await fetch(`/v1/events?${query}`, {
    method, signal,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load events. Please try again.')
  return result.data
}
