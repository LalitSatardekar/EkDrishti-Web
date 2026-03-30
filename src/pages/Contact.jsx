import { useState } from 'react'
import DOMPurify from 'dompurify'
import SEO from '../components/ui/SEO'
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
    // Sanitize input to prevent XSS attacks
    const sanitizedValue = DOMPurify.sanitize(e.target.value, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: []
    })
    
    setFormData({
      ...formData,
      [e.target.name]: sanitizedValue,
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
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Ekdrishti Studios. Let's discuss your next project and bring your vision to life."
        keywords="contact ekdrishti, get in touch, project inquiry, digital marketing contact, event photography booking"
      />
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
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={isSubmitting}
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
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
              {/* Email */}
              <a
                href="mailto:edadmin@ekdrishti.com"
                className="glass-card p-6 flex items-start space-x-4 hover:border-amber-500/30 transition-colors duration-200 group"
              >
                <div className="text-3xl">📧</div>
                <div>
                  <div className="font-heading font-semibold text-textPrimary mb-1">
                    Email
                  </div>
                  <div className="text-textSecondary group-hover:text-amber-400 transition-colors duration-200">
                    edadmin@ekdrishti.com
                  </div>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+918169667383"
                className="glass-card p-6 flex items-start space-x-4 hover:border-amber-500/30 transition-colors duration-200 group"
              >
                <div className="text-3xl">📱</div>
                <div>
                  <div className="font-heading font-semibold text-textPrimary mb-1">
                    Phone
                  </div>
                  <div className="text-textSecondary group-hover:text-amber-400 transition-colors duration-200">
                    +91 816 966 7383
                  </div>
                </div>
              </a>

              {/* Address */}
              <a
                href="https://maps.google.com/?q=Plot+no+20,+Room+no.+B,+Swaroop+CHS,+Mulund+-+Airoli+Rd,+MHADA+Colony,+Mulund+East,+Mumbai,+Maharashtra+400081"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 flex items-start space-x-4 hover:border-amber-500/30 transition-colors duration-200 group"
              >
                <div className="text-3xl">📍</div>
                <div>
                  <div className="font-heading font-semibold text-textPrimary mb-1">
                    Office
                  </div>
                  <div className="text-textSecondary group-hover:text-amber-400 transition-colors duration-200">
                    Plot no 20, Room no. B, Swaroop CHS,<br />
                    Mulund - Airoli Rd, MHADA Colony,<br />
                    Mulund East, Mumbai, Maharashtra 400081
                  </div>
                </div>
              </a>
            </div>

            <div className="glass-card p-8">
              <h4 className="font-heading font-bold text-textPrimary mb-4">
                Business Hours
              </h4>
              <div className="space-y-2 text-textSecondary">
                <div className="flex justify-between">
                  <span>Monday - Sunday</span>
                  <span className="font-medium text-textPrimary">8:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h4 className="font-heading font-bold text-textPrimary mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.linkedin.com/company/ekdrishti-group/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our LinkedIn page"
                  className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all duration-300"
                >
                  <span className="text-sm font-medium">L</span>
                </a>
                <a
                  href="https://www.instagram.com/ekdrishti_official?igsh=MXFibWJhd25jbW5wbw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Instagram page"
                  className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all duration-300"
                >
                  <span className="text-sm font-medium">I</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Contact
