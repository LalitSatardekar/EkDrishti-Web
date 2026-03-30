import { useState, useEffect, useRef } from 'react'

/**
 * YouTubeEmbed Component
 * 
 * Automatically detects video aspect ratio and maintains it responsively.
 * Supports both YouTube URLs and embed codes.
 * 
 * @param {string} url - YouTube video URL or embed code
 * @param {string} title - Video title for accessibility
 * @param {string} aspectRatio - Optional: Force specific ratio (e.g., "16/9", "9/16")
 * @param {string} className - Additional CSS classes
 * @param {object} containerStyle - Additional inline styles for container
 */

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (input) => {
  if (!input) return null
  
  // If it's already an embed code, extract the ID
  const embedMatch = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]
  
  // Standard YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  
  // If it's just the ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  
  return null
}

// Parse aspect ratio string to numeric value
const parseAspectRatio = (ratio) => {
  if (!ratio) return null
  if (typeof ratio === 'number') return ratio
  
  const normalized = String(ratio).replace(':', '/').replace(/\s+/g, '')
  const parts = normalized.split('/')
  if (parts.length !== 2) return null
  
  const w = parseFloat(parts[0])
  const h = parseFloat(parts[1])
  if (!w || !h) return null
  
  return w / h
}

// Common aspect ratios for YouTube videos
const COMMON_RATIOS = {
  landscape: { numeric: 16 / 9, css: '16 / 9', label: 'Landscape (16:9)' },
  portrait: { numeric: 9 / 16, css: '9 / 16', label: 'Portrait (9:16)' },
  square: { numeric: 1, css: '1 / 1', label: 'Square (1:1)' },
  ultrawide: { numeric: 21 / 9, css: '21 / 9', label: 'Ultrawide (21:9)' },
  classic: { numeric: 4 / 3, css: '4 / 3', label: 'Classic (4:3)' },
}

// Detect aspect ratio by attempting to load video metadata
const detectAspectRatio = async (videoId) => {
  try {
    // Use YouTube oEmbed API to get video info
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    
    if (!response.ok) return COMMON_RATIOS.landscape.css
    
    const data = await response.json()
    const width = data.width || 16
    const height = data.height || 9
    const numeric = width / height
    
    // Snap to common ratios if close
    const tolerance = 0.08
    for (const ratio of Object.values(COMMON_RATIOS)) {
      if (Math.abs(numeric - ratio.numeric) / ratio.numeric <= tolerance) {
        return ratio.css
      }
    }
    
    // Return calculated ratio if no match
    return `${width} / ${height}`
  } catch (error) {
    console.warn('Failed to detect video aspect ratio:', error)
    return COMMON_RATIOS.landscape.css // Default to 16:9
  }
}

const YouTubeEmbed = ({ 
  url, 
  title = 'YouTube video', 
  aspectRatio = null,
  className = '',
  containerStyle = {}
}) => {
  const [detectedRatio, setDetectedRatio] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef(null)
  
  const videoId = extractYouTubeId(url)
  
  useEffect(() => {
    if (!videoId) {
      setIsLoading(false)
      return
    }
    
    // If aspect ratio is provided, use it
    if (aspectRatio) {
      const parsed = parseAspectRatio(aspectRatio)
      if (parsed) {
        setDetectedRatio(aspectRatio.replace(':', '/'))
        setIsLoading(false)
        return
      }
    }
    
    // Otherwise, detect it
    detectAspectRatio(videoId).then((ratio) => {
      setDetectedRatio(ratio)
      setIsLoading(false)
    })
  }, [videoId, aspectRatio])
  
  if (!videoId) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <p className="text-textSecondary">Invalid YouTube URL or embed code</p>
        <p className="text-sm text-textSecondary/60 mt-2">
          Please provide a valid YouTube URL, video ID, or embed code
        </p>
      </div>
    )
  }
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  
  // Build responsive container style
  const finalRatio = detectedRatio || COMMON_RATIOS.landscape.css
  const containerStyles = {
    aspectRatio: finalRatio,
    width: '100%',
    maxWidth: 'min(92vw, 760px)',
    maxHeight: 'min(75vh, 640px)',
    ...containerStyle
  }
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden bg-surface mx-auto ${className}`}
      style={containerStyles}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

export default YouTubeEmbed

// Made with Bob
