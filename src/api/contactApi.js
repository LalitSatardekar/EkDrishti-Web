// Mock API for contact form
// Replace this with actual axios calls when backend is ready

export const submitContactForm = async (formData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate API call
      if (formData.email && formData.name && formData.message) {
        resolve({
          success: true,
          message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.',
        })
      } else {
        reject({
          success: false,
          message: 'Please fill in all required fields.',
        })
      }
    }, 1000)
  })
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
