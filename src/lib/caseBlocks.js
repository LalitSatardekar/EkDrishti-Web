import { DEFAULT_CAROUSEL, DEFAULT_IMAGE_LAYOUT } from './media.js'
import { DEFAULT_DESIGN_EMBED } from './designEmbed.js'

export const DEFAULT_BLOCK_SETTINGS = Object.freeze({
  Gallery: Object.freeze({ layout: Object.freeze({ mode: 'masonry', columns: 3, gap: 16 }) }),
  'Image Section': Object.freeze({ imageLayout: DEFAULT_IMAGE_LAYOUT, carousel: Object.freeze({ ...DEFAULT_CAROUSEL, slidesPerViewDesktop: 3, slidesPerViewTablet: 2, slidesPerViewMobile: 1 }) }),
  'Album Gallery': Object.freeze({ imageLayout: Object.freeze({ ...DEFAULT_IMAGE_LAYOUT, mode: 'masonry', columnsDesktop: 4, gapX: 12, gapY: 12 }) }),
  Hero: Object.freeze({ imageLayout: Object.freeze({ ...DEFAULT_IMAGE_LAYOUT, mode: 'masonry', sidePadding: 0 }), heroMedia: Object.freeze({ mode: 'static', objectFit: 'cover', objectPosition: 'center', carousel: DEFAULT_CAROUSEL }) }),
  Video: Object.freeze({ autoplay: false, muted: false, loop: false, controls: true }),
  'Design Embed': DEFAULT_DESIGN_EMBED
})

export function deepClone(value) {
  if (value === undefined) return undefined
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

export function createBlockId(type = 'block') {
  const prefix = String(type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'block'
  const uuid = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${uuid}`
}

export function createBlockInstance({ type, order, title, content = {}, settings, metadata = {} }) {
  return {
    id: createBlockId(type),
    type,
    enabled: true,
    order,
    title,
    content: deepClone(content),
    settings: deepClone(settings ?? DEFAULT_BLOCK_SETTINGS[type] ?? {}),
    metadata: deepClone(metadata)
  }
}

export function duplicateBlockInstance(source, order) {
  const clone = deepClone(source)
  delete clone._id
  if (['client access', 'downloads'].includes(String(source.type).toLowerCase()) && Array.isArray(clone.content?.buttons)) {
    const overrides = { ...clone.settings?.textOverrides }
    clone.content.buttons = clone.content.buttons.map(button => {
      const id = createBlockId('access-button')
      for (const suffix of ['', '-secondary']) {
        const oldKey = 'access-' + button.id + suffix, key = 'access-' + id + suffix
        if (overrides[oldKey]) { overrides[key] = deepClone(overrides[oldKey]); delete overrides[oldKey] }
      }
      return { ...button, id }
    })
    clone.settings = { ...clone.settings, textOverrides: overrides }
  }
  return { ...clone, id: createBlockId(source.type), order, title: `${source.title} (Copy)` }
}

export function blockId(block) {
  return String(block?.id || block?._id || '')
}

export function updateBlockById(blocks, id, updater) {
  const target = String(id)
  if (!target) return blocks || []
  return (blocks || []).map(block => blockId(block) === target ? updater(deepClone(block)) : block)
}

export function reorderBlockInstances(blocks, id, insertionIndex) {
  const list = [...(blocks || [])]
  const sourceIndex = list.findIndex(block => blockId(block) === String(id))
  if (sourceIndex < 0) return list
  const [moved] = list.splice(sourceIndex, 1)
  const targetIndex = Math.max(0, Math.min(list.length, insertionIndex - (sourceIndex < insertionIndex ? 1 : 0)))
  list.splice(targetIndex, 0, moved)
  return list.map((block, index) => ({ ...block, order: index + 1 }))
}

export function ensureBlockIds(blocks, caseId = 'case') {
  const seen = new Set()
  return (blocks || []).filter(Boolean).map((block, index) => {
    let id = blockId(block) || `block-${caseId}-${index + 1}`
    // Old records can contain repeated IDs. Repair locally without changing valid IDs.
    if (seen.has(id)) id = `${id}-${index + 1}`
    while (seen.has(id)) id += '-copy'
    seen.add(id)
    return { ...deepClone(block), id, content: deepClone(block.content || {}), settings: deepClone(block.settings || {}), metadata: deepClone(block.metadata || {}) }
  })
}

export function patchBlockMedia(blocks, id, change) {
  return updateBlockById(blocks, id, block => ({ ...block, content: { ...block.content, images: deepClone(change(block.content?.images || [])) } }))
}

export function galleryLayout(block) {
  return { ...DEFAULT_BLOCK_SETTINGS.Gallery.layout, ...(block?.settings?.layout || {}) }
}
