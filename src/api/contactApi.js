export const submitContactForm = async (formData) => {
  const query = new URLSearchParams(window.location.search)
  const attribution = {
    utm_source: query.get('utm_source') || undefined,
    utm_medium: query.get('utm_medium') || undefined,
    utm_campaign: query.get('utm_campaign') || undefined,
    utm_term: query.get('utm_term') || undefined,
    utm_content: query.get('utm_content') || undefined,
    landingPage: window.location.pathname || undefined,
    referrer: document.referrer || undefined
  }

  const payload = {
    ...formData,
    ...attribution
  }

  const response = await fetch('/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }

  return data
}

export const subscribeNewsletter = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && email.includes('@')) {
        resolve({ success: true, message: 'Successfully subscribed to our newsletter!' })
      } else {
        reject({ success: false, message: 'Please provide a valid email address.' })
      }
    }, 800)
  })
}