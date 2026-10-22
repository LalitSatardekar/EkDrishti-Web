export const DEFAULT_CAROUSEL = Object.freeze({ autoplay: false, interval: 5000, transition: 'slide', speed: 500, easing: 'ease', loop: true, pauseOnHover: false, pauseOnInteraction: false, resumeAfter: 3000, swipe: true, keyboard: true, arrows: true, dots: true, progress: false, slidesPerViewDesktop: 1, slidesPerViewTablet: 1, slidesPerViewMobile: 1, gap: 0, heightMode: 'fixed' })

export const DEFAULT_IMAGE_LAYOUT = Object.freeze({
  mode: 'grid', columnsDesktop: 3, columnsTablet: 2, columnsMobile: 1,
  gapX: 20, gapY: 20, aspectRatio: 'original', objectFit: 'cover', objectPosition: 'center',
  radius: 0, containerWidth: 'wide', maxWidth: 1400, sidePadding: 20, paddingTop: 0, paddingBottom: 0,
  align: 'center', uniformRatio: true, targetRowHeight: 240, minRowHeight: 100, maxRowHeight: 400, lastRow: 'left'
})

export function mediaAsset(asset, index = 0) {
  const value = typeof asset === 'string' ? { src: asset } : (asset || {})
  return { ...value, id: value.id || `media-${index}-${value.src || value.url || ''}`, src: value.src || value.url || '', alt: value.alt || '', caption: value.caption || '', link: value.link || '', focalX: value.focalX !== undefined && Number.isFinite(Number(value.focalX)) ? Math.min(100, Math.max(0, Number(value.focalX))) : 50, focalY: value.focalY !== undefined && Number.isFinite(Number(value.focalY)) ? Math.min(100, Math.max(0, Number(value.focalY))) : 50, objectPosition: value.objectPosition || '' }
}

export function mediaAssets(items = []) {
  const seen = new Set()
  return (Array.isArray(items) ? items : []).map(mediaAsset).filter(item => item.src).map((item, index) => {
    let id = String(item.id)
    if (seen.has(id)) id = `${id}-${index + 1}`
    while (seen.has(id)) id += '-copy'
    seen.add(id)
    return { ...item, id }
  })
}

export function parseVideoSource(input) {
  const source = String(input || '').trim()
  if (!source) return { provider: 'unknown', source: '', error: '' }
  let url
  try { url = new URL(source) } catch { return { provider: 'unknown', source, error: 'Enter a complete YouTube, Google Drive, or direct video URL.' } }
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const id = host === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : (url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1])
    if (!id || !/^[\w-]{6,20}$/.test(id)) return { provider: 'youtube', source, error: 'This YouTube link does not contain a valid video ID.' }
    return { provider: 'youtube', id, source, embedUrl: `https://www.youtube.com/embed/${id}` }
  }
  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const id = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id') || url.pathname.match(/\/d\/([^/]+)/)?.[1]
    if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) return { provider: 'google-drive', source, error: 'This Google Drive link does not contain a valid shared file ID.' }
    return { provider: 'google-drive', id, source, embedUrl: `https://drive.google.com/file/d/${id}/preview` }
  }
  if (['http:', 'https:'].includes(url.protocol) && /\.(mp4|webm|ogg|mov)(?:$|\?)/i.test(url.pathname + url.search)) return { provider: 'direct', source, embedUrl: source }
  return { provider: 'unknown', source, error: 'This video provider is not supported. Use YouTube, Google Drive, MP4, WebM, OGG, or MOV.' }
}

export function imageLayout(section) {
  const legacy = section?.settings?.layout || {}
  const current = section?.settings?.imageLayout || {}
  const album = ['album', 'album gallery'].includes(String(section?.type).toLowerCase())
  const gallery = ['gallery'].includes(String(section?.type).toLowerCase())
  const legacyHero = String(section?.type).toLowerCase() === 'hero' ? section?.settings?.heroMedia || {} : null
  return {
    ...DEFAULT_IMAGE_LAYOUT,
    ...((album || gallery) ? { mode: 'masonry', columnsDesktop: 3, gapX: 16, gapY: 16, aspectRatio: gallery ? '4:3' : 'original' } : {}),
    ...(legacyHero ? { mode: legacyHero.mode === 'single' ? 'fullWidth' : 'masonry', sidePadding: 0, objectFit: legacyHero.objectFit || 'cover', objectPosition: legacyHero.objectPosition || 'center', objectFitTablet: legacyHero.objectFitTablet, objectFitMobile: legacyHero.objectFitMobile, objectPositionTablet: legacyHero.objectPositionTablet, objectPositionMobile: legacyHero.objectPositionMobile } : {}),
    ...legacy,
    ...current,
    columnsDesktop: Number(current.columnsDesktop ?? legacy.columnsDesktop ?? legacy.columns ?? 3),
    gapX: Number(current.gapX ?? legacy.gapX ?? legacy.gap ?? (album || gallery ? 16 : 20)),
    gapY: Number(current.gapY ?? legacy.gapY ?? legacy.gap ?? (album || gallery ? 16 : 20))
  }
}

export const responsiveValue = (value, width = 1280) => value && typeof value === 'object' ? (width < 768 ? value.mobile : width < 1024 ? value.tablet : value.desktop) : value
export const mediaPosition = (item, fallback = 'center') => item.objectPosition || (item.focalX !== 50 || item.focalY !== 50 ? `${item.focalX}% ${item.focalY}%` : fallback)
export function carouselPage(index, length, count, loop) {
  const last = Math.max(0, length - count)
  if (!last) return 0
  return loop ? ((index % (last + 1)) + last + 1) % (last + 1) : Math.min(last, Math.max(0, index))
}

export function carouselGap(requested, width, count) {
  // Keep every requested visible slide inside a narrow container, even with large gaps.
  return Math.min(Math.max(0, Number(requested) || 0), Math.max(0, ((Number(width) || 0) - count) / Math.max(1, count - 1)))
}

export function heroMode(section) {
  const mode = section?.settings?.heroMedia?.mode
  return mode === 'video' ? 'video' : ['slideshow', 'carousel'].includes(mode) ? 'carousel' : 'static'
}

export function sectionImages(section, fallback = []) {
  // An explicitly empty list is intentional; do not resurrect removed images.
  return Array.isArray(section?.content?.images) ? section.content.images : fallback
}

export function justifiedRows(items, containerWidth, options = {}) {
  const width = Math.max(1, Number(containerWidth) || 1)
  const gap = Math.max(0, Number(options.gapX) || 0)
  const min = Math.max(20, Number(options.minRowHeight) || 100)
  const max = Math.max(min, Number(options.maxRowHeight) || 400)
  const target = Math.min(max, Math.max(min, Number(options.targetRowHeight) || 240))
  const rows = []
  let row = [], sum = 0
  const flush = final => {
    if (!row.length) return
    const fitted = Math.max(1, (width - gap * (row.length - 1)) / sum)
    const fill = !final || options.lastRow === 'justify'
    // Width always wins over minimum height to prevent overflow on narrow devices.
    const height = Math.min(fitted, max, fill ? Infinity : target)
    rows.push({ items: row, height, widths: row.map(item => item.ratio * height), final })
    row = []; sum = 0
  }
  items.forEach((item, index) => {
    const ratio = Math.max(0.05, Number(item.ratio) || Number(item.width) / Number(item.height) || 1)
    if (row.length && (sum + ratio) * target + row.length * gap > width && Math.abs((width - gap * (row.length - 1)) / sum - target) < Math.abs((width - gap * row.length) / (sum + ratio) - target)) flush(false)
    row.push({ ...item, index: item.index ?? index, ratio }); sum += ratio
    if (sum * target + gap * (row.length - 1) >= width) flush(index === items.length - 1)
  })
  flush(true)
  return rows
}
