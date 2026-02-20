# Sorting & Filtering Engine

A lightweight, centralized data-query layer for the Ekdrishti project.
No component filters or sorts data manually — everything routes through this engine.

---

## File Map

```
src/
  lib/
    sortingEngine.js      ← The engine (this is what you import in components)
  data/
    cases.js              ← Single source of truth for all work / case-study data
    content.js            ← Existing: services, pricingPlans, testimonials, stats (unchanged)
```

---

## How It Works

```
Raw data (cases.js)
       ↓
getSortedCases(data, options)
       ↓
1. Strip drafts automatically
2. Apply filters  (service / category / tag / featured)
3. Sort           (priority desc  |  date desc)
4. Limit          (slice to N items)
       ↓
Clean array → passed to component as prop
```

Components **never** receive raw data. They only receive the processed result.

---

## The Engine — `src/lib/sortingEngine.js`

### Main function

```js
getSortedCases(data, options = {})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `service` | `string` | — | Filter by service slug: `"family-events"` \| `"digital-marketing"` \| `"production"` |
| `category` | `string` | — | Filter by UI category label (case-insensitive): `"EVENTS"` \| `"DIGITAL MARKETING"` \| `"PRODUCTION"` |
| `tag` | `string` | — | Filter by a single tag from item's `tags[]` array |
| `featured` | `boolean` | — | When `true`, return only items with `featured: true` |
| `sortBy` | `"priority"` \| `"date"` | `"priority"` | Sort order |
| `limit` | `number` | — | Max items to return |

### Convenience helpers

```js
getFeaturedCases(data, limit = 3)
// → top featured items across all services, sorted by priority

getCasesByService(data, "digital-marketing", { limit: 6 })
// → all published digital marketing cases, priority sorted, top 6

getCasesByCategory(data, "EVENTS", { sortBy: "date" })
// → all event cases sorted newest first
```

---

## Data Source — `src/data/cases.js`

Single JS array `allCases` — 21 items across 3 services (7 per service).

### Item shape

```js
{
  id:          1,                          // unique number
  slug:        "siddhita-kanad-wedding",   // used in /work/:slug routes
  title:       "Siddhita & Kanad",
  client:      "Siddhita & Kanad",
  service:     "family-events",            // engine filter key
  category:    "EVENTS",                   // UI filter label (Work page)
  tags:        ["wedding", "photography"], // fine-grained tag filter
  featured:    true,                       // boosts to top in priority sort
  priority:    95,                         // 0–100, higher = shown first
  status:      "published",               // "draft" = NEVER shown
  date:        "2024-02-10",               // ISO date for date sort
  description: "...",
  image:       "https://...",
  height:      "h-56",                     // Tailwind class for masonry grid
  results: {
    metric1: "...",
    metric2: "...",
    metric3: "...",
  },
}
```

### Draft protection

Any item with `status: "draft"` is automatically excluded by the engine.
Items without a `status` field are treated as published (safe default).

---

## Usage Examples

### In a page — filter by service

```jsx
import { getSortedCases }    from "../lib/sortingEngine"
import { allCases }          from "../data/cases"

// Inside component or at module level:
const digitalMarketingCases = getSortedCases(allCases, {
  service: "digital-marketing",
  sortBy:  "priority",
  limit:   6,
})
```

### Featured cases for Home page

```jsx
import { getFeaturedCases } from "../lib/sortingEngine"
import { allCases }         from "../data/cases"

const featured = getFeaturedCases(allCases, 3)
```

### Work page — category filtering

```jsx
import { getCasesByCategory } from "../lib/sortingEngine"
import { allCases }           from "../data/cases"

// Replace inline filter in Work.jsx:
// Before: workItems.filter(item => item.category === activeCategory)
// After:
const filteredItems = getCasesByCategory(allCases, activeCategory)
```

### Filter by tag

```jsx
const weddingCases = getSortedCases(allCases, {
  service: "family-events",
  tag:     "wedding",
  sortBy:  "date",
})
```

### Combined filters

```jsx
const topFeaturedEvents = getSortedCases(allCases, {
  service:  "family-events",
  featured: true,
  sortBy:   "priority",
  limit:    3,
})
```

---

## Adding New Items

1. Open `src/data/cases.js`
2. Append a new object to the `allCases` array using the shape above
3. Set `status: "published"` (or omit — both work)
4. **Done.** It will automatically appear in all pages/components that use the engine with matching filters.

No UI file needs to be touched.

---

## Architectural Rules

| Rule | Reason |
|---|---|
| **Never import `allCases` directly in a component** | Components should only receive processed data |
| **Never filter/sort inside a component** | Keeps components dumb and reusable |
| **Never mutate the input array** | The engine always spreads a copy |
| **Set `status: "draft"` to hide an item** | No need to delete — just mark as draft |
| **Use `priority` to control order** | Don't rely on array index position |

---

## Future — Swapping to an API

The engine is data-source agnostic. When you're ready to fetch from an API:

```js
// Before (local data):
const cases = getSortedCases(allCases, { service: "digital-marketing" })

// After (API data — engine code unchanged):
const apiData = await fetch("/api/cases").then(r => r.json())
const cases   = getSortedCases(apiData, { service: "digital-marketing" })
```

The engine function signature and all component code stays identical.

---

## Current Data Summary

| Service | Category label | Items | Featured |
|---|---|---|---|
| `family-events` | EVENTS | 7 | 3 |
| `digital-marketing` | DIGITAL MARKETING | 7 | 3 |
| `production` | PRODUCTION | 7 | 3 |
| **Total** | | **21** | **9** |

All 21 items have `status: "published"`.
