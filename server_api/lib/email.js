import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USERNAME = process.env.SMTP_USERNAME || process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.SMTP_PASS
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'tanmayjare29@gmail.com'
const SENDER_ADDRESS = process.env.SENDER_ADDRESS || SMTP_USERNAME || 'notifications@ekdrishti.com'
const SENDER_NAME = process.env.SENDER_NAME || 'Ekdrishti Studios'

/**
 * Creates and returns the Nodemailer transport instance
 */
function getTransporter() {
  if (!SMTP_HOST || !SMTP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    }
  })
}

/**
 * Sends a high-converting notification email to the studio admin for every new lead.
 */
export async function sendAdminNotification({ name, email, phone, company, service, message, contactId, utm_source, landingPage }) {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn(`[EMAIL MOCK] SMTP credentials not set in environment. Mocking Admin Notification for lead: ${name} <${email}>`)
    return { success: true, mocked: true }
  }

  const subject = `📩 New Lead: ${name} ${company ? `(${company})` : ''} — ${service || 'General Inquiry'}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0B1120; color: #F1F5F9; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 24px; border-bottom: 1px solid #334155; text-align: center; }
        .logo-text { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #F59E0B; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 13px; color: #94A3B8; margin-top: 4px; }
        .content { padding: 28px; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        td { padding: 10px 0; border-bottom: 1px solid #1E293B; font-size: 13px; vertical-align: top; }
        .label { width: 130px; font-weight: 600; color: #94A3B8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .value { color: #FFFFFF; font-weight: 500; }
        .value a { color: #F59E0B; text-decoration: none; }
        .message-box { margin-top: 20px; padding: 16px; background: #0B1120; border-radius: 12px; border: 1px solid #1E293B; font-size: 14px; line-height: 1.6; color: #E2E8F0; white-space: pre-wrap; }
        .cta-btn { display: inline-block; margin-top: 24px; background: #F59E0B; color: #0F172A; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; text-align: center; }
        .footer { padding: 20px; background: #080D1A; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-text">EKDRISHTI STUDIOS</div>
          <div class="subtitle">New Website Inquiry Notification</div>
        </div>
        <div class="content">
          <span class="badge">${service ? service.replace('-', ' ') : 'General Lead'}</span>
          <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF;">Inquiry from ${name}</h2>
          <table>
            <tr>
              <td class="label">Client Name</td>
              <td class="value">${name}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td class="value"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td class="value">${phone ? `<a href="tel:${phone}">${phone}</a>` : '<span style="color: #64748B;">N/A</span>'}</td>
            </tr>
            ${company ? `
            <tr>
              <td class="label">Company / Brand</td>
              <td class="value">${company}</td>
            </tr>
            ` : ''}
            <tr>
              <td class="label">Service Required</td>
              <td class="value" style="text-transform: capitalize;">${service ? service.replace('-', ' ') : 'General'}</td>
            </tr>
            ${utm_source || landingPage ? `
            <tr>
              <td class="label">Attribution</td>
              <td class="value" style="font-size: 11px; color: #94A3B8;">
                ${utm_source ? `Source: <strong>${utm_source}</strong> &bull; ` : ''}
                ${landingPage ? `Page: ${landingPage}` : ''}
              </td>
            </tr>
            ` : ''}
          </table>

          <div style="margin-top: 20px;">
            <div style="font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; margin-bottom: 6px;">Client Message:</div>
            <div class="message-box">${message}</div>
          </div>

          <div style="text-align: center;">
            <a href="mailto:${email}?subject=Re: Your Inquiry with Ekdrishti Studios&body=Hi ${name},%0D%0A%0D%0AThank you for reaching out to Ekdrishti Studios regarding ${service || 'your project'}...%0D%0A" class="cta-btn">
              ✉️ Reply to ${name}
            </a>
          </div>
        </div>
        <div class="footer">
          Inquiry ID: ${contactId || 'N/A'} &bull; Received at ${new Date().toLocaleString()} &bull; Logged in Ekdrishti CRM
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_ADDRESS}>`,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject,
      html
    })
    return { success: true }
  } catch (err) {
    console.error('Nodemailer admin notification error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Sends a branded confirmation / auto-responder email to the client who filled out the form.
 */
export async function sendClientConfirmation({ name, email, service }) {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn(`[EMAIL MOCK] SMTP credentials not set. Mocking Client Confirmation for ${name} <${email}>`)
    return { success: true, mocked: true }
  }

  const subject = `We've received your message — Ekdrishti Studios`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0B1120; color: #F1F5F9; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 28px; text-align: center; border-bottom: 1px solid #334155; }
        .logo { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #F59E0B; text-transform: uppercase; margin: 0; }
        .content { padding: 32px 28px; line-height: 1.7; font-size: 14px; color: #CBD5E1; }
        .greeting { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 14px; }
        .highlight { color: #F59E0B; font-weight: 600; }
        .footer { padding: 20px; background: #080D1A; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; }
        .contact-links { margin-top: 20px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 12px; color: #94A3B8; }
        .contact-links a { color: #F59E0B; text-decoration: none; margin: 0 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">EKDRISHTI STUDIOS</div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Cinematography &bull; Photography &bull; Digital Marketing</div>
        </div>
        <div class="content">
          <div class="greeting">Hi ${name},</div>
          <p>
            Thank you for reaching out to us! We have successfully received your inquiry ${service ? `regarding <span class="highlight">${service.replace('-', ' ')}</span>` : ''}.
          </p>
          <p>
            Our creative & strategy team is reviewing your project requirements and will get in touch with you within <strong>24 business hours</strong>.
          </p>
          <p>
            In the meantime, feel free to explore our recent work and creative showcases on our website or social channels.
          </p>

          <div class="contact-links">
            <strong>Need immediate assistance?</strong><br>
            <a href="mailto:edadmin@ekdrishti.com">📧 edadmin@ekdrishti.com</a> | 
            <a href="tel:+918169667383">📱 +91 816 966 7383</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ekdrishti Studios. All rights reserved.<br>
          Transforming brands through strategic digital marketing and creative excellence.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_ADDRESS}>`,
      to: email,
      subject,
      html
    })
    return { success: true }
  } catch (err) {
    console.error('Nodemailer client confirmation error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Unified notification dispatcher called by contact handlers
 */
export async function sendEmailNotification(params) {
  // 1. Send Admin Alert
  const adminResult = await sendAdminNotification(params)

  // 2. Fire and forget client auto-responder (don't fail the submission if confirmation bounces)
  sendClientConfirmation(params).catch(err => {
    console.warn('Non-blocking client auto-responder dispatch failed:', err.message)
  })

  return adminResult
}
