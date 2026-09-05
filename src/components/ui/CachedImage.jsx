import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { encodeAssetUrl } from '../../lib/config'

/**
 * Aspect ratio style mapping for standard photography ratios:
 * 3:4, 4:3, 3:2, 2:3, 16:9, 9:16, 1:1, auto
 */
export const ASPECT_RATIO_STYLES = {
  '3:4': 'aspect-[3/4]',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '2:3': 'aspect-[2/3]',
  '16:9': 'aspect-[16/9]',
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  'auto': ''
}

const CachedImage = ({
  src,
  alt = 'Image',
  className,
  fallbackClassName,
  containerClassName,
  containerStyle,
  onLoad,
  onError,
  aspectRatio = 'auto',
  objectFit = 'cover',
  ...imgProps
}) => {
  const resolvedSrc = encodeAssetUrl(src)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryWithS3, setRetryWithS3] = useState(false)
  const imgRef = useRef(null)

  // Reset states when source changes
  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
    setRetryWithS3(false)

    // Check if the image is already cached/complete in browser memory
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true)
    }

    // Safety failsafe: never stay stuck in loading state longer than 4 seconds
    const timer = setTimeout(() => {
      setIsLoaded((prev) => {
        if (!prev && !hasError) {
          return true
        }
        return prev
      })
    }, 4000)

    return () => clearTimeout(timer)
  }, [src, resolvedSrc])

  const handleLoad = (e) => {
    setIsLoaded(true)
    setHasError(false)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    // If initial source failed and hasn't retried with direct S3
    if (!retryWithS3 && src && typeof src === 'string' && src.includes('assets/')) {
      setRetryWithS3(true)
      return
    }

    setHasError(true)
    setIsLoaded(true)
    if (onError) onError(e)
  }

  const showSkeleton = !isLoaded && !hasError
  const ratioClass = ASPECT_RATIO_STYLES[aspectRatio] || ''

  // Fallback direct S3 URL
  const currentSrc = retryWithS3
    ? `https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/webp/${encodeURI(decodeURIComponent(src.replace(/^\/?assets\/webp\/?/i, '')))}`
    : (resolvedSrc || src)

  return (
    <div
      style={containerStyle}
      className={clsx(
        'relative w-full overflow-hidden transition-colors duration-300',
        showSkeleton ? 'bg-[#0F172A]/70 min-h-[160px]' : 'bg-transparent min-h-0',
        ratioClass,
        containerClassName
      )}
    >
      {/* Loading Skeleton Animation */}
      {showSkeleton && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm">
          {/* Shimmer Sweep Animation */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

          {/* Animated Loader & Pulsing Icon */}
          <div className="relative flex flex-col items-center gap-2 p-3 text-center select-none">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-inner">
              <svg
                className="w-4 h-4 text-amber-400/80 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            </div>
            <span className="text-[10px] font-medium tracking-wider uppercase text-textSecondary/70 animate-pulse">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Fallback Error State */}
      {hasError ? (
        <div className="w-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center bg-surface/40 border border-white/5 rounded-xl">
          <svg className="w-6 h-6 text-textSecondary/40 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[11px] text-textSecondary/60">Photo unavailable</span>
        </div>
      ) : (
        /* Actual Image */
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            className,
            'transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            aspectRatio !== 'auto'
              ? (objectFit === 'contain' ? 'w-full h-full object-contain block' : 'w-full h-full object-cover block')
              : (objectFit === 'contain' ? 'w-full h-auto object-contain block' : (objectFit === 'cover' ? 'w-full h-full object-cover block' : 'w-full h-auto block')),
            fallbackClassName
          )}
          loading="lazy"
          {...imgProps}
        />
      )}
    </div>
  )
}

export default CachedImage
