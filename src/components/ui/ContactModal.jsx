/**
 * ContactModal.jsx
 * ─────────────────────────────────────────────────────────────
 * Pop-up contact form rendered via React Portal.
 * Triggered from the Navbar "Let's Talk" button.
 *
 * TWEAK POINTS (see also CONTACT_CONFIG.md at project root):
 *  • Form fields      → edit the <form> section below
 *  • Service options  → edit the SERVICE_OPTIONS array
 *  • Modal max-width  → change max-w-lg on the dialog div
 *  • Animation        → framer-motion variants at bottom of file
 *  • Success message  → change the text in setStatus({ message: '...' })
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import DOMPurify from 'dompurify'
import { submitContactForm } from '../../api/contactApi'

// ── SERVICE OPTIONS ───────────────────────────────────────────
// Add, remove, or rename entries here.
// value: what gets sent to the backend
// label: what the user sees in the dropdown
const SERVICE_OPTIONS = [
  { value: '', label: 'Select a service' },
  { value: 'family-events', label: 'Family Events' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'production', label: 'Production' },
  { value: 'brand-strategy', label: 'Brand Strategy' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'seo', label: 'SEO & Analytics' },
  { value: 'performance', label: 'Performance Marketing' },
]

// ── INITIAL FORM STATE ────────────────────────────────────────
// Add/remove fields here AND in the <form> JSX below to keep in sync.
const INITIAL_FORM = {
  name: '',
  email: '',
  company: '',
  phone: '',
  service: '',
  message: '',
}

// ── SHARED INPUT CLASS ────────────────────────────────────────
// Central place to change input styling across all fields.
const INPUT_CLASS =
  'w-full px-4 py-3 bg-surface border border-borderSubtle rounded-lg text-textPrimary placeholder-textSecondary/50 focus:outline-none focus:border-accent transition-colors duration-200'

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── ESC KEY CLOSE ─────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent background scroll while modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Reset form & status when modal reopens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM)
      setStatus({ type: '', message: '' })
    }
  }, [isOpen])

  // ── FIELD CHANGE ──────────────────────────────────────────
  const handleChange = (e) => {
    const sanitized = DOMPurify.sanitize(e.target.value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
    setFormData((prev) => ({ ...prev, [e.target.name]: sanitized }))
  }

  // ── FORM SUBMIT ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await submitContactForm(formData)
      // ── TWEAK: change success message text here ──────────
      setStatus({
        type: 'success',
        message: response.message || "We'll get back to you within 24 hours!",
      })
      setFormData(INITIAL_FORM)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // ── PORTAL TARGET ─────────────────────────────────────────
  return createPortal(
    <>
      {/* ── BACKDROP ── click outside to close ───────────── */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── DIALOG ───────────────────────────────────────── */}
      {/* TWEAK: change max-w-lg to max-w-xl / max-w-2xl for wider modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card p-8 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── CLOSE BUTTON ─────────────────────────────── */}
          <button
            onClick={onClose}
            aria-label="Close contact form"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-amber-500/20 text-textSecondary hover:text-amber-400 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ── HEADER ───────────────────────────────────── */}
          {/* TWEAK: change heading/subheading text here */}
          <div className="mb-8">
            <h2
              id="contact-modal-title"
              className="text-2xl sm:text-3xl font-heading font-bold text-textPrimary mb-2"
            >
              Let's Work Together
            </h2>
            <p className="text-textSecondary text-sm leading-relaxed">
              Fill out the form and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* ── FORM ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Row 1: Name + Email */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="modal-name" className="block text-textPrimary font-medium mb-2 text-sm">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="modal-email" className="block text-textPrimary font-medium mb-2 text-sm">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Row 2: Company + Phone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="modal-company" className="block text-textPrimary font-medium mb-2 text-sm">
                  Company
                </label>
                <input
                  type="text"
                  id="modal-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  autoComplete="organization"
                  placeholder="Company name"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="modal-phone" className="block text-textPrimary font-medium mb-2 text-sm">
                  Phone
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Service Dropdown */}
            <div>
              <label htmlFor="modal-service" className="block text-textPrimary font-medium mb-2 text-sm">
                Service Interested In
              </label>
              <select
                id="modal-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={INPUT_CLASS}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="modal-message" className="block text-textPrimary font-medium mb-2 text-sm">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="modal-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Tell us about your project..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            {/* Status feedback */}
            {status.message && (
              <div
                role="alert"
                className={`p-4 rounded-lg text-sm ${
                  status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Submit */}
            {/* TWEAK: change button label / color by editing className below */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-5 w-5 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
