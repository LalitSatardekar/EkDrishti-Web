import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import AlbumGrid from '../components/album/AlbumGrid'
import SuggestionSection from '../components/work/SuggestionSection'
import DownloadButton from '../components/ui/DownloadButton'
import CachedImage from '../components/ui/CachedImage'
import MediaVideo from '../components/media/MediaVideo'
import HeroMasonryGrid from '../components/work/HeroMasonryGrid'
import SectionRenderer from '../components/work/sections/SectionRenderer'
import { selectDynamicHeroImages } from '../lib/heroSelector'
import { prepareGalleryImages } from '../lib/galleryFilter'
import { trackCaseGalleryOpen, trackCaseView } from '../lib/analytics'
import { allCases as fallbackCases } from '../data/cases'
import { normalizeCase } from '../lib/config'
import { blockId } from '../lib/caseBlocks'
import TypographyText from '../components/work/sections/TypographyText'
import { mediaAsset } from '../lib/media'

// Parse ratios like "16/9", "16:9", or "16 / 9" into numeric + css-ready string
const parseAspectRatio = (value) => {
  if (!value) return null
  if (typeof value === 'number') return { numeric: value, css: `${value} / 1` }
  const normalized = String(value).replace(':', '/').replace(/\s+/g, '')
  const parts = normalized.split('/')
  if (parts.length === 2) {
    const w = parseFloat(parts[0])
    const h = parseFloat(parts[1])
    if (w > 0 && h > 0) {
      return { numeric: w / h, css: `${w} / ${h}` }
    }
  }
  return null
}

// Snap ratios to common buckets when close; otherwise keep the raw css string
const bucketAspectRatio = (numeric, fallbackCss) => {
  if (!numeric) return fallbackCss
  if (numeric < 0.7) return '9 / 16'
  if (numeric < 0.9) return '4 / 5'
  if (numeric < 1.15) return '1 / 1'
  if (numeric < 1.45) return '4 / 3'
  if (numeric < 1.65) return '3 / 2'
  return '16 / 9'
}

// Build a responsive box that keeps the video visible in one view without getting tiny
const buildVideoBoxStyle = (ratioCss) =>
  ratioCss
    ? { aspectRatio: ratioCss, width: '100%', maxWidth: 'min(92vw, 760px)', maxHeight: 'min(75vh, 640px)' }
    : { width: '100%', maxWidth: 'min(92vw, 760px)', maxHeight: 'min(75vh, 640px)' }

const computeEmbedStyle = buildVideoBoxStyle

const WorkDetail = ({ isPreview: isPreviewProp = false, previewCase = null }) => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const isPreview = isPreviewProp || searchParams.get('preview') === '1'
  const previewId = searchParams.get('previewId') || slug

  const [project, setProject] = useState(() => {
    if (previewCase) return normalizeCase(previewCase)
    const found = fallbackCases.find((c) => c.slug === slug || String(c.id) === String(slug))
    return found ? normalizeCase(found) : null
  })
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectError, setProjectError] = useState(null)
  const [videoRatios, setVideoRatios] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPreview || typeof BroadcastChannel === 'undefined') return undefined
    const channel = new BroadcastChannel(`ekdrishti-case-preview-${previewId}`)
    channel.onmessage = event => {
      if (event.data?.type === 'case-preview:update' && event.data.project?.slug) {
        setProject(normalizeCase(event.data.project))
      }
    }
    channel.postMessage({ type: 'case-preview:hello' })
    return () => channel.close()
  }, [isPreview, previewId, project?.slug])

  useEffect(() => {
    if (isPreview) return
    const fetchProject = async () => {
      const localMatch = fallbackCases.find((c) => c.slug === slug || String(c.id) === String(slug))
      try {
        const headers = {}
        const token = localStorage.getItem('token')
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const res = await fetch(`/v1/cases?slug=${slug}`, { headers })
        if (!res.ok) {
          if (localMatch) {
            setProject(normalizeCase(localMatch))
            setProjectError(null)
            return
          }
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        if (data.success && data.data) {
          setProject(normalizeCase(data.data))
        } else if (localMatch) {
          setProject(normalizeCase(localMatch))
        } else {
          throw new Error(data.message || 'Project not found')
        }
      } catch (err) {
        if (localMatch) {
          setProject(normalizeCase(localMatch))
          setProjectError(null)
        } else {
          setProjectError(err.message)
        }
      } finally {
        setProjectLoading(false)
      }
    }

    fetchProject()
  }, [slug, isPreview])

  useEffect(() => {
    if (!project || isPreview) return
    trackCaseView(project)
  }, [project, isPreview])

  // Reset cached ratios when slug changes to avoid index carry-over between cases
  useEffect(() => {
    setVideoRatios({})
  }, [slug])

  // Dynamic hero selection supporting 1 to 20 images of any orientation (synchronous, no flash)
  const heroSelection = useMemo(() => {
    if (!project) return null

    try {
      return selectDynamicHeroImages(project, { min: 1, max: 20 })
    } catch (error) {
      console.error('Error selecting hero images:', error)
      const heroSource = (project?.hero && project.hero.length > 0)
        ? project.hero
        : ((project?.album && project.album.length > 0) ? project.album : [project?.image])
      const fallbackImages = Array.from(new Set(heroSource.filter(Boolean))).slice(0, 20)
      return {
        images: fallbackImages,
        allSelected: fallbackImages,
        totalAvailable: fallbackImages.length
      }
    }
  }, [project])

  const heroImages = heroSelection?.images || []

  // Deduplicated gallery images (excluding images already shown in hero)
  const albumImages = heroSelection
    ? prepareGalleryImages(
        project?.album || [],
        heroSelection.allSelected,
        project
      )
    : []

  // Unified list for Lightbox navigation across all sections (Hero, Custom Galleries, Album)
  const allLightboxImages = useMemo(() => {
    const list = []
    const seen = new Set()

    const addImg = (src, title, alt, id) => {
      if (!src || seen.has(src)) return
      seen.add(src)
      list.push({
        id: id || `img-${list.length}`,
        src,
        title: title || project?.title || 'Photo',
        alt: alt || `${title || 'Photo'} ${list.length + 1}`
      })
    }

    // 1. Hero images
    heroImages.forEach((item, idx) => {
      addImg(mediaAsset(item, idx).src, project?.title, `${project?.title ?? 'Hero'} photo ${idx + 1}`, `hero-${idx}`)
    })

    // 2. Custom Gallery sections
    if (Array.isArray(project?.sections)) {
      project.sections.forEach((sec, sIdx) => {
        if (sec && sec.enabled !== false && ['hero', 'gallery', 'image section', 'imagesection', 'image', 'album gallery', 'album'].includes(String(sec.type || '').toLowerCase()) && Array.isArray(sec.content?.images)) {
          sec.content.images.forEach((img, iIdx) => {
            const asset = mediaAsset(img, iIdx)
            addImg(asset.src, sec.title || project?.title, asset.alt || `${sec.title || 'Gallery'} photo ${iIdx + 1}`, asset.id || `sec-${sIdx}-${iIdx}`)
          })
        }
      })
    }

    // 3. Album images
    albumImages.forEach((item, idx) => {
      if (item && item.src) {
        addImg(item.src, item.title, item.alt, item.id || `album-${idx}`)
      }
    })

    return list
  }, [heroImages, project?.sections, project?.title, albumImages])

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    if (!isPreview) {
      trackCaseGalleryOpen(project, index)
    }
  }

  const handleSectionImageClick = (sourceType, idx, imageList = [], title = '') => {
    let targetSrc = ''
    if (sourceType === 'hero') {
      targetSrc = mediaAsset(heroImages[idx], idx).src
    } else if (sourceType === 'album') {
      targetSrc = (albumImages[idx] && albumImages[idx].src) || project?.album?.[idx]
    } else if (sourceType === 'custom-gallery') {
      targetSrc = mediaAsset(imageList[idx], idx).src
    }

    const foundIdx = allLightboxImages.findIndex(img => img.src === targetSrc)
    if (foundIdx !== -1) {
      openLightbox(foundIdx)
    } else {
      openLightbox(0)
    }
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allLightboxImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === allLightboxImages.length - 1 ? 0 : prev + 1))
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

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4 animate-gradient-x"></div>
          <p className="text-textSecondary text-xs">Loading case study details...</p>
        </div>
      </div>
    )
  }

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

  // Determine enabled configured sections
  const customSections = Array.isArray(project.sections)
    ? project.sections.filter(s => s && s.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const hasCustomSections = customSections.length > 0

  return (
    <div className="min-h-screen bg-primary py-20">
      <div className="max-w-5xl mx-auto px-5">
        <TypographyText
          as={Link}
          role="navigation"
          project={project}
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
        </TypographyText>

        <TypographyText role="projectTitle" project={project} as="h1" className="text-4xl md:text-5xl text-center mb-10 text-textPrimary" style={!project.typography?.projectTitle ? { fontFamily: "'Great Vibes', cursive" } : undefined}>
          {project.title}
        </TypographyText>
      </div>

      {/* DYNAMIC SECTION SEQUENCE RENDERING */}
      {hasCustomSections ? (
        <div className="space-y-12">
          {customSections.map((sec, idx) => (
            <SectionRenderer
              key={blockId(sec)}
              section={sec}
              project={project}
              index={idx}
              onImageClick={handleSectionImageClick}
              heroImages={heroImages}
              heroSettings={project.heroSettings || {}}
              albumImages={albumImages}
              videoRatios={videoRatios}
              buildVideoBoxStyle={buildVideoBoxStyle}
            />
          ))}
        </div>
      ) : (
        /* STANDARD DEFAULT LAYOUT SEQUENCE */
        <div className="space-y-12">
          {/* 1. Hero Grid */}
          <div className="max-w-5xl mx-auto px-5">
            {loading ? (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="w-full aspect-[3/4] bg-surface/50 rounded-xl animate-pulse break-inside-avoid mb-4"
                  />
                ))}
              </div>
            ) : heroImages.length > 0 ? (
              <div className="mb-10">
                <HeroMasonryGrid
                  images={heroImages}
                  heroSettings={project.heroSettings || {}}
                  onImageClick={(idx) => handleSectionImageClick('hero', idx)}
                  title={project.title}
                />
              </div>
            ) : project.image ? (
              <div className="mb-10 max-w-4xl mx-auto overflow-hidden shadow-2xl">
                <CachedImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto block mx-auto"
                />
              </div>
            ) : null}
          </div>

          {/* 2. Video Player */}
          {project.hasVideo && (project.youtubeUrl || project.video || (project.videos && project.videos.length > 0)) && (
            <div className="max-w-5xl mx-auto px-5 mt-16">
              <TypographyText as="h2" role="sectionHeading" project={project} className="text-3xl md:text-4xl text-center mb-8 text-textSecondary font-medium tracking-wide">
                Video
              </TypographyText>
              
              {project.youtubeUrl ? (
                <MediaVideo
                  source={project.youtubeUrl}
                  title={`${project.title} - Video`}
                  aspectRatio={project.aspectRatio}
                />
              ) : project.videos && project.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto place-items-center">
                  {project.videos.map((item, idx) => {
                    const src = typeof item === 'string' ? item : item.src
                    if (!src) return null
                    const poster = typeof item === 'string' ? (project.videoPoster || project.image) : (item.poster || project.videoPoster || project.image)
                    const explicitItem = parseAspectRatio(typeof item === 'object' ? item.aspectRatio : null)
                    const projectDefault = parseAspectRatio(project.aspectRatio)
                    const chosen = explicitItem || projectDefault
                    const ratio = chosen ? bucketAspectRatio(chosen.numeric, chosen.css) : undefined

                    return (
                      <MediaVideo key={typeof item === 'object' ? item.id || src : src} source={src} title={`${project.title} video ${idx + 1}`} aspectRatio={ratio} poster={poster} />
                    )
                  })}
                </div>
              ) : (
                <MediaVideo source={project.video} title={`${project.title} - Video`} aspectRatio={project.aspectRatio} poster={project.videoPoster || project.image} />
              )}
              {project.driveLinks?.video && (
                <div className="flex justify-center mt-6">
                  <DownloadButton
                    label="Download Video"
                    driveLink={project.driveLinks.video}
                    typographyProject={project}
                    icon="video"
                    variant="primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. Album Gallery */}
          {albumImages.length > 0 && (
            <div className="max-w-7xl mx-auto px-5 mt-20">
              <TypographyText as="h2" role="sectionHeading" project={project} className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
                Album Gallery
              </TypographyText>

              <AlbumGrid
                images={albumImages}
                onImageClick={(idx) => handleSectionImageClick('album', idx)}
              />

              {project.driveLinks?.albumGallery && (
                <div className="flex justify-center mt-12">
                  <DownloadButton
                    label="Download Album Photos"
                    driveLink={project.driveLinks.albumGallery}
                    typographyProject={project}
                    icon="download"
                    variant="primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. Client Access / Downloads */}
          {project.driveLinks?.allFiles && (
            <div className="max-w-5xl mx-auto px-5 mt-20">
              <div className="bg-gradient-to-br from-surface to-secondary p-8 rounded-2xl border border-borderSubtle text-center">
                <TypographyText as="h3" role="sectionHeading" project={project} className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-4">
                  Client Access
                </TypographyText>
                <TypographyText as="p" role="body" project={project} className="text-textSecondary mb-6 max-w-2xl mx-auto">
                  Access photos, videos, albums and other event files using the links below.
                </TypographyText>
                <DownloadButton
                  label="Download All Files"
                  driveLink={project.driveLinks.allFiles}
                  typographyProject={project}
                  icon="folder"
                  variant="restricted"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestion / Recommendation Section */}
      <SuggestionSection currentProjectSlug={slug} currentCategory={project.category} />

      {/* Lightbox Modal */}
      {lightboxOpen && allLightboxImages.length > 0 && (
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
              src={allLightboxImages[currentImageIndex]?.src}
              alt={allLightboxImages[currentImageIndex]?.alt}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain mx-auto"
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

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-textPrimary text-sm font-mono bg-black/60 px-3 py-1 rounded-full border border-white/10">
            {currentImageIndex + 1} / {allLightboxImages.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkDetail
