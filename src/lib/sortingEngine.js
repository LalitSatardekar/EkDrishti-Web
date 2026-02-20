/**
 * sortingEngine.js
 *
 * Centralized filtering + sorting layer for all case/work data.
 *
 * ─── Rules ────────────────────────────────────────────────────────────────────
 * • Works on a COPY of input data — originals are never mutated.
 * • Automatically strips out items with status: "draft".
 * • Apply order: filter → sort → limit.
 * • No component should filter/sort data manually — always route through here.
 * • Future-proof: swap the data argument with an API response array and nothing else changes.
 *
 * ─── Quick reference ──────────────────────────────────────────────────────────
 * import { getSortedCases } from "@/lib/sortingEngine"
 * import { allCases }       from "@/data/cases"
 *
 * // All digital-marketing cases, priority order, top 6
 * const cards = getSortedCases(allCases, {
 *   service: "digital-marketing",
 *   sortBy:  "priority",
 *   limit:   6,
 * })
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSortedCases
 *
 * @param {Object[]} data    - Raw array of case objects (from cases.js or an API).
 * @param {Object}   options - Filter / sort / limit options.
 *
 * @param {string}  [options.service]      - Filter by item.service  (e.g. "digital-marketing")
 * @param {string}  [options.category]     - Filter by item.category (e.g. "DIGITAL MARKETING")
 * @param {string}  [options.subCategory]  - Filter by item.subCategory within a category (e.g. "Corporate")
 * @param {string}  [options.tag]          - Filter by a single tag inside item.tags[]
 * @param {boolean} [options.featured]     - When true, return only featured items
 * @param {string}  [options.sortBy="priority"] - "priority" (desc) | "date" (newest first)
 * @param {number}  [options.limit]        - Max number of results to return
 *
 * @returns {Object[]} Processed, filtered, sorted, limited array.
 */
export function getSortedCases(data, options = {}) {
  // Step 0 — work on a shallow copy so originals are never mutated
  let result = [...data]

  const {
    service,
    category,
    subCategory,
    tag,
    featured,
    sortBy = 'priority',
    limit,
  } = options

  // ── Step 1 · Auto-exclude drafts ──────────────────────────────────────────
  // Items without a status field are treated as "published" (safe default).
  result = result.filter((item) => !item.status || item.status !== 'draft')

  // ── Step 2 · Apply filters ────────────────────────────────────────────────

  // Filter by service slug (e.g. "digital-marketing")
  if (service) {
    result = result.filter(
      (item) => item.service === service
    )
  }

  // Filter by UI category label (e.g. "DIGITAL MARKETING")
  if (category) {
    result = result.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    )
  }

  // Filter by sub-category label within a category (e.g. "Corporate", "Family Events")
  if (subCategory) {
    result = result.filter(
      (item) => item.subCategory?.toLowerCase() === subCategory.toLowerCase()
    )
  }

  // Filter by a single tag (case-insensitive)
  if (tag) {
    const tagLower = tag.toLowerCase()
    result = result.filter(
      (item) => Array.isArray(item.tags) && item.tags.includes(tagLower)
    )
  }

  // Filter to featured-only
  if (featured === true) {
    result = result.filter((item) => item.featured === true)
  }

  // ── Step 3 · Sort ─────────────────────────────────────────────────────────

  if (sortBy === 'priority') {
    // Higher priority number = appears first.
    // Featured items always come before non-featured at equal priority.
    result.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return (b.priority ?? 0) - (a.priority ?? 0)
    })
  } else if (sortBy === 'date') {
    // Newest date first
    result.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }

  // ── Step 4 · Limit ────────────────────────────────────────────────────────
  if (typeof limit === 'number' && limit > 0) {
    result = result.slice(0, limit)
  }

  return result
}


// ─────────────────────────────────────────────────────────────────────────────
// Convenience helpers  (thin wrappers — all go through getSortedCases)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getFeaturedCases — top featured items across all services.
 *
 * @param {Object[]} data
 * @param {number}   [limit=3]
 */
export function getFeaturedCases(data, limit = 3) {
  return getSortedCases(data, { featured: true, sortBy: 'priority', limit })
}

/**
 * getCasesByService — all published items for a specific service.
 *
 * @param {Object[]} data
 * @param {string}   service  - e.g. "digital-marketing"
 * @param {Object}   [opts]   - any extra options passed to getSortedCases
 */
export function getCasesByService(data, service, opts = {}) {
  return getSortedCases(data, { service, ...opts })
}

/**
 * getCasesByCategory — all published items for a UI category label.
 *
 * @param {Object[]} data
 * @param {string}   category - e.g. "DIGITAL MARKETING"
 * @param {Object}   [opts]
 */
export function getCasesByCategory(data, category, opts = {}) {
  return getSortedCases(data, { category, ...opts })
}
