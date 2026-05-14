const WEB3FORMS_ACCESS_KEY = 'dd46a504-4e30-4819-8242-d7c264443b6a'

export const submitContactForm = async (formData) => {
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: '📩 New Contact Form Submission — Ekdrishti',
    from_name: 'Ekdrishti Website',
    ...formData,
  }

  const response = await fetch('https://api.web3forms.com/submit', {
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