/**
 * Hero Selector Utility
 * Dynamic image selection for hero grid supporting 1 to 20 images of any orientation.
 */

/**
 * Select dynamic hero images (between min and max images)
 * 
 * @param {Object} project - Case study project data
 * @param {Object} options - { min: 1, max: 20 }
 * @returns {Object} Selected images array and deduplication info
 */
export const selectDynamicHeroImages = (project, options = {}) => {
  const min = options.min ?? 1
  const max = options.max ?? 20

  if (!project) {
    return {
      images: [],
      allSelected: [],
      totalAvailable: 0
    }
  }

  // 1. Check explicit hero images
  let explicitHero = []
  if (Array.isArray(project.hero) && project.hero.length > 0) {
    explicitHero = project.hero.filter(Boolean)
  }

  // 2. Check album images
  let albumImages = []
  if (Array.isArray(project.album) && project.album.length > 0) {
    albumImages = project.album.filter(Boolean)
  }

  // 3. Fallback image
  const coverImage = project.image ? [project.image] : []

  // Combine while preserving order and uniqueness
  let selected = []
  const seen = new Set()

  const getImgKey = (img) => {
    if (!img) return ''
    if (typeof img === 'string') return img
    if (typeof img === 'object') return img.url || img.src || JSON.stringify(img)
    return String(img)
  }

  const addUnique = (list) => {
    for (const img of list) {
      const key = getImgKey(img)
      if (!key || seen.has(key)) continue
      seen.add(key)
      selected.push(img)
      if (selected.length >= max) break
    }
  }

  // First add all explicit hero images (up to max)
  addUnique(explicitHero)

  // If fewer than min images (or if explicit hero was empty), fill from album and cover
  if (selected.length < min) {
    addUnique(albumImages)
    if (selected.length < min) {
      addUnique(coverImage)
    }
  }

  // Cap at max (20)
  const finalImages = selected.slice(0, max)

  return {
    images: finalImages,
    allSelected: finalImages,
    totalAvailable: seen.size
  }
}

/**
 * Async selector for hero images (backwards-compatible with WorkDetail)
 */
export const selectHeroImages = async (project, options = {}) => {
  const result = selectDynamicHeroImages(project, options)
  return {
    landscape: result.images.filter((_, idx) => idx % 2 === 0),
    portrait: result.images.filter((_, idx) => idx % 2 !== 0),
    images: result.images,
    allSelected: result.images,
    fallbackUsed: false,
    metadata: {
      totalSelected: result.images.length
    }
  }
}

/**
 * Synchronous selector
 */
export const selectHeroImagesSync = (project, options = {}) => {
  return selectDynamicHeroImages(project, options)
}

/**
 * Validate if project has sufficient images for hero grid (min 1, max 20)
 */
export const validateHeroRequirements = (project, { min = 1, max = 20 } = {}) => {
  const heroCount = Array.isArray(project?.hero) ? project.hero.length : 0
  const albumCount = Array.isArray(project?.album) ? project.album.length : 0
  const totalAvailable = Math.max(heroCount, albumCount + (project?.image ? 1 : 0))

  return {
    isValid: totalAvailable >= min,
    available: totalAvailable,
    needed: min,
    deficit: Math.max(0, min - totalAvailable)
  }
}

/**
 * Shuffle images randomly using Fisher-Yates algorithm
 */
export const shuffleGridImages = (images = []) => {
  if (!images || images.length <= 1) return [...images]
  const shuffled = [...images]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Smart balance: Shuffles and arranges images into relevant placements
 * by interleaving different orientations and avoiding clumping in masonry columns.
 */
export const balanceGridImages = (images = [], orientationMap = {}) => {
  if (!images || images.length <= 2) return shuffleGridImages(images)

  // 1. Classify images based on known orientation or filename hints
  const portraits = []
  const landscapes = []
  const others = []

  images.forEach((src) => {
    const label = orientationMap[src] || ''
    const lower = (src || '').toLowerCase()
    if (label.includes('Portrait') || lower.includes('short') || lower.includes('portrait')) {
      portraits.push(src)
    } else if (label.includes('Landscape') || lower.includes('long') || lower.includes('wide')) {
      landscapes.push(src)
    } else {
      others.push(src)
    }
  })

  // If we have distinct portraits and landscapes, interleave them evenly
  if (portraits.length > 0 && landscapes.length > 0) {
    const pShuffled = shuffleGridImages(portraits)
    const lShuffled = shuffleGridImages(landscapes)
    const oShuffled = shuffleGridImages(others)

    const result = []
    let pIdx = 0, lIdx = 0, oIdx = 0
    let pickPortrait = pShuffled.length >= lShuffled.length

    while (pIdx < pShuffled.length || lIdx < lShuffled.length || oIdx < oShuffled.length) {
      if (pickPortrait && pIdx < pShuffled.length) {
        result.push(pShuffled[pIdx++])
      } else if (!pickPortrait && lIdx < lShuffled.length) {
        result.push(lShuffled[lIdx++])
      } else if (pIdx < pShuffled.length) {
        result.push(pShuffled[pIdx++])
      } else if (lIdx < lShuffled.length) {
        result.push(lShuffled[lIdx++])
      } else if (oIdx < oShuffled.length) {
        result.push(oShuffled[oIdx++])
      }
      pickPortrait = !pickPortrait
    }

    return result
  }

  // Fallback: smart rotation/stride shuffle to guarantee a different relevant placement
  const stride = Math.max(2, Math.floor(images.length / 3))
  const rearranged = []
  const used = new Set()

  for (let s = 0; s < stride; s++) {
    for (let i = s; i < images.length; i += stride) {
      if (!used.has(i)) {
        used.add(i)
        rearranged.push(images[i])
      }
    }
  }

  // If identical, do random shuffle
  if (rearranged.every((img, idx) => img === images[idx])) {
    return shuffleGridImages(images)
  }

  return rearranged
}

