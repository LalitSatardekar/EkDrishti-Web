/**
 * /api/contact.js  —  Vercel Serverless Function
 * ─────────────────────────────────────────────────────────────
 * Receives the contact form data, validates it, and sends a
 * formatted email via the Resend API.
 *
 * TWEAK POINTS (see also CONTACT_CONFIG.md at project root):
 *  • RECIPIENT_EMAIL  → who receives the notification
 *  • SENDER_ADDRESS   → "from" field (must be verified in Resend dashboard
 *                        OR use the default onboarding@resend.dev for testing)
 *  • EMAIL_SUBJECT    → subject line of the notification email
 *  • buildEmailHtml() → edit the HTML template for the email body
 *  • Required fields  → update the REQUIRED_FIELDS array
 *
 * ENV VARS NEEDED:
 *  RESEND_API_KEY  — from https://resend.com/api-keys
 * ─────────────────────────────────────────────────────────────
 */

import { Resend } from 'resend'

// ── CONFIG ────────────────────────────────────────────────────
// TWEAK: change destination email here
const RECIPIENT_EMAIL = 'tanmayjare29@gmail.com'

// TWEAK: change sender address here.
// Use 'onboarding@resend.dev' for testing without domain verification.
// For production, use a verified domain e.g. 'noreply@ekdrishti.com'
const SENDER_ADDRESS = 'onboarding@resend.dev'
const SENDER_NAME = 'Ekdrishti Website'

// TWEAK: change the subject line
const EMAIL_SUBJECT = '📩 New Contact Form Submission — Ekdrishti'

// TWEAK: add/remove required field names to match your form
const REQUIRED_FIELDS = ['name', 'email', 'message']

// ── INPUT LENGTH LIMITS ───────────────────────────────────────
// TWEAK: adjust max characters per field to suit your needs
const FIELD_MAX_LENGTHS = {
  name:    100,
  email:   254,   // RFC 5321 max email length
  company: 200,
  phone:    30,
  service: 100,
  message: 5000,
}

// ── EMAIL HTML TEMPLATE ───────────────────────────────────────
// TWEAK: edit the HTML below to change email body layout / styling
function buildEmailHtml(data) {
  const { name, email, company, phone, service, message } = data

  const row = (label, value) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;background:#f3f4f6;font-weight:600;color:#374151;width:130px;vertical-align:top;">${label}</td>
          <td style="padding:8px 12px;color:#1f2937;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
      : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#151627;padding:28px 32px;">
      <h1 style="margin:0;color:#f59e0b;font-size:22px;">New Contact Form Submission</h1>
      <p style="margin:6px 0 0;color:#9ca3af;font-size:14px;">Ekdrishti Studios Website</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Company', company)}
        ${row('Phone', phone)}
        ${row('Service', service)}
      </table>

      <div style="margin-top:24px;">
        <p style="margin:0 0 8px;font-weight:600;color:#374151;font-size:15px;">Message:</p>
        <div style="background:#f3f4f6;border-radius:6px;padding:16px;color:#1f2937;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">This email was sent from the contact form on ekdrishti.com</p>
    </div>
  </div>
</body>
</html>`
}

// ── SANITIZE ─────────────────────────────────────────────────
// Basic server-side HTML escape to prevent XSS in email body
function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ── VALIDATE EMAIL ────────────────────────────────────────────
function isValidEmail(email) {
  // RFC 5322-ish basic check — good enough for server-side guard
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── HANDLER ───────────────────────────────────────────────────
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed.' })
  }

  const body = req.body || {}

  // ── Validate required fields ─────────────────────────────
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || !String(body[field]).trim()) {
      return res.status(400).json({
        success: false,
        message: `Missing required field: ${field}`,
      })
    }
  }

  // ── Enforce field length limits ───────────────────────────
  for (const [field, max] of Object.entries(FIELD_MAX_LENGTHS)) {
    if (body[field] && String(body[field]).length > max) {
      return res.status(400).json({
        success: false,
        message: `Field "${field}" exceeds maximum length of ${max} characters.`,
      })
    }
  }

  // ── Validate email format ────────────────────────────────
  if (!isValidEmail(body.email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' })
  }

  // ── Guard: RESEND_API_KEY must be set ────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not set')
    return res.status(500).json({ success: false, message: 'Server configuration error.' })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_ADDRESS}>`,
      to: [RECIPIENT_EMAIL],
      // TWEAK: add a "reply-to" so you can reply directly to the sender
      replyTo: body.email,
      subject: EMAIL_SUBJECT,
      html: buildEmailHtml(body),
    })

    return res.status(200).json({
      success: true,
      message: "Thank you! We'll get back to you within 24 hours.",
    })
  } catch (err) {
    console.error('[contact] Resend error:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again.',
    })
  }
}
