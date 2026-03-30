/**
 * Gallery Filter Utility
 * Handles deduplication between hero grid and gallery images
 */

/**
 * Remove hero images from gallery to prevent duplicates
 * 
 * @param {Array<string>} albumImages - Full album image array
 * @param {Array<string>} heroImages - Images used in hero grid
 * @returns {Array<string>} Filtered gallery images without hero images
 */
export const deduplicateGallery = (albumImages, heroImages) => {
  if (!albumImages || albumImages.length === 0) {
    return []
  }
  
  if (!heroImages || heroImages.length === 0) {
    return albumImages
  }
  
  // Use Set for O(1) lookup performance
  const heroSet = new Set(heroImages.filter(Boolean))
  
  // Filter out any image that appears in hero
  return albumImages.filter(img => img && !heroSet.has(img))
}

/**
 * Prepare gallery images with metadata for AlbumGrid component
 * Automatically deduplicates and formats for display
 * 
 * @param {Array<string>} albumImages - Full album array
 * @param {Array<string>} heroImages - Images used in hero grid
 * @param {Object} project - Project data for metadata
 * @returns {Array<Object>} Formatted image objects for AlbumGrid
 */
export const prepareGalleryImages = (albumImages, heroImages, project) => {
  // Deduplicate first
  const deduplicated = deduplicateGallery(albumImages, heroImages)
  
  // Format for AlbumGrid component
  return deduplicated.map((src, index) => ({
    id: index + 1,
    src,
    title: project?.title ?? 'Album',
    alt: `${project?.title ?? 'Album'} photo ${index + 1}`,
  }))
}

/**
 * Get statistics about deduplication
 * Useful for debugging and validation
 */
export const getDeduplicationStats = (albumImages, heroImages) => {
  const originalCount = albumImages?.length || 0
  const heroCount = heroImages?.length || 0
  const deduplicated = deduplicateGallery(albumImages, heroImages)
  const deduplicatedCount = deduplicated.length
  const removedCount = originalCount - deduplicatedCount
  
  return {
    original: originalCount,
    hero: heroCount,
    deduplicated: deduplicatedCount,
    removed: removedCount,
    removalRate: originalCount > 0 ? (removedCount / originalCount) * 100 : 0
  }
}

/**
 * Validate that hero images exist in album
 * Returns list of hero images that are NOT in the album (orphaned)
 */
export const validateHeroInAlbum = (albumImages, heroImages) => {
  if (!albumImages || !heroImages) {
    return []
  }
  
  const albumSet = new Set(albumImages.filter(Boolean))
  const orphaned = heroImages.filter(img => img && !albumSet.has(img))
  
  return orphaned
}

/**
 * Smart gallery preparation with validation
 * Includes warnings for potential issues
 */
export const prepareGalleryImagesWithValidation = (albumImages, heroImages, project) => {
  const stats = getDeduplicationStats(albumImages, heroImages)
  const orphaned = validateHeroInAlbum(albumImages, heroImages)
  const galleryImages = prepareGalleryImages(albumImages, heroImages, project)
  
  const warnings = []
  
  // Check if too many images were removed
  if (stats.removalRate > 50) {
    warnings.push(`High removal rate: ${stats.removalRate.toFixed(1)}% of album images are in hero`)
  }
  
  // Check for orphaned hero images
  if (orphaned.length > 0) {
    warnings.push(`${orphaned.length} hero image(s) not found in album`)
  }
  
  // Check if gallery is empty
  if (galleryImages.length === 0 && stats.original > 0) {
    warnings.push('Gallery is empty after deduplication')
  }
  
  return {
    images: galleryImages,
    stats,
    orphaned,
    warnings,
    isValid: warnings.length === 0
  }
}

/**
 * Merge multiple image sources with deduplication
 * Useful when combining hero, album, and additional images
 */
export const mergeImageSources = (...sources) => {
  const allImages = sources
    .flat()
    .filter(Boolean)
  
  // Remove duplicates while preserving order
  return Array.from(new Set(allImages))
}

/**
 * Split images into hero and gallery based on count
 * Simple utility for when you just want first N for hero, rest for gallery
 */
export const splitHeroAndGallery = (images, heroCount = 5) => {
  if (!images || images.length === 0) {
    return { hero: [], gallery: [] }
  }
  
  const uniqueImages = Array.from(new Set(images.filter(Boolean)))
  
  return {
    hero: uniqueImages.slice(0, heroCount),
    gallery: uniqueImages.slice(heroCount)
  }
}

// Made with Bob
