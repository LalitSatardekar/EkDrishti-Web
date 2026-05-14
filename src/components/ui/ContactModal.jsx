/**
 * ContactModal.jsx
 * ─────────────────────────────────────────────────────────────
 * Pop-up contact form rendered via React Portal.
 * Triggered from the Navbar "Contact Us" button.
 *
 * TWEAK POINTS (see also CONTACT_CONFIG.md at project root):
 *  • Form fields      → edit the <form> section below
 *  • Service options  → edit the SERVICE_OPTIONS array
 *  • Modal width      → change max-w-3xl on the dialog div
 *  • Animations       → edit the framer-motion variants below
 *  • Success message  → edit the <SuccessScreen> JSX
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { submitContactForm } from '../../api/contactApi'

// ── SERVICE OPTIONS ───────────────────────────────────────────
const SERVICE_OPTIONS = [
  { value: '', label: 'What can we help you with?' },
  { value: 'family-events', label: '🎉  Family Events' },
  { value: 'digital-marketing', label: '📣  Digital Marketing' },
  { value: 'production', label: '🎬  Production' },
  { value: 'brand-strategy', label: '🧭  Brand Strategy' },
  { value: 'content-creation', label: '✍️  Content Creation' },
  { value: 'social-media', label: '📱  Social Media' },
  { value: 'seo', label: '📊  SEO & Analytics' },
  { value: 'performance', label: '🚀  Performance Marketing' },
]

// ── INITIAL FORM STATE ────────────────────────────────────────
const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
}

// ── SHARED INPUT CLASS ────────────────────────────────────────
const INPUT_CLASS =
  'w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/40 focus:outline-none focus:border-amber-500/60 focus:bg-[#0d1428] transition-all duration-200 text-sm'

// ── FRAMER-MOTION VARIANTS ────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 16,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

const successVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22, delay: 0.05 },
  },
}

// ── SUCCESS SCREEN ────────────────────────────────────────────
function SuccessScreen({ onClose }) {
  return (
    <motion.div
      key="success"
      variants={successVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center py-10 px-6 min-h-[340px]"
    >
      {/* Animated check circle */}
      <div className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-6">
        <svg
          className="w-9 h-9 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
          />
        </svg>
      </div>

      <h3 className="text-2xl font-heading font-bold text-textPrimary mb-3">
        Message Sent!
      </h3>
      <p className="text-textSecondary text-sm leading-relaxed max-w-xs mb-8">
        Thanks for reaching out. We'll review your message and get back to you
        within <span className="text-amber-400 font-medium">24 hours</span>.
      </p>

      <button
        onClick={onClose}
        className="px-8 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-amber-500/30"
      >
        Close
      </button>
    </motion.div>
  )
}

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
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

  // Reset form when modal reopens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM)
      setSubmitted(false)
      setError('')
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
    setError('')

    try {
      await submitContactForm(formData)
      setFormData(INITIAL_FORM)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── PORTAL TARGET ─────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── BACKDROP ────────────────────────────────── */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── DIALOG ──────────────────────────────────── */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-3xl overflow-hidden pointer-events-auto flex rounded-2xl shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── LEFT PANEL ─────────────────────────── */}
              <div
                className="hidden md:flex flex-col justify-between w-[38%] flex-shrink-0 p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #0d1224 0%, #151627 60%, #1a1040 100%)',
                }}
              >
                {/* Amber glow orb */}
                <div
                  className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
                  }}
                />

                <div>
                  {/* Brand */}
                  <div className="mb-5">
                    <div className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                      Ekdrishti Studios
                    </div>
                    <h2
                      id="contact-modal-title"
                      className="text-xl font-heading font-bold text-textPrimary leading-snug"
                    >
                      Let's create<br />
                      <span className="text-amber-400">something great</span><br />
                      together.
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className="w-10 h-0.5 bg-amber-500/40 mb-5 rounded-full" />

                  {/* Contact info */}
                  <div className="space-y-3 ">
                    <a href="mailto:edadmin@ekdrishti.com" className="flex items-start gap-3 group my-3">
                      <span className="mt-0.5 text-amber-500/70 group-hover:text-amber-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-textSecondary text-sm group-hover:text-textPrimary transition-colors">
                        edadmin@ekdrishti.com
                      </span>
                    </a>
                    <a href="tel:+918169667383" className="flex items-start gap-3 group">
                      <span className="mt-0.5 text-amber-500/70 group-hover:text-amber-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <span className="text-textSecondary text-sm group-hover:text-textPrimary transition-colors">
                        +91 816 966 7383
                      </span>
                    </a>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-amber-500/70">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span className="text-textSecondary text-sm">
                        Mon–Sun · 8 AM – 8 PM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom tagline */}
                <p className="text-textSecondary/50 text-xs leading-relaxed relative z-10">
                  We reply within 24 hours.
                </p>
              </div>

              {/* ── RIGHT PANEL ────────────────────────── */}
              <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{ background: '#10111f' }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Close contact form"
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-amber-500/20 text-textSecondary hover:text-amber-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <SuccessScreen key="success" onClose={onClose} />
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      className="p-6"
                    >
                      {/* Mobile-only header */}
                      <div className="md:hidden mb-4">
                        <div className="text-amber-400 text-xs font-semibold tracking-[0.18em] uppercase mb-1">
                          Ekdrishti Studios
                        </div>
                        <h2
                          id="contact-modal-title"
                          className="text-xl font-heading font-bold text-textPrimary"
                        >
                          Let's Work Together
                        </h2>
                      </div>

                      {/* Desktop header */}
                      <div className="hidden md:block mb-4">
                        <h3 className="text-base font-heading font-semibold text-textPrimary mb-0.5">
                          Send us a message
                        </h3>
                        <p className="text-textSecondary text-xs">
                          We'll get back to you within 24 hours.
                        </p>
                      </div>

                      {/* ── FORM ──────────────────────────── */}
                      <form onSubmit={handleSubmit} className="space-y-3" noValidate>

                        {/* Name + Email */}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="modal-name" className="block text-textSecondary text-xs font-medium mb-1 uppercase tracking-wide">
                              Name <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              id="modal-name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              autoComplete="name"
                              placeholder="Riya Sharma"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div>
                            <label htmlFor="modal-email" className="block text-textSecondary text-xs font-medium mb-1 uppercase tracking-wide">
                              Email <span className="text-amber-400">*</span>
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

                        {/* Phone + Service */}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="modal-phone" className="block text-textSecondary text-xs font-medium mb-1 uppercase tracking-wide">
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
                          <div>
                            <label htmlFor="modal-service" className="block text-textSecondary text-xs font-medium mb-1 uppercase tracking-wide">
                              Service
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
                        </div>

                        {/* Message */}
                        <div>
                          <label htmlFor="modal-message" className="block text-textSecondary text-xs font-medium mb-1 uppercase tracking-wide">
                            Message <span className="text-amber-400">*</span>
                          </label>
                          <textarea
                            id="modal-message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={3}
                            placeholder="Tell us about your project or vision..."
                            className={`${INPUT_CLASS} resize-none`}
                          />
                        </div>

                        {/* Error feedback */}
                        {error && (
                          <div
                            role="alert"
                            className="p-3.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400"
                          >
                            {error}
                          </div>
                        )}

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          aria-busy={isSubmitting}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending…
                            </>
                          ) : (
                            <>
                              Send Message
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
