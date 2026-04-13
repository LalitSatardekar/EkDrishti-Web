# Contact System — Configuration Guide

> This file documents every address, label, and setting you might want to tweak
> in the contact form pop-up and email backend. Each section tells you exactly
> which file to open and what to change.

---

## 1. Email Destination (who gets the notification)

**File:** `api/contact.js`
**Variable:** `RECIPIENT_EMAIL`

```js
const RECIPIENT_EMAIL = 'tanmayjare29@gmail.com'  // ← change this
```

Change this to any email address where you want form submissions delivered.

---

## 2. Sender Address ("From" field in the email)

**File:** `api/contact.js`
**Variable:** `SENDER_ADDRESS` and `SENDER_NAME`

```js
const SENDER_ADDRESS = 'onboarding@resend.dev'  // ← testing default
const SENDER_NAME    = 'Ekdrishti Website'
```

- **For production:** replace `onboarding@resend.dev` with a verified domain
  address like `noreply@ekdrishti.com`.
  You must verify the domain first at https://resend.com/domains.
- Keep `onboarding@resend.dev` while testing — it works without domain setup.

---

## 3. Email Subject Line

**File:** `api/contact.js`
**Variable:** `EMAIL_SUBJECT`

```js
const EMAIL_SUBJECT = '📩 New Contact Form Submission — Ekdrishti'  // ← change this
```

---

## 4. Email HTML Template (body layout)

**File:** `api/contact.js`
**Function:** `buildEmailHtml(data)`

Edit the HTML string inside this function to change how the email looks.
Each field is rendered by the `row(label, value)` helper — add/remove rows to
match any new form fields you add.

---

## 5. Required Form Fields (server-side validation)

**File:** `api/contact.js`
**Variable:** `REQUIRED_FIELDS`

```js
const REQUIRED_FIELDS = ['name', 'email', 'message']  // ← add/remove fields
```

If you add or remove a required field here, update the matching field in the
modal form (Step 7 below) so the UX stays consistent.

---

## 6. Resend API Key

**Local dev:**
Create a `.env.local` file at the project root (never commit this file):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Production (Vercel):**
Go to Vercel Dashboard → your project → Settings → Environment Variables →
add `RESEND_API_KEY` with the value from https://resend.com/api-keys.

---

## 7. Modal Form Fields

**File:** `src/components/ui/ContactModal.jsx`

### Service dropdown options
```js
const SERVICE_OPTIONS = [
  { value: 'family-events',      label: 'Family Events' },
  { value: 'digital-marketing',  label: 'Digital Marketing' },
  // add more here...
]
```

### Add a new field
1. Add the field name to `INITIAL_FORM` at the top of the file.
2. Add a matching `<input>` or `<textarea>` in the `<form>` section.
3. If it's required, add its name to `REQUIRED_FIELDS` in `api/contact.js`.
4. Add a `row('Label', fieldName)` line in `buildEmailHtml()` in `api/contact.js`.

---

## 8. Modal Heading / Subheading

**File:** `src/components/ui/ContactModal.jsx`
**Section:** `{/* HEADER */}` block

```jsx
<h2 ...>Let's Work Together</h2>
<p ...>Fill out the form and we'll get back to you within 24 hours.</p>
```

---

## 9. Modal Width

**File:** `src/components/ui/ContactModal.jsx`

Find `max-w-lg` on the dialog wrapper div and change it:

| Class       | Width  |
|-------------|--------|
| `max-w-md`  | 448px  |
| `max-w-lg`  | 512px  ← current |
| `max-w-xl`  | 576px  |
| `max-w-2xl` | 672px  |

---

## 10. Navbar Button Label & Style

**File:** `src/components/layout/Navbar.jsx`

### Desktop button
Search for `Let&rsquo;s Talk` (in the desktop right nav section).
Change the text and/or `className` to adjust label, color, shape.

### Mobile button
Search for the second `Let&rsquo;s Talk` (in the mobile menu section).
Same — change text and/or `className`.

---

## 11. Success / Error Messages

| Where                  | File                              | What to change                    |
|------------------------|-----------------------------------|-----------------------------------|
| Server success reply   | `api/contact.js`                  | String in `res.status(200).json`  |
| Modal fallback text    | `src/components/ui/ContactModal.jsx` | `response.message \|\| '...'` fallback |

---

## 12. Files Changed by This Feature

| File | What changed |
|------|--------------|
| `src/components/ui/ContactModal.jsx` | **NEW** — modal form component |
| `api/contact.js` | **NEW** — Vercel serverless function (Resend) |
| `src/components/layout/Navbar.jsx` | Removed Contact nav-link; added button + modal |
| `src/api/contactApi.js` | Replaced mock with real `axios.post('/api/contact')` |
| `vercel.json` | Rewrite regex updated so `/api/*` routes work |
| `package.json` | Added `resend` dependency |
| `/contact` route | **Unchanged** — page still accessible at `/contact` |
