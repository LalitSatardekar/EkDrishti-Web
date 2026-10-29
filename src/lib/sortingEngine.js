export const canonicalService = value => ({ events: 'family-events', 'family events': 'family-events', digitalMarketing: 'digital-marketing', 'digital marketing': 'digital-marketing' }[value] || String(value || '').toLowerCase())

/**
 * sortingEngine.js
 *
 * Centralized filtering + sorting layer for all case/work data.
 *
 * â”€â”€â”€ Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * â€¢ Works on a COPY of input data â€” originals are never mutated.
 * â€¢ Automatically strips out items with status: "draft".
 * â€¢ Apply order: filter â†’ sort â†’ limit.
 * â€¢ No component should filter/sort data manually â€” always route through here.
 * â€¢ Future-proof: swap the data argument with an API response array and nothing else changes.
 *
 * â”€â”€â”€ Quick reference â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Core engine
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // Step 0 â€” work on a shallow copy so originals are never mutated
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

  // â”€â”€ Step 1 Â· Auto-exclude drafts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Items without a status field are treated as "published" (safe default).
  result = result.filter((item) => (!item.status || item.status === 'published') && !item.deleted_at)

  // â”€â”€ Step 2 Â· Apply filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Filter by service slug (e.g. "digital-marketing")
  if (service) {
    result = result.filter(
      (item) => canonicalService(item.service) === canonicalService(service)
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

  // â”€â”€ Step 3 Â· Sort â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (sortBy === 'priority') {
    // Higher priority number = appears first.
    // Explicit priorities come first; ties use display order and stable identity.
    result.sort((a, b) => {
      const hasPriority = item => item.priority !== null && item.priority !== undefined && item.priority !== '' && Number.isFinite(Number(item.priority))
      if (hasPriority(a) !== hasPriority(b)) return hasPriority(a) ? -1 : 1
      return (Number(b.priority ?? 0) - Number(a.priority ?? 0)) ||
        (Number(a.order ?? 0) - Number(b.order ?? 0)) ||
        String(a.slug || a.id || a._id).localeCompare(String(b.slug || b.id || b._id))
    })
  } else if (sortBy === 'date') {
    // Newest date first
    result.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }

  // â”€â”€ Step 4 Â· Limit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (typeof limit === 'number' && limit > 0) {
    result = result.slice(0, limit)
  }

  return result
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Convenience helpers  (thin wrappers â€” all go through getSortedCases)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * getFeaturedCases â€” top featured items across all services.
 *
 * @param {Object[]} data
 * @param {number}   [limit=3]
 */
export function getFeaturedCases(data, limit = 3) {
  return getSortedCases(data, { featured: true, sortBy: 'priority', limit })
}

/**
 * getCasesByService â€” all published items for a specific service.
 *
 * @param {Object[]} data
 * @param {string}   service  - e.g. "digital-marketing"
 * @param {Object}   [opts]   - any extra options passed to getSortedCases
 */
export function getCasesByService(data, service, opts = {}) {
  return getSortedCases(data, { service, ...opts })
}

/**
 * getCasesByCategory â€” all published items for a UI category label.
 *
 * @param {Object[]} data
 * @param {string}   category - e.g. "DIGITAL MARKETING"
 * @param {Object}   [opts]
 */
export function getCasesByCategory(data, category, opts = {}) {
  return getSortedCases(data, { category, ...opts })
}

