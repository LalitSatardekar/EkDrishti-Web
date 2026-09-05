import dns from 'dns'

// Comprehensive list of disposable and throwaway temporary email providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'sharklasers.com',
  'grr.la',
  'getairmail.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'fakemailgenerator.com',
  'throwawaymail.com',
  'nada.ltd',
  'maildrop.cc',
  'inboxkitten.com',
  'mohmal.com',
  'crazymailing.com',
  'burnermail.io',
  'mytemp.email',
  'tempail.com',
  'generator.email',
  'emailondeck.com',
  'zillamail.com',
  'dropmail.me'
])

// Basic RFC 5322 regex for initial syntax check
const EMAIL_SYNTAX_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

/**
 * Checks whether a domain has active MX (Mail Exchange) or A records.
 * @param {string} domain Domain part of the email (e.g., 'tatamotors.com')
 * @returns {Promise<boolean>}
 */
export async function hasValidMxRecords(domain) {
  // If localhost or test environment, bypass DNS lookup
  if (!domain || domain === 'localhost' || domain.endsWith('.local') || domain.endsWith('.test')) {
    return true
  }

  return new Promise((resolve) => {
    // 3.5s timeout so user form submission is never hung by slow DNS
    const timer = setTimeout(() => {
      // In case of slow DNS or timeout, fail open so legitimate users aren't blocked by DNS network lags
      resolve(true)
    }, 3500)

    dns.promises.resolveMx(domain)
      .then((records) => {
        clearTimeout(timer)
        if (Array.isArray(records) && records.length > 0) {
          resolve(true)
        } else {
          // If no MX records, check if the domain at least has an A record (RFC 5321 fallback)
          return dns.promises.resolve4(domain)
            .then((addresses) => resolve(Array.isArray(addresses) && addresses.length > 0))
            .catch(() => resolve(false))
        }
      })
      .catch((err) => {
        clearTimeout(timer)
        // ENOTFOUND or ENODATA indicates the domain doesn't exist or has no mail configuration
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          resolve(false)
        } else {
          // Temporary network error or server timeout — fail open to avoid false rejection
          resolve(true)
        }
      })
  })
}

/**
 * Validates an email address against syntax, disposable lists, and DNS MX records.
 * @param {string} email
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
export async function verifyEmailAddress(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' }
  }

  const trimmed = email.trim().toLowerCase()

  // 1. Basic length check
  if (trimmed.length > 254 || trimmed.length < 5) {
    return { valid: false, reason: 'Email address length is invalid.' }
  }

  // 2. Syntax check
  if (!EMAIL_SYNTAX_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Please enter a valid email format (e.g. name@company.com).' }
  }

  // Split into user and domain
  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address structure.' }
  }

  const [, domain] = parts

  // 3. TLD validation (must have at least 2 chars after last dot, e.g. .com, .in, .agency)
  const lastDotIndex = domain.lastIndexOf('.')
  if (lastDotIndex === -1 || domain.length - lastDotIndex <= 2) {
    return { valid: false, reason: 'Please enter an email with a valid domain extension (e.g. .com, .in).' }
  }

  // 4. Check against disposable / burner email blocklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Temporary or disposable email addresses are not accepted. Please use a work or personal email.' }
  }

  // 5. DNS MX Record lookup
  const hasMx = await hasValidMxRecords(domain)
  if (!hasMx) {
    return { 
      valid: false, 
      reason: `The domain "${domain}" does not appear to accept emails. Please check for typos or use an active email address.` 
    }
  }

  return { valid: true }
}
