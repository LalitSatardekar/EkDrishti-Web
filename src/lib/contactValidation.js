export const NAME_PATTERN = "^[A-Za-z][A-Za-z\\s'.-]{1,99}$"
export const EMAIL_PATTERN = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
export const PHONE_PATTERN = "^[+]?[0-9\\s-]{10,20}$"

export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  'getairmail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'fakemailgenerator.com',
  'throwawaymail.com',
  'inboxkitten.com',
  'burnermail.io'
]

const NAME_REGEX = new RegExp(NAME_PATTERN)
const EMAIL_REGEX = new RegExp(EMAIL_PATTERN)
const PHONE_REGEX = new RegExp(PHONE_PATTERN)

const getEmailDomain = (value) => {
  const parts = String(value || '').trim().toLowerCase().split('@')
  return parts.length === 2 ? parts[1] : ''
}

const isDisposableEmailDomain = (value) => {
  const domain = getEmailDomain(value)
  return !!domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)
}

export const getContactValidationMessage = (fieldName, value) => {
  const trimmed = String(value || '').trim()

  if (fieldName === 'name') {
    if (!trimmed) return 'Please enter your name.'
    if (trimmed.length < 2) return 'Name must be at least 2 characters.'
    if (!NAME_REGEX.test(trimmed)) {
      return 'Name should use only letters, spaces, dots, apostrophes, or hyphens.'
    }
  }

  if (fieldName === 'email') {
    if (!trimmed) return 'Please enter your email address.'
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'Enter a valid email address (e.g. name@company.com).'
    }
    const domain = getEmailDomain(trimmed)
    if (!domain || !domain.includes('.') || domain.endsWith('.')) {
      return 'Please enter a complete email domain (e.g. .com, .in).'
    }
    if (isDisposableEmailDomain(trimmed)) {
      return 'Temporary/burner emails are not accepted. Please use a work or personal email.'
    }
  }

  if (fieldName === 'phone') {
    if (!trimmed) return 'Please enter your phone number.'
    const digitsOnly = trimmed.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return 'Please enter a valid phone number with at least 10 digits (e.g. +91 98765 43210).'
    }
    if (!PHONE_REGEX.test(trimmed)) {
      return 'Phone number format is invalid.'
    }
  }

  return ''
}

export const applyContactValidationMessage = (target) => {
  if (!target) return ''
  const message = getContactValidationMessage(target.name, target.value)
  if (typeof target.setCustomValidity === 'function') {
    target.setCustomValidity(message)
  }
  return message
}

export const validateContactForm = (form) => {
  if (!form) return true

  const fields = ['name', 'email', 'phone']
  fields.forEach((name) => {
    const element = form.elements?.namedItem?.(name)
    if (element) applyContactValidationMessage(element)
  })

  if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
    if (typeof form.reportValidity === 'function') {
      form.reportValidity()
    }
    return false
  }

  return true
}
