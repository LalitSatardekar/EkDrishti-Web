/**
 * Hero Selector Utility
 * Smart image selection for hero grid based on aspect ratio requirements
 */

import { analyzeImagesCached, getBestMatches, matchesRatio } from './imageAnalyzer'

/**
 * Default hero grid requirements for event pages
 */
const DEFAULT_REQUIREMENTS = {
  landscape: {
    count: 2,
    ratio: 3 / 2,  // 1.5
    tolerance: 0.15
  },
  portrait: {
    count: 3,
    ratio: 9 / 16,  // 0.5625
    tolerance: 0.15
  }
}

/**
 * Select hero images based on aspect ratio requirements
 * 
 * @param {Object} project - Case study project data
 * @param {Object} requirements - Grid requirements (optional)
 * @returns {Promise<Object>} Selected images categorized by orientation
 */
export const selectHeroImages = async (project, requirements = DEFAULT_REQUIREMENTS) => {
  if (!project) {
    return {
      landscape: [],
      portrait: [],
      allSelected: [],
      fallbackUsed: false
    }
  }
  
  // Step 1: Determine source images
  // Priority: explicit hero array > album > fallback to thumbnail
  let sourceImages = []
  
  if (project.hero && project.hero.length > 0) {
    sourceImages = project.hero
  } else if (project.album && project.album.length > 0) {
    sourceImages = project.album
  } else if (project.image) {
    sourceImages = [project.image]
  }
  
  // Remove duplicates
  sourceImages = Array.from(new Set(sourceImages.filter(Boolean)))
  
  if (sourceImages.length === 0) {
    return {
      landscape: [],
      portrait: [],
      allSelected: [],
      fallbackUsed: false
    }
  }
  
  // Step 2: Analyze all source images
  const analyzed = await analyzeImagesCached(sourceImages, { forceLoad: false })
  
  // Step 3: Get best matches for each requirement
  const landscapeMatches = getBestMatches(
    analyzed,
    requirements.landscape.ratio,
    requirements.landscape.count,
    requirements.landscape.tolerance
  )
  
  const portraitMatches = getBestMatches(
    analyzed,
    requirements.portrait.ratio,
    requirements.portrait.count,
    requirements.portrait.tolerance
  )
  
  // Step 4: Track selected images to avoid duplicates
  const selectedSrcs = new Set([
    ...landscapeMatches.map(img => img.src),
    ...portraitMatches.map(img => img.src)
  ])
  
  // Step 5: Fill gaps with fallback strategy if needed
  let fallbackUsed = false
  
  // Fill landscape gaps
  if (landscapeMatches.length < requirements.landscape.count) {
    const needed = requirements.landscape.count - landscapeMatches.length
    const available = analyzed.filter(img => !selectedSrcs.has(img.src))
    
    // Prefer square images, then any available
    const fallbacks = [
      ...available.filter(img => img.orientation === 'square'),
      ...available.filter(img => img.orientation !== 'square')
    ].slice(0, needed)
    
    fallbacks.forEach(img => {
      landscapeMatches.push(img)
      selectedSrcs.add(img.src)
    })
    
    if (fallbacks.length > 0) fallbackUsed = true
  }
  
  // Fill portrait gaps
  if (portraitMatches.length < requirements.portrait.count) {
    const needed = requirements.portrait.count - portraitMatches.length
    const available = analyzed.filter(img => !selectedSrcs.has(img.src))
    
    // Prefer square images, then any available
    const fallbacks = [
      ...available.filter(img => img.orientation === 'square'),
      ...available.filter(img => img.orientation !== 'square')
    ].slice(0, needed)
    
    fallbacks.forEach(img => {
      portraitMatches.push(img)
      selectedSrcs.add(img.src)
    })
    
    if (fallbacks.length > 0) fallbackUsed = true
  }
  
  // Step 6: Return organized results
  return {
    landscape: landscapeMatches.map(img => img.src),
    portrait: portraitMatches.map(img => img.src),
    allSelected: Array.from(selectedSrcs),
    fallbackUsed,
    metadata: {
      totalAnalyzed: analyzed.length,
      landscapeFound: landscapeMatches.length,
      portraitFound: portraitMatches.length,
      landscapeNeeded: requirements.landscape.count,
      portraitNeeded: requirements.portrait.count
    }
  }
}

/**
 * Validate if project has sufficient images for hero grid
 */
export const validateHeroRequirements = (project, requirements = DEFAULT_REQUIREMENTS) => {
  const totalNeeded = requirements.landscape.count + requirements.portrait.count
  
  let availableCount = 0
  if (project.hero && project.hero.length > 0) {
    availableCount = project.hero.length
  } else if (project.album && project.album.length > 0) {
    availableCount = project.album.length
  } else if (project.image) {
    availableCount = 1
  }
  
  return {
    isValid: availableCount >= totalNeeded,
    available: availableCount,
    needed: totalNeeded,
    deficit: Math.max(0, totalNeeded - availableCount)
  }
}

/**
 * Get hero images synchronously using quick filename analysis
 * Useful for SSR or when you need immediate results
 */
export const selectHeroImagesSync = (project, requirements = DEFAULT_REQUIREMENTS) => {
  if (!project) {
    return {
      landscape: [],
      portrait: [],
      allSelected: []
    }
  }
  
  // Determine source
  let sourceImages = []
  if (project.hero && project.hero.length > 0) {
    sourceImages = project.hero
  } else if (project.album && project.album.length > 0) {
    sourceImages = project.album
  } else if (project.image) {
    sourceImages = [project.image]
  }
  
  sourceImages = Array.from(new Set(sourceImages.filter(Boolean)))
  
  // Quick categorization by filename
  const categorized = {
    landscape: [],
    portrait: [],
    unknown: []
  }
  
  sourceImages.forEach(src => {
    const name = src.toLowerCase()
    if (name.includes('long') || name.includes('landscape') || name.includes('wide')) {
      categorized.landscape.push(src)
    } else if (name.includes('short') || name.includes('portrait') || name.includes('vertical')) {
      categorized.portrait.push(src)
    } else {
      categorized.unknown.push(src)
    }
  })
  
  // Select required counts
  const landscape = categorized.landscape.slice(0, requirements.landscape.count)
  const portrait = categorized.portrait.slice(0, requirements.portrait.count)
  
  // Fill gaps from unknown
  const selectedSet = new Set([...landscape, ...portrait])
  const remaining = categorized.unknown.filter(src => !selectedSet.has(src))
  
  while (landscape.length < requirements.landscape.count && remaining.length > 0) {
    const img = remaining.shift()
    landscape.push(img)
    selectedSet.add(img)
  }
  
  while (portrait.length < requirements.portrait.count && remaining.length > 0) {
    const img = remaining.shift()
    portrait.push(img)
    selectedSet.add(img)
  }
  
  return {
    landscape,
    portrait,
    allSelected: Array.from(selectedSet)
  }
}

// Made with Bob
