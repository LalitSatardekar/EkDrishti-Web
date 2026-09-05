# Ekdrishti Contact System — Production Configuration Guide

> This document details the contact form pipeline, email delivery (Nodemailer), anti-spam defenses, and environment configurations.

---

## 1. Email Service Architecture (Nodemailer)

The contact pipeline uses **Nodemailer exclusively** (`api/lib/email.js`) to dispatch:
1. **Admin Lead Alert**: Sent to the studio team with lead name, email, phone, company, service, full message, and marketing attribution (UTMs).
2. **Client Auto-Responder**: Sent to the user confirming their message was received and that the team will reply within 24 hours.

### Environment Variables (`.env.local` / Vercel Environment Variables)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SMTP_HOST` | Outgoing SMTP server | `smtp.gmail.com` or `smtp.hostinger.com` |
| `SMTP_PORT` | Port (465 for SSL, 587 for TLS) | `465` or `587` |
| `SMTP_USERNAME` | SMTP account login / email | `notifications@ekdrishti.com` |
| `SMTP_PASSWORD` | SMTP password / App password | `your-app-password` |
| `SENDER_ADDRESS` | From header email | `edadmin@ekdrishti.com` |
| `SENDER_NAME` | Sender display name | `Ekdrishti Studios` |
| `RECIPIENT_EMAIL` | Admin email receiving lead notifications | `tanmayjare29@gmail.com` |

> [!NOTE]
> **Development Safe Fallback**:
> If `SMTP_HOST` or `SMTP_PASSWORD` are not defined in development, the system logs the full email payload cleanly to the server console and safely persists the lead in MongoDB without failing the form submission.

---

## 2. Fake Email & Anti-Spam Defenses

To allow high-value corporate & business emails (e.g. `@tatamotors.com`, `@startup.io`) while blocking fake emails and spam bots, the system employs multi-layered verification:

1. **DNS MX Record Verification (`api/lib/emailVerifier.js`)**:
   - The backend performs a non-blocking DNS MX lookup via Node's native `dns.promises.resolveMx(domain)`.
   - Domains without valid mail exchanger servers (e.g. `@fake123abc.xyz`) are rejected before email dispatch.
2. **Disposable & Temporary Email Filter**:
   - Rejects throwaway burner email providers (e.g. Mailinator, TempMail, GuerrillaMail, 10MinuteMail, Yopmail).
3. **Hidden Honeypot Traps**:
   - Both `ContactModal.jsx` and `Contact.jsx` include hidden honeypot fields (`_website`) positioned off-screen.
   - Automated spam bots filling in this field are silently dropped with a 200 OK without writing to the database or triggering email dispatch.
4. **IP Rate Limiting & Duplicate Debounce**:
   - Limits submissions from the same IP to 1 inquiry every 60 seconds.
   - Prevents duplicate identical message submissions within 5 minutes.

---

## 3. Form Locations & Features

1. **Global Contact Modal (`src/components/ui/ContactModal.jsx`)**:
   - Triggered from Navbar "Let's Talk" button, CTA bands, service pages, and packages.
   - Fields: Name, Email, Phone, Company/Brand (optional), Service, Message.
2. **Dedicated Contact Page (`src/pages/Contact.jsx`)**:
   - Accessible at `/contact`.
   - Includes full company & phone details, address, and interactive map.
3. **Admin CRM Dashboard (`src/pages/admin/AdminContacts.jsx`)**:
   - Accessible at `/admin/contacts`.
   - Filter leads by status (`unread`, `read`, `archived`).
   - Displays company, client IP/device, and marketing UTM attribution.
   - Multi-channel communication actions:
     - ✉️ **Reply via Email** (`mailto:...`)
     - 📞 **Call Phone** (`tel:...`)
     - 💬 **WhatsApp Chat** (`https://wa.me/...`)
   - **Export to CSV** for CRM importing.

---

## 4. API Endpoints

- `POST /api/v1/contact`: Main submission handler.
- `POST /api/contact`: Alias forwarder.
- `GET /api/v1/contact`: Authenticated admin listing with search, filters, and pagination.
- `PUT /api/v1/contact?id=...`: Update lead status (`read`, `replied`, `archived`).
- `DELETE /api/v1/contact?id=...`: Soft/hard delete lead.
