import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import AlbumGrid from '../components/album/AlbumGrid'
import SuggestionSection from '../components/work/SuggestionSection'
import DownloadButton from '../components/ui/DownloadButton'
import { allCases } from '../data/cases'

// Parse ratios like "16/9", "16:9", or "16 / 9" into numeric + css-ready string
const parseAspectRatio = (value) => {
  if (!value) return null
  if (typeof value === 'number') return { numeric: value, css: `${value} / 1` }
  const normalized = String(value).replace(':', '/').replace(/\s+/g, '')
  const parts = normalized.split('/')
  if (parts.length !== 2) return null
  const w = parseFloat(parts[0])
  const h = parseFloat(parts[1])
  if (!w || !h) return null
  return { numeric: w / h, css: `${w} / ${h}` }
}

// Snap ratios to common buckets when close; otherwise keep the raw css string
const bucketAspectRatio = (numeric, fallbackCss) => {
  if (!numeric) return fallbackCss
  const candidates = [
    { numeric: 16 / 9, css: '16 / 9' },
    { numeric: 3 / 2, css: '3 / 2' },
    { numeric: 9 / 16, css: '9 / 16' },
  ]
  const tolerance = 0.08 // allow ~8% deviation
  const match = candidates.find((c) => Math.abs(numeric - c.numeric) / c.numeric <= tolerance)
  return match ? match.css : fallbackCss
}

const WorkDetail = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === '1'

  const project = allCases.find((s) => s.slug === slug)
  const [videoRatios, setVideoRatios] = useState({})

  // Reset cached ratios when slug changes to avoid index carry-over between cases
  useEffect(() => {
    setVideoRatios({})
  }, [slug])

  // Build a deduped hero strip. Prefer an explicit hero list if provided; otherwise use album-only; fall back to image when no album exists.
  const heroSource = (project?.hero && project.hero.length > 0)
    ? project.hero
    : ((project?.album && project.album.length > 0) ? project.album : [project?.image])

  const heroImages = Array.from(new Set(heroSource.filter(Boolean))).slice(0, 5)

  // Dedup album and exclude anything already shown in the hero to avoid repeats
  // Album: include all unique album images (even if used in hero) to ensure full set is visible
  const albumImages = Array.from(new Set(project?.album || []))
    .filter(Boolean)
    .map((src, index) => ({
      id: index + 1,
      src,
      title: `${project?.title ?? 'Album'}`,
      alt: `${project?.title ?? 'Album'} photo ${index + 1}`,
    }))

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? albumImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === albumImages.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') closeLightbox()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!project) {
    if (isPreview) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h1 className="text-2xl font-heading font-bold text-textPrimary mb-2">Project Preview Unavailable</h1>
            <p className="text-textSecondary">This project page is not yet available for preview.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-heading font-bold text-textPrimary mb-6">Project Not Found</h1>
          <Link to="/work" className="btn-primary inline-block">
            Back to Work
          </Link>
        </div>
      </div>
    )
  }

  const isEvent = project.service === 'family-events'

  return (
    <div className="min-h-screen bg-primary py-20">
      <div className="max-w-5xl mx-auto px-5">
        <Link
          to="/work"
          className="inline-flex items-center text-textSecondary hover:text-accent transition-colors duration-200 mb-12"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work
        </Link>

        <h1 className="text-4xl md:text-5xl text-center mb-10 text-textPrimary" style={{ fontFamily: "'Great Vibes', cursive" }}>
          {project.title}
        </h1>

        {isEvent ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroImages.slice(0, 2).map((src, idx) => (
                <img
                  key={`hero-top-${idx}`}
                  src={src}
                  alt={`${project.title} hero ${idx + 1}`}
                  className="w-full aspect-[3/2] max-h-[320px] object-cover rounded-lg"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroImages.slice(2, 5).map((src, idx) => (
                <img
                  key={`hero-bottom-${idx}`}
                  src={src}
                  alt={`${project.title} highlight ${idx + 3}`}
                  className="w-full aspect-[2/3] max-h-[240px] object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        ) : (
          project.image && (
            <div className="mb-10">
              <img
                src={project.image}
                alt={project.title}
                className="w-full rounded-xl object-cover"
              />
            </div>
          )
        )}

        {project.hasVideo && (project.video || (project.videos && project.videos.length > 0)) && (
          <div className="mt-16">
            <h2 className="text-3xl md:text-4xl text-center mb-8 text-textSecondary font-medium tracking-wide">
              Video
            </h2>
            {project.videos && project.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto place-items-center">
                {project.videos.map((item, idx) => {
                  const src = typeof item === 'string' ? item : item.src
                  if (!src) return null
                  const poster = typeof item === 'string' ? (project.videoPoster || project.image) : (item.poster || project.videoPoster || project.image)
                  const ratioKey = src
                  const explicit = parseAspectRatio(typeof item === 'object' && item.aspectRatio ? item.aspectRatio : project.aspectRatio)
                  const ratio = explicit ? explicit.css : videoRatios[ratioKey]

                  return (
                    <div
                      key={`video-${idx}`}
                      className="relative rounded-lg overflow-hidden bg-surface w-full"
                      style={ratio ? { aspectRatio: ratio, maxHeight: 'min(75vh, 560px)' } : { maxHeight: 'min(75vh, 560px)' }}
                    >
                      <video
                        controls
                        poster={poster}
                        className="w-full h-full object-contain"
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const { videoWidth, videoHeight } = e.target
                          if (videoWidth && videoHeight) {
                            const computed = `${videoWidth} / ${videoHeight}`
                            setVideoRatios((prev) => (prev[ratioKey] === computed ? prev : { ...prev, [ratioKey]: computed }))
                          }
                        }}
                      >
                        <source src={src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                className="relative rounded-lg overflow-hidden bg-surface mb-6 max-w-sm md:max-w-md mx-auto"
                style={(() => {
                  const explicit = parseAspectRatio(project.aspectRatio)
                  const ratio = explicit ? explicit.css : videoRatios.single
                  return ratio ? { aspectRatio: ratio, maxHeight: 'min(75vh, 560px)' } : { maxHeight: 'min(75vh, 560px)' }
                })()}
              >
                <video
                  controls
                  poster={project.videoPoster || project.image}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const { videoWidth, videoHeight } = e.target
                    if (videoWidth && videoHeight) {
                      const computed = `${videoWidth} / ${videoHeight}`
                      setVideoRatios((prev) => (prev.single === computed ? prev : { ...prev, single: computed }))
                    }
                  }}
                >
                  <source src={project.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {project.driveLinks?.video && (
              <div className="flex justify-center">
                <DownloadButton
                  label="Download Video"
                  driveLink={project.driveLinks.video}
                  icon="video"
                  variant="primary"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {albumImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 mt-20">
          <h2 className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
            Album Gallery
          </h2>

          <AlbumGrid images={albumImages} onImageClick={openLightbox} />

          {project.driveLinks?.albumGallery && (
            <div className="flex justify-center mt-12">
              <DownloadButton
                label="Download Album Photos"
                driveLink={project.driveLinks.albumGallery}
                icon="download"
                variant="primary"
              />
            </div>
          )}
        </div>
      )}

      {project.driveLinks?.allFiles && (
        <div className="max-w-5xl mx-auto px-5 mt-20">
          <div className="bg-gradient-to-br from-surface to-secondary p-8 rounded-2xl border border-borderSubtle text-center">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-4">
              Client Access
            </h3>
            <p className="text-textSecondary mb-6 max-w-2xl mx-auto">
              Download all event files including photos, videos, and albums. This is a restricted access link available only for the client.
            </p>
            <DownloadButton
              label="Download All Files"
              driveLink={project.driveLinks.allFiles}
              icon="folder"
              variant="restricted"
            />
          </div>
        </div>
      )}

      <SuggestionSection currentProjectSlug={slug} currentCategory={project.category} />

      {lightboxOpen && albumImages.length > 0 && (
        <div
          className="fixed inset-0 bg-[#0B1120]/90 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="fixed top-4 right-4 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="fixed left-4 top-1/2 -translate-y-1/2 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={albumImages[currentImageIndex]?.src}
              alt={albumImages[currentImageIndex]?.alt}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="fixed right-4 top-1/2 -translate-y-1/2 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-textPrimary text-sm">
            {currentImageIndex + 1} / {albumImages.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkDetail
