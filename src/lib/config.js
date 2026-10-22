import { accessButtons } from './clientAccess.js'
import { deepClone, ensureBlockIds } from './caseBlocks.js'
import { selectDynamicHeroImages } from './heroSelector.js'
import { mediaAsset } from './media.js'

const env = typeof import.meta.env !== 'undefined' ? import.meta.env : {}

export const API_BASE_URL = env.VITE_API_URL || 'http://localhost:5000/api'

export const IS_PRODUCTION = env.PROD
export const IS_DEVELOPMENT = env.DEV

const trimTrailingSlash = (value = '') => value.replace(/\/$/, '')

// Try to infer original-base from the provided WebP base when not set explicitly
const resolveOriginalBase = () => {
	if (env.VITE_ASSET_ORIGINAL_BASE_URL) return env.VITE_ASSET_ORIGINAL_BASE_URL
	const webpBase = env.VITE_ASSET_WEBP_BASE_URL
	if (webpBase && /\/webp\/?$/i.test(webpBase)) return webpBase.replace(/\/webp\/?$/i, '/original')
	return '/assets/original'
}

export const ASSET_ORIGINAL_BASE_URL = trimTrailingSlash(resolveOriginalBase())
export const ASSET_WEBP_BASE_URL = trimTrailingSlash(env.VITE_ASSET_WEBP_BASE_URL || '/assets/webp')
export const ASSET_DEFAULT_VARIANT = env.VITE_ASSET_DEFAULT_VARIANT || 'webp'

const S3_WEBP_FALLBACK = 'https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/webp'
const S3_ORIGINAL_FALLBACK = 'https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/original'

export const encodeAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return url

  let full = url.trim()
  if (!full) return full

  // Handle local public paths
  if (full.startsWith('/uploads/') || full.startsWith('/logo') || full.startsWith('/vite.svg')) {
    return full
  }

  // Resolve relative /assets/webp or /assets/original paths to S3 CDN
  if (full.startsWith('/assets/webp')) {
    const s3Base = trimTrailingSlash(env.VITE_ASSET_WEBP_BASE_URL || S3_WEBP_FALLBACK)
    full = full.replace('/assets/webp', s3Base.startsWith('http') ? s3Base : S3_WEBP_FALLBACK)
  } else if (full.startsWith('/assets/original')) {
    const s3Base = trimTrailingSlash(env.VITE_ASSET_ORIGINAL_BASE_URL || S3_ORIGINAL_FALLBACK)
    full = full.replace('/assets/original', s3Base.startsWith('http') ? s3Base : S3_ORIGINAL_FALLBACK)
  }

  // Clean and encode URL: decode any multi-encoded entities first, then apply encodeURI
  try {
    let clean = full
    while (clean.includes('%20') || clean.includes('%26') || clean.includes('%25')) {
      const prev = clean
      clean = decodeURIComponent(clean)
      if (clean === prev) break
    }
    return encodeURI(clean)
  } catch (_) {
    return encodeURI(full)
  }
}

export const normalizeCase = (item) => {
  if (!item) return item
  const id = item.id || item._id
  const _id = item._id || String(item.id)
  const image = encodeAssetUrl(item.image)
  const thumbnail = encodeAssetUrl(item.thumbnail || item.image)
  const thumbnail169 = encodeAssetUrl(item.thumbnail169 || thumbnail)
  const thumbnail32 = encodeAssetUrl(item.thumbnail32 || thumbnail)
  const video = encodeAssetUrl(item.video)
  const hero = Array.isArray(item.hero)
    ? item.hero.map((h) => {
        if (!h) return h
        if (typeof h === 'string') return encodeAssetUrl(h)
        if (typeof h === 'object') {
          return {
            ...h,
            url: encodeAssetUrl(h.src || h.url || ''),
            src: encodeAssetUrl(h.src || h.url || ''),
          }
        }
        return h
      })
    : []
  const heroSettings = deepClone(item.heroSettings || {})
  const encodeMedia = value => typeof value === 'string' ? encodeAssetUrl(value) : { ...deepClone(value), src: encodeAssetUrl(value?.src || value?.url || ''), ...(value?.url ? { url: encodeAssetUrl(value.url) } : {}) }
  const album = Array.isArray(item.album) ? item.album.map(encodeMedia) : []
  const selectedHero = selectDynamicHeroImages({ ...item, hero, album, image }).images

  const sections = Array.isArray(item.sections)
    ? ensureBlockIds(item.sections, id).map((sec) => {
        if (!sec) return sec
        const typeLower = (sec.type || '').toLowerCase()
        const content = sec.content ? { ...sec.content } : {}

        if (Array.isArray(content.images)) content.images = content.images.map(encodeMedia)
        // Materialize legacy shared sources in local state, never migrate remote records.
        if (typeLower === 'hero' && !Array.isArray(content.images)) {
          content.images = deepClone(selectedHero)
          sec.settings = { ...sec.settings, legacyHeroSettings: deepClone(heroSettings) }
        }
        if (['album', 'album gallery'].includes(typeLower) && !Array.isArray(content.images)) {
          const used = new Set(selectedHero.map(value => mediaAsset(value).src))
          const remaining = album.filter(value => !used.has(mediaAsset(value).src))
          content.images = deepClone(remaining.length ? remaining : album)
        }
        if (['client access', 'downloads'].includes(typeLower)) content.buttons = accessButtons({ ...sec, content }, item)
        if (typeLower === 'video' && content.url) {
          content.url = encodeAssetUrl(content.url)
        }
        if (content.image) {
          content.image = encodeAssetUrl(content.image)
        }

        return {
          ...sec,
          content,
        }
      })
    : item.sections

  return {
    ...item,
    id,
    _id,
    image,
    hero,
    heroSettings,
    thumbnail,
    thumbnail169,
    thumbnail32,
    video,
    album,
    sections,
    typography: deepClone(item.typography || {}),
  }
}
