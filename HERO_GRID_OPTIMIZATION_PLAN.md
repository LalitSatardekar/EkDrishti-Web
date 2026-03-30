# Hero Grid Optimization Plan
## Aspect Ratio Matching & Image Deduplication System

## Overview
Create a smart image selection system that:
1. Automatically detects image aspect ratios
2. Selects images matching the hero grid layout requirements
3. Prevents duplicate images between hero grid and gallery
4. Maintains optimal visual presentation

## Current System Analysis

### Hero Grid Layout (WorkDetail.jsx lines 156-178)
**For Events (`isEvent === true`):**
- **Top Row**: 2 images in `md:grid-cols-2`
  - Aspect ratio: `3/2` (landscape)
  - Max height: `400px`
  
- **Bottom Row**: 3 images in `md:grid-cols-3`
  - Aspect ratio: `9/16` (portrait/vertical)
  - Max height: `400px`

**Total needed**: 5 images (2 landscape + 3 portrait)

### Current Data Structure (cases.js)
```javascript
{
  image: 'thumbnail.jpg',        // Card thumbnail
  album: ['img1.jpg', ...],      // Full gallery
  hero: ['img1.jpg', ...],       // Optional explicit hero images
}
```

### Current Hero Selection Logic (WorkDetail.jsx lines 57-61)
```javascript
const heroSource = (project?.hero && project.hero.length > 0)
  ? project.hero
  : ((project?.album && project.album.length > 0) ? project.album : [project?.image])

const heroImages = Array.from(new Set(heroSource.filter(Boolean))).slice(0, 5)
```

**Issues:**
- No aspect ratio validation
- Random selection from album if no hero array
- May select incompatible ratios for grid slots

## Solution Architecture

### Phase 1: Image Metadata System

#### 1.1 Create Image Analyzer Utility
**File**: `src/lib/imageAnalyzer.js`

```javascript
/**
 * Detect image aspect ratio from filename patterns or load actual dimensions
 * Returns: { width, height, ratio, orientation }
 */
export const analyzeImage = async (src) => {
  // Strategy 1: Pattern matching from filename
  // e.g., "long-1.jpg" → landscape, "short1.jpg" → portrait
  
  // Strategy 2: Load image and get actual dimensions
  // Use Image() API for client-side detection
  
  // Strategy 3: Metadata from data structure (if provided)
}

/**
 * Categorize images by aspect ratio buckets
 */
export const categorizeByRatio = (images) => {
  return {
    landscape: [],  // ~3:2, 16:9
    portrait: [],   // ~9:16, 2:3
    square: [],     // ~1:1
  }
}

/**
 * Calculate aspect ratio tolerance matching
 */
export const matchesRatio = (imageRatio, targetRatio, tolerance = 0.08) => {
  return Math.abs(imageRatio - targetRatio) / targetRatio <= tolerance
}
```

#### 1.2 Enhance Data Structure
**File**: `src/data/cases.js`

Add optional metadata to each case:
```javascript
{
  id: 1,
  slug: 'siddhita-kanad-wedding',
  // ... existing fields
  
  // NEW: Image metadata (optional, for optimization)
  imageMetadata: {
    'long-1.jpg': { ratio: 3/2, orientation: 'landscape' },
    'short1.jpg': { ratio: 9/16, orientation: 'portrait' },
    // ... or auto-detect if not provided
  },
  
  // NEW: Explicit hero configuration (optional)
  heroConfig: {
    landscape: ['long-1.jpg', 'long2.jpg'],  // For top row
    portrait: ['short1.jpg', 'short2.jpg', 'short3.jpg'],  // For bottom row
  }
}
```

### Phase 2: Smart Hero Selection Algorithm

#### 2.1 Create Hero Selector Utility
**File**: `src/lib/heroSelector.js`

```javascript
/**
 * Smart hero image selection based on aspect ratios
 * 
 * @param {Object} project - Case study data
 * @param {Object} requirements - Grid requirements
 * @returns {Object} { landscape: [], portrait: [], excluded: [] }
 */
export const selectHeroImages = async (project, requirements = {
  landscape: { count: 2, ratio: 3/2 },
  portrait: { count: 3, ratio: 9/16 },
}) => {
  // Step 1: Get source images
  const sourceImages = project.hero || project.album || [project.image]
  
  // Step 2: Analyze all images
  const analyzed = await Promise.all(
    sourceImages.map(async (src) => ({
      src,
      ...await analyzeImage(src)
    }))
  )
  
  // Step 3: Categorize by orientation
  const categorized = {
    landscape: analyzed.filter(img => 
      matchesRatio(img.ratio, requirements.landscape.ratio)
    ),
    portrait: analyzed.filter(img => 
      matchesRatio(img.ratio, requirements.portrait.ratio)
    ),
  }
  
  // Step 4: Select best matches
  const selected = {
    landscape: categorized.landscape.slice(0, requirements.landscape.count),
    portrait: categorized.portrait.slice(0, requirements.portrait.count),
  }
  
  // Step 5: Fallback if insufficient images
  if (selected.landscape.length < requirements.landscape.count) {
    // Use square images or best available
    const fallback = analyzed
      .filter(img => !selected.landscape.includes(img))
      .slice(0, requirements.landscape.count - selected.landscape.length)
    selected.landscape.push(...fallback)
  }
  
  if (selected.portrait.length < requirements.portrait.count) {
    // Use square images or best available
    const fallback = analyzed
      .filter(img => 
        !selected.landscape.includes(img) && 
        !selected.portrait.includes(img)
      )
      .slice(0, requirements.portrait.count - selected.portrait.length)
    selected.portrait.push(...fallback)
  }
  
  return {
    landscape: selected.landscape.map(img => img.src),
    portrait: selected.portrait.map(img => img.src),
    allSelected: [
      ...selected.landscape.map(img => img.src),
      ...selected.portrait.map(img => img.src)
    ]
  }
}
```

### Phase 3: Deduplication System

#### 3.1 Gallery Filter Utility
**File**: `src/lib/galleryFilter.js`

```javascript
/**
 * Remove hero images from gallery to prevent duplicates
 * 
 * @param {Array} albumImages - Full album array
 * @param {Array} heroImages - Images used in hero grid
 * @returns {Array} Filtered gallery images
 */
export const deduplicateGallery = (albumImages, heroImages) => {
  const heroSet = new Set(heroImages)
  
  return albumImages.filter(img => !heroSet.has(img))
}

/**
 * Create deduplicated image objects for AlbumGrid
 */
export const prepareGalleryImages = (albumImages, heroImages, project) => {
  const deduplicated = deduplicateGallery(albumImages, heroImages)
  
  return deduplicated.map((src, index) => ({
    id: index + 1,
    src,
    title: project?.title ?? 'Album',
    alt: `${project?.title ?? 'Album'} photo ${index + 1}`,
  }))
}
```

### Phase 4: Integration into WorkDetail.jsx

#### 4.1 Update WorkDetail Component

```javascript
import { selectHeroImages } from '../lib/heroSelector'
import { prepareGalleryImages } from '../lib/galleryFilter'

const WorkDetail = () => {
  const { slug } = useParams()
  const project = allCases.find((s) => s.slug === slug)
  
  const [heroSelection, setHeroSelection] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Smart hero selection on mount
  useEffect(() => {
    const loadHeroImages = async () => {
      if (!project) return
      
      const selection = await selectHeroImages(project, {
        landscape: { count: 2, ratio: 3/2 },
        portrait: { count: 3, ratio: 9/16 },
      })
      
      setHeroSelection(selection)
      setLoading(false)
    }
    
    loadHeroImages()
  }, [project])
  
  // Deduplicated gallery
  const galleryImages = heroSelection 
    ? prepareGalleryImages(
        project.album || [],
        heroSelection.allSelected,
        project
      )
    : []
  
  // Render hero grid with selected images
  const renderHeroGrid = () => {
    if (!heroSelection || loading) return <LoadingPlaceholder />
    
    return (
      <div className="space-y-4">
        {/* Top row: 2 landscape */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heroSelection.landscape.slice(0, 2).map((src, idx) => (
            <CachedImage
              key={`hero-landscape-${idx}`}
              src={src}
              alt={`${project.title} hero ${idx + 1}`}
              className="w-full aspect-[3/2] max-h-[400px] object-cover rounded-lg"
            />
          ))}
        </div>
        
        {/* Bottom row: 3 portrait */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heroSelection.portrait.slice(0, 3).map((src, idx) => (
            <CachedImage
              key={`hero-portrait-${idx}`}
              src={src}
              alt={`${project.title} highlight ${idx + 3}`}
              className="w-full aspect-[9/16] max-h-[400px] object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    // ... existing JSX with renderHeroGrid()
  )
}
```

## Implementation Strategy

### Quick Win Approach (Filename Pattern Matching)

For immediate implementation without loading images:

```javascript
// src/lib/quickImageAnalyzer.js

export const quickAnalyzeFromFilename = (filename) => {
  const name = filename.toLowerCase()
  
  // Pattern detection
  if (name.includes('long') || name.includes('landscape') || name.includes('wide')) {
    return { orientation: 'landscape', ratio: 3/2 }
  }
  
  if (name.includes('short') || name.includes('portrait') || name.includes('vertical')) {
    return { orientation: 'portrait', ratio: 9/16 }
  }
  
  if (name.includes('square') || name.includes('sq')) {
    return { orientation: 'square', ratio: 1 }
  }
  
  // Default: assume landscape for unknown
  return { orientation: 'landscape', ratio: 3/2 }
}
```

### Advanced Approach (Actual Dimension Detection)

For production-ready solution:

```javascript
// src/lib/imageLoader.js

export const loadImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const ratio = img.width / img.height
      const orientation = ratio > 1.2 ? 'landscape' 
                        : ratio < 0.8 ? 'portrait' 
                        : 'square'
      
      resolve({
        width: img.width,
        height: img.height,
        ratio,
        orientation
      })
    }
    
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}
```

## Testing Strategy

### Test Cases

1. **Perfect Match**: Album has exactly 2 landscape + 3 portrait
2. **Insufficient Portraits**: Album has 2 landscape + 1 portrait
3. **Insufficient Landscapes**: Album has 1 landscape + 3 portrait
4. **All Same Ratio**: Album has only landscape images
5. **Mixed Ratios**: Album has various aspect ratios
6. **Explicit Hero Array**: Project has pre-defined hero images
7. **No Album**: Project only has thumbnail image

### Validation

```javascript
// Test deduplication
const heroImages = ['img1.jpg', 'img2.jpg', 'img3.jpg']
const albumImages = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg']
const gallery = deduplicateGallery(albumImages, heroImages)
// Expected: ['img4.jpg', 'img5.jpg']
```

## Performance Considerations

1. **Caching**: Cache analyzed image metadata to avoid re-analysis
2. **Lazy Loading**: Only analyze images when needed
3. **Progressive Enhancement**: Show placeholder while analyzing
4. **Fallback**: Always have a fallback selection strategy

## Migration Path

### Phase 1: Add utilities (non-breaking)
- Create `imageAnalyzer.js`
- Create `heroSelector.js`
- Create `galleryFilter.js`

### Phase 2: Update data (optional enhancement)
- Add `imageMetadata` to cases (optional)
- Add `heroConfig` to cases (optional)

### Phase 3: Update WorkDetail (breaking change)
- Integrate smart selection
- Update hero rendering
- Update gallery filtering

### Phase 4: Optimize
- Add caching layer
- Performance monitoring
- A/B testing

## Success Metrics

- ✅ Hero grid always shows correct aspect ratios
- ✅ No duplicate images between hero and gallery
- ✅ Graceful fallback for edge cases
- ✅ Fast load times (<100ms for selection)
- ✅ Works for all existing cases without data changes

## Files to Create/Modify

### New Files
- `src/lib/imageAnalyzer.js`
- `src/lib/heroSelector.js`
- `src/lib/galleryFilter.js`
- `src/lib/quickImageAnalyzer.js` (optional)
- `src/lib/imageLoader.js` (optional)

### Modified Files
- `src/pages/WorkDetail.jsx`
- `src/data/cases.js` (optional enhancements)

## Estimated Timeline
- Phase 1 (Utilities): 2-3 hours
- Phase 2 (Data Enhancement): 1 hour (optional)
- Phase 3 (Integration): 2-3 hours
- Phase 4 (Testing & Optimization): 2 hours
- **Total**: 7-9 hours

## Next Steps
1. Review and approve plan
2. Decide on quick win vs. advanced approach
3. Create utilities in order
4. Test with existing cases
5. Deploy and monitor