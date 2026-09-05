import React from 'react'
import { Link } from 'react-router-dom'
import HeroMasonryGrid from '../HeroMasonryGrid'
import AlbumGrid from '../../album/AlbumGrid'
import CachedImage from '../../ui/CachedImage'
import YouTubeEmbed from '../../ui/YouTubeEmbed'
import DownloadButton from '../../ui/DownloadButton'

export const SectionRenderer = ({
  section,
  project,
  index,
  onImageClick,
  heroImages = [],
  heroSettings = {},
  albumImages = [],
  videoRatios = {},
  onVideoLoadedMetadata,
  buildVideoBoxStyle
}) => {
  if (!section || section.enabled === false) return null

  const type = (section.type || '').trim().toLowerCase()
  const content = section.content || {}
  const title = section.title || ''

  switch (type) {
    case 'hero':
      const effectiveHero = heroImages.length > 0 ? heroImages : (project.hero && project.hero.length > 0 ? project.hero : (project.image ? [project.image] : []))
      return (
        <div key={`section-hero-${index}`} className="mb-14">
          {effectiveHero.length > 0 ? (
            <HeroMasonryGrid
              images={effectiveHero}
              heroSettings={heroSettings || project.heroSettings || {}}
              onImageClick={(idx) => onImageClick && onImageClick('hero', idx)}
              title={project.title}
            />
          ) : null}
        </div>
      )

    case 'rich text':
    case 'story':
    case 'text':
      return (
        <div key={`section-text-${index}`} className="max-w-4xl mx-auto my-16 px-4">
          {title && title !== 'Rich Text Section' && (
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-6 text-center">
              {title}
            </h2>
          )}
          {content.heading && (
            <h3 className="text-xl md:text-2xl font-bold text-amber-400 mb-4">
              {content.heading}
            </h3>
          )}
          {content.text ? (
            <div
              className="text-textSecondary text-base md:text-lg leading-relaxed space-y-4 font-normal"
              dangerouslySetInnerHTML={{ __html: content.text }}
            />
          ) : content.body ? (
            <p className="text-textSecondary text-base md:text-lg leading-relaxed">
              {content.body}
            </p>
          ) : (
            <p className="text-textSecondary text-base md:text-lg leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      )

    case 'results':
    case 'stats':
    case 'metrics':
      const metric1 = content.metric1 || project.results?.metric1
      const metric2 = content.metric2 || project.results?.metric2
      const metric3 = content.metric3 || project.results?.metric3
      const customStats = Array.isArray(content.stats) ? content.stats : []

      if (!metric1 && !metric2 && !metric3 && customStats.length === 0) return null

      return (
        <div key={`section-results-${index}`} className="max-w-5xl mx-auto my-16 px-4">
          {title && title !== 'Results Section' && (
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-8 text-center">
              {title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customStats.length > 0 ? (
              customStats.map((st, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-surface/50 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg"
                >
                  <p className="text-3xl font-heading font-black text-amber-400 mb-2">{st.value || st.stat}</p>
                  <p className="text-sm font-semibold text-textPrimary mb-1">{st.label || st.title}</p>
                  {st.description && <p className="text-xs text-textSecondary">{st.description}</p>}
                </div>
              ))
            ) : (
              <>
                {metric1 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      01
                    </div>
                    <p className="text-base font-semibold text-textPrimary">{metric1}</p>
                  </div>
                )}
                {metric2 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      02
                    </div>
                    <p className="text-base font-semibold text-textPrimary">{metric2}</p>
                  </div>
                )}
                {metric3 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      03
                    </div>
                    <p className="text-base font-semibold text-textPrimary">{metric3}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )

    case 'gallery':
      const galleryImages = Array.isArray(content.images) ? content.images : []
      if (galleryImages.length === 0) return null

      return (
        <div key={`section-gallery-${index}`} className="max-w-7xl mx-auto my-16 px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl text-center mb-10 text-textSecondary font-medium tracking-wide">
              {title}
            </h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((imgSrc, imgIdx) => (
              <div
                key={imgIdx}
                onClick={() => onImageClick && onImageClick('custom-gallery', imgIdx, galleryImages, title)}
                className="group relative overflow-hidden aspect-[4/3] cursor-pointer bg-surface/30 border border-white/5 hover:border-amber-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]"
              >
                <CachedImage
                  src={imgSrc}
                  alt={`${title} image ${imgIdx + 1}`}
                  aspectRatio="4:3"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'video':
      const videoUrl = content.url || project.youtubeUrl || project.video
      if (!videoUrl && (!project.videos || project.videos.length === 0)) return null

      const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))

      return (
        <div key={`section-video-${index}`} className="max-w-5xl mx-auto my-16 px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl text-center mb-8 text-textSecondary font-medium tracking-wide">
              {title}
            </h2>
          )}

          {isYouTube ? (
            <YouTubeEmbed
              url={videoUrl}
              title={title || `${project.title} - Video`}
              aspectRatio={content.aspectRatio || project.aspectRatio}
            />
          ) : videoUrl ? (
            <div
              className="relative rounded-2xl overflow-hidden bg-surface mb-6 mx-auto shadow-2xl border border-white/5"
              style={buildVideoBoxStyle ? buildVideoBoxStyle(content.aspectRatio || '16 / 9') : { width: '100%', maxWidth: '760px' }}
            >
              <video
                controls
                poster={content.poster || project.videoPoster || project.image}
                className="w-full h-full object-contain"
                preload="metadata"
                onLoadedMetadata={onVideoLoadedMetadata}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}

          {project.driveLinks?.video && (
            <div className="flex justify-center mt-6">
              <DownloadButton
                label="Download Video"
                driveLink={project.driveLinks.video}
                icon="video"
                variant="primary"
              />
            </div>
          )}
        </div>
      )

    case 'cta':
      const ctaHeading = content.heading || 'Ready to Capture Your Moments?'
      const ctaDescription = content.description || 'Get in touch with our team for custom photography and production services.'
      const ctaButton = content.buttonText || 'Contact Us'
      const ctaLink = content.link || '/contact'

      return (
        <div key={`section-cta-${index}`} className="max-w-5xl mx-auto my-20 px-4 pb-[40px]">
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-surface to-secondary p-8 md:px-14 md:pt-14 md:pb-[40px] pb-[40px] border border-amber-500/20 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-2xl md:text-4xl font-heading font-bold text-white tracking-tight">
                {ctaHeading}
              </h2>
              <p className="text-textSecondary text-base md:text-lg">
                {ctaDescription}
              </p>
              <div className="pt-2">
                <Link
                  to={ctaLink}
                  className="inline-block px-8 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-primary shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-sm uppercase tracking-wider"
                >
                  {ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )

    case 'testimonial':
    case 'quote':
      const quote = content.quote || content.text || content.body
      if (!quote) return null
      const author = content.author || content.name || project.client
      const role = content.role || content.event || 'Client Review'

      return (
        <div key={`section-testimonial-${index}`} className="max-w-4xl mx-auto my-16 px-4">
          <div className="bg-surface/30 border border-white/5 p-8 md:p-12 rounded-3xl text-center relative shadow-xl">
            <div className="text-4xl md:text-5xl text-amber-400/40 mb-4 font-serif">“</div>
            <p className="text-lg md:text-xl text-textPrimary italic leading-relaxed mb-6">
              {quote}
            </p>
            {author && (
              <div>
                <p className="text-base font-bold text-amber-400">{author}</p>
                {role && <p className="text-xs text-textSecondary uppercase tracking-widest mt-0.5">{role}</p>}
              </div>
            )}
          </div>
        </div>
      )

    case 'album gallery':
    case 'album':
      if (albumImages.length === 0 && (!project.album || project.album.length === 0)) return null
      const effectiveAlbum = albumImages.length > 0 ? albumImages : (project.album || []).map((img, i) => ({
        id: `album-${i}`,
        src: img,
        title: project.title || 'Album',
        alt: `${project.title || 'Album'} photo ${i + 1}`
      }))

      return (
        <div key={`section-album-${index}`} className="max-w-7xl mx-auto my-20 px-4">
          <h2 className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
            {title || 'Album Gallery'}
          </h2>

          <AlbumGrid
            images={effectiveAlbum}
            onImageClick={(idx) => onImageClick && onImageClick('album', idx, effectiveAlbum)}
          />

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
      )

    case 'client access':
    case 'downloads':
      if (!project.driveLinks?.allFiles) return null
      return (
        <div key={`section-client-${index}`} className="max-w-5xl mx-auto my-20 px-4">
          <div className="bg-gradient-to-br from-surface to-secondary p-8 rounded-2xl border border-borderSubtle text-center shadow-xl">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-4">
              {title || 'Client Access'}
            </h3>
            <p className="text-textSecondary mb-6 max-w-2xl mx-auto text-sm md:text-base">
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
      )

    default:
      return null
  }
}

export default SectionRenderer
