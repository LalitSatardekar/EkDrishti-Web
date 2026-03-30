/**
 * Image Analyzer Utility
 * Detects and categorizes images by aspect ratio for hero grid optimization
 */

/**
 * Quick analysis from filename patterns
 * Useful for immediate categorization without loading images
 */
export const quickAnalyzeFromFilename = (filename) => {
  if (!filename) return { orientation: 'unknown', ratio: null }
  
  const name = filename.toLowerCase()
  
  // Pattern detection for common naming conventions
  if (name.includes('long') || name.includes('landscape') || name.includes('wide') || name.includes('horizontal')) {
    return { orientation: 'landscape', ratio: 3/2, confidence: 'high' }
  }
  
  if (name.includes('short') || name.includes('portrait') || name.includes('vertical') || name.includes('tall')) {
    return { orientation: 'portrait', ratio: 9/16, confidence: 'high' }
  }
  
  if (name.includes('square') || name.includes('sq')) {
    return { orientation: 'square', ratio: 1, confidence: 'high' }
  }
  
  // Default: unknown, will need actual dimension detection
  return { orientation: 'unknown', ratio: null, confidence: 'low' }
}

/**
 * Load actual image dimensions
 * Returns a promise that resolves with width, height, and calculated ratio
 */
export const loadImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const ratio = img.width / img.height
      
      // Categorize orientation based on ratio
      let orientation
      if (ratio > 1.2) {
        orientation = 'landscape'
      } else if (ratio < 0.8) {
        orientation = 'portrait'
      } else {
        orientation = 'square'
      }
      
      resolve({
        width: img.width,
        height: img.height,
        ratio,
        orientation,
        confidence: 'exact'
      })
    }
    
    img.onerror = () => {
      // Fallback to filename analysis on error
      const fallback = quickAnalyzeFromFilename(src)
      resolve({
        width: null,
        height: null,
        ...fallback,
        error: true
      })
    }
    
    img.src = src
  })
}

/**
 * Analyze image with fallback strategy
 * 1. Try filename pattern
 * 2. If low confidence, load actual dimensions
 */
export const analyzeImage = async (src, options = { forceLoad: false }) => {
  // Quick check first
  const quick = quickAnalyzeFromFilename(src)
  
  // If high confidence or forceLoad is false, return quick result
  if (quick.confidence === 'high' && !options.forceLoad) {
    return { src, ...quick }
  }
  
  // Otherwise, load actual dimensions
  try {
    const dimensions = await loadImageDimensions(src)
    return { src, ...dimensions }
  } catch (error) {
    // Fallback to quick analysis
    return { src, ...quick, error: true }
  }
}

/**
 * Check if image ratio matches target ratio within tolerance
 */
export const matchesRatio = (imageRatio, targetRatio, tolerance = 0.15) => {
  if (!imageRatio || !targetRatio) return false
  return Math.abs(imageRatio - targetRatio) / targetRatio <= tolerance
}

/**
 * Categorize a list of images by orientation
 */
export const categorizeByOrientation = async (images, options = {}) => {
  const analyzed = await Promise.all(
    images.map(src => analyzeImage(src, options))
  )
  
  const categorized = {
    landscape: [],
    portrait: [],
    square: [],
    unknown: []
  }
  
  analyzed.forEach(img => {
    if (img.orientation && categorized[img.orientation]) {
      categorized[img.orientation].push(img)
    } else {
      categorized.unknown.push(img)
    }
  })
  
  return categorized
}

/**
 * Get best matching images for a specific ratio requirement
 */
export const getBestMatches = (analyzedImages, targetRatio, count, tolerance = 0.15) => {
  // Filter images that match the target ratio
  const matches = analyzedImages.filter(img => 
    img.ratio && matchesRatio(img.ratio, targetRatio, tolerance)
  )
  
  // Sort by how close they are to target ratio
  matches.sort((a, b) => {
    const diffA = Math.abs(a.ratio - targetRatio)
    const diffB = Math.abs(b.ratio - targetRatio)
    return diffA - diffB
  })
  
  return matches.slice(0, count)
}

/**
 * Batch analyze images with caching
 */
const analysisCache = new Map()

export const analyzeImagesCached = async (images, options = {}) => {
  const results = []
  const toAnalyze = []
  
  // Check cache first
  for (const src of images) {
    if (analysisCache.has(src)) {
      results.push(analysisCache.get(src))
    } else {
      toAnalyze.push(src)
    }
  }
  
  // Analyze uncached images
  if (toAnalyze.length > 0) {
    const analyzed = await Promise.all(
      toAnalyze.map(src => analyzeImage(src, options))
    )
    
    // Cache results
    analyzed.forEach(result => {
      analysisCache.set(result.src, result)
      results.push(result)
    })
  }
  
  return results
}

/**
 * Clear analysis cache (useful for testing or memory management)
 */
export const clearAnalysisCache = () => {
  analysisCache.clear()
}

// Made with Bob
