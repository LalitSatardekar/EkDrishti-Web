import { useState } from 'react'
import { submitContactForm } from '../api/contactApi'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: '',
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await submitContactForm(formData)
      setStatus({ type: 'success', message: response.message })
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: '',
      })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="section-container">
        {/* Header */}
          <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-4 md:mb-6">
            Let's Work Together
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Have a project in mind? We'd love to hear about it. Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Contact Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-textPrimary font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-textPrimary font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-textPrimary font-medium mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-textPrimary font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-textPrimary font-medium mb-2">
                  Service Interested In
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200"
                >
                  <option value="">Select a service</option>
                  <option value="brand-strategy">Brand Strategy</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="content-creation">Content Creation</option>
                  <option value="social-media">Social Media</option>
                  <option value="seo">SEO & Analytics</option>
                  <option value="performance">Performance Marketing</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-textPrimary font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors duration-200 resize-none"
                ></textarea>
              </div>

              {status.message && (
                <div
                  className={`p-4 rounded-lg ${
                    status.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-heading font-bold text-textPrimary mb-6">
                Get in Touch
              </h3>
              <p className="text-textSecondary mb-8">
                Prefer to reach out directly? Here are other ways to connect with us.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: '📧', label: 'Email', value: 'hello@digitalagency.com' },
                { icon: '📱', label: 'Phone', value: '+1 (555) 123-4567' },
                { icon: '📍', label: 'Office', value: '123 Digital Street, San Francisco, CA 94102' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-6 flex items-start space-x-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="font-heading font-semibold text-textPrimary mb-1">
                      {item.label}
                    </div>
                    <div className="text-textSecondary">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-8">
              <h4 className="font-heading font-bold text-textPrimary mb-4">
                Business Hours
              </h4>
              <div className="space-y-2 text-textSecondary">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-textPrimary">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-textPrimary">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-textPrimary">Closed</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h4 className="font-heading font-bold text-textPrimary mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                {['LinkedIn', 'Twitter', 'Instagram', 'Facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    <span className="text-sm font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
