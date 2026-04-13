/**
 * contactApi.js
 * ─────────────────────────────────────────────────────────────
 * Sends form data to the Vercel Serverless Function at /api/contact.
 *
 * TWEAK POINTS:
 *  • API endpoint  → change '/api/contact' in the axios.post() call below
 *  • Timeout       → add `{ timeout: 10000 }` as 3rd arg to axios.post()
 *  • Success msg   → change the fallback string in the resolve block
 * ─────────────────────────────────────────────────────────────
 */

import axios from 'axios'

export const submitContactForm = async (formData) => {
  // TWEAK: endpoint URL — must match the serverless function path in /api/
  try {
    const response = await axios.post('/api/contact', formData)
    return response.data
  } catch (err) {
    // Surface the server's error message if available, otherwise use axios default
    const message =
      err?.response?.data?.message ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }
}

export const subscribeNewsletter = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && email.includes('@')) {
        resolve({
          success: true,
          message: 'Successfully subscribed to our newsletter!',
        })
      } else {
        reject({
          success: false,
          message: 'Please provide a valid email address.',
        })
      }
    }, 800)
  })
}
