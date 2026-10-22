import { quickAnalyzeFromFilename } from './imageAnalyzer.js'
import { justifiedRows } from './media.js'
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
    if (typeof img === 'object') return img.src || img.url || JSON.stringify(img)
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
  if (shuffled.every((item, index) => item === images[index])) shuffled.push(shuffled.shift())
  return shuffled
}

// Ordering utilities retain whole asset references, including unknown metadata.
export const arrangementKey = (item, index) => typeof item === 'string' ? item : item.id || item.src || item.url || String(index)
export const arrangementOrder = images => images.map(arrangementKey)
export const restoreArrangement = (images, order) => {
  const remaining = [...images], result = []
  for (const key of order) {
    const index = remaining.findIndex((item, i) => arrangementKey(item, i) === key)
    if (index >= 0) result.push(...remaining.splice(index, 1))
  }
  return [...result, ...remaining]
}
export const balanceGridImages = (images = [], orientationMap = {}, options = {}) => {
  const ratio = item => {
    const src = typeof item === 'string' ? item : item.src || item.url || ''
    const known = orientationMap[src]
    const configured = item?.placement?.aspectRatio?.split(/[/:]/).map(Number)
    const value = configured?.length === 2 ? configured[0] / configured[1] : Number(item?.width) / Number(item?.height) || Number(known?.ratio) || quickAnalyzeFromFilename(src).ratio || (/portrait/i.test(String(known)) ? .66 : /landscape/i.test(String(known)) ? 1.5 : 1)
    return Math.min(20, Math.max(.05, value || 1))
  }
  const columns = Math.max(1, Math.min(12, Math.floor(Number(options.columnsDesktop) || 3)))
  const width = Math.max(100, Number(options.width) || 1200)
  const score = list => {
    const values = list.map(ratio)
    if (['horizontalMasonry', 'justified'].includes(options.mode)) {
      const rows = justifiedRows(values.map(value => ({ ratio: value })), width, options)
      const target = Number(options.targetRowHeight) || 240
      return rows.reduce((sum, row) => sum + (row.height-target)**2 + (row.final ? (width-row.widths.reduce((a,b)=>a+b,0)-(row.items.length-1)*(Number(options.gapX)||0))**2/10 : 0), 0)
    }
    if (['masonry', 'verticalMasonry'].includes(options.mode)) {
      // CSS columns consume contiguous items; estimate balanced column boundaries.
      const unit = Math.max(1, (width-(columns-1)*(Number(options.gapX)||0))/columns)
      const heights = list.map((item,i) => Number(item?.placement?.height) || unit/values[i])
      const total = heights.reduce((a,b)=>a+b+(Number(options.gapY)||0),0)
      let used=0, column=0; const totals=Array(columns).fill(0)
      heights.forEach(height => { const h=height+(Number(options.gapY)||0); if(column<columns-1 && totals[column] && Math.abs(used-total*(column+1)/columns)<Math.abs(used+h-total*(column+1)/columns)) column++; totals[column]+=h; used+=h })
      return totals.reduce((sum,h)=>sum+(h-total/columns)**2,0)
    }
    return values.reduce((sum,value,i)=>sum+(i && (value<.8)===(values[i-1]<.8) ? 1:0)+(i>=columns && (value>1.2)===(values[i-columns]>1.2) ? .5:0),0)
  }
  let best=[...images], bestScore=score(best)
  for(let pass=0;pass<3;pass++) {
    let improved=false, attempts=0
    for(let i=0;i<best.length;i++) for(let j=i+1;j<best.length && attempts++<600;j++) {
      const candidate=[...best]; [candidate[i],candidate[j]]=[candidate[j],candidate[i]]
      const next=score(candidate)
      if(next<bestScore-.0001) { best=candidate; bestScore=next; improved=true }
    }
    if(!improved) break
  }
  return best
}
