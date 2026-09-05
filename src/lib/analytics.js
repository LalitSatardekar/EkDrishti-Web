const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const IS_PROD = import.meta.env.PROD
const SCRIPT_ID = 'ga-gtag'
const DEBUG_QUERY_VALUES = new Set(['1', 'true', 'yes'])

const canUseDom = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const isDebugMode = () => {
  if (!canUseDom()) return false
  const value = new URLSearchParams(window.location.search).get('ga_debug')
  if (!value) return false
  return DEBUG_QUERY_VALUES.has(String(value).toLowerCase())
}

const shouldTrack = () => !!GA_MEASUREMENT_ID && canUseDom() && (IS_PROD || isDebugMode())

const logDebug = (label, payload) => {
  if (!isDebugMode()) return
  if (typeof window !== 'undefined') {
    if (!window.__gaDebugEvents) window.__gaDebugEvents = []
    window.__gaDebugEvents.push({
      label,
      payload,
      ts: new Date().toISOString(),
    })
  }
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log('[GA]', label, payload)
  }
}

const ensureScript = (id) => {
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.async = true
  script.id = SCRIPT_ID
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
}

const ensureGtag = () => {
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }
}

let isInitialized = false

export const initAnalytics = () => {
  if (!shouldTrack() || isInitialized) return
  ensureScript(GA_MEASUREMENT_ID)
  ensureGtag()
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    debug_mode: isDebugMode() || undefined,
    send_to: GA_MEASUREMENT_ID,
  })
  logDebug('init', { measurement_id: GA_MEASUREMENT_ID, debug: isDebugMode() })
  isInitialized = true
}

export const trackPageView = (path) => {
  if (!shouldTrack()) return
  ensureGtag()
  const params = {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  }
  if (isDebugMode()) params.debug_mode = true
  window.gtag('config', GA_MEASUREMENT_ID, params)
  logDebug('page_view', params)
}

export const trackEvent = (eventName, params = {}) => {
  if (!shouldTrack()) return
  ensureGtag()
  const eventParams = {
    ...params,
    send_to: GA_MEASUREMENT_ID,
    ...(isDebugMode() ? { debug_mode: true } : null),
  }
  window.gtag('event', eventName, eventParams)
  logDebug(eventName, eventParams)
}

const buildCaseParams = (item) => ({
  case_slug: item?.slug,
  case_title: item?.title,
  case_category: item?.category,
  case_service: item?.service,
})

export const trackCaseClick = (item, source) => {
  trackEvent('case_click', {
    ...buildCaseParams(item),
    source,
  })
}

export const trackCaseView = (item, source = 'case_detail') => {
  trackEvent('case_view', {
    ...buildCaseParams(item),
    source,
  })
}

export const trackCaseGalleryOpen = (item, index) => {
  trackEvent('case_gallery_open', {
    ...buildCaseParams(item),
    image_index: typeof index === 'number' ? index + 1 : undefined,
  })
}

export const trackFormSubmit = (formName, params = {}) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...params,
  })
}

export const trackButtonClick = (label, location, params = {}) => {
  trackEvent('button_click', {
    button_label: label,
    button_location: location,
    ...params,
  })
}

export const trackScrollDepth = (percent, pagePath) => {
  trackEvent('scroll_depth', {
    scroll_percent: percent,
    page_path: pagePath,
    page_location: window.location.href,
  })
}
