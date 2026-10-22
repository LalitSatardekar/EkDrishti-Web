import ClientAccess from './ClientAccess'
import React from 'react'
import { Link } from 'react-router-dom'
import HeroMasonryGrid from '../HeroMasonryGrid'
import HeroMedia from '../../media/HeroMedia'
import { mediaAssets, sectionImages } from '../../../lib/media'
import AlbumGrid from '../../album/AlbumGrid'
import CachedImage from '../../ui/CachedImage'
import DownloadButton from '../../ui/DownloadButton'
import TypographyText from './TypographyText'
import { blockId, galleryLayout } from '../../../lib/caseBlocks'
import MediaCarousel from '../../media/MediaCarousel'
import ImageLayout from '../../media/ImageLayout'
import MediaVideo from '../../media/MediaVideo'
import DesignEmbedRenderer from '../../media/DesignEmbedRenderer'

export const SectionRenderer = ({
  section,
  project,
  index,
  onImageClick,
  arrangement,
  accessEditor,
  heroImages = [],
  heroSettings = {},
  albumImages = [],
  videoRatios = {},
  onVideoLoadedMetadata,
  buildVideoBoxStyle
}) => {
  if (!section || section.enabled === false) return null

  const type = (section.type || '').trim().toLowerCase()
  const sectionKey = blockId(section)
  const content = section.content || {}
  const title = section.title || ''

  switch (type) {
    case 'hero':
      const ownHeroImages = sectionImages(section, heroImages)
      return <section key={sectionKey} className="mb-14">
        <HeroMedia arrangement={arrangement} section={section} project={project} fallbackImages={heroImages} onImageClick={idx => onImageClick?.('custom-gallery', idx, ownHeroImages, title)} />
        {(content.heading || content.subtitle || content.description || content.buttonText) && <div className="mx-auto mt-6 max-w-5xl space-y-4 px-5 text-center">
          {content.heading && <TypographyText as="h2" role="heroTitle" project={project} section={section} className="text-4xl font-bold text-white">{content.heading}</TypographyText>}
          {content.subtitle && <TypographyText as="h3" role="subheading" project={project} section={section} className="text-xl text-textSecondary">{content.subtitle}</TypographyText>}
          {content.description && <TypographyText as="p" role="body" project={project} section={section} className="text-base text-textSecondary">{content.description}</TypographyText>}
          {content.buttonText && <TypographyText as={Link} to={content.buttonLink || '/contact'} role="button" project={project} section={section} className="inline-block rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-primary">{content.buttonText}</TypographyText>}
        </div>}
        {content.caption && <TypographyText as="p" role="caption" project={project} section={section} className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}
      </section>

    case 'image section':
    case 'imagesection':
    case 'image':
      const unifiedImages = Array.isArray(content.images) ? content.images : (content.image ? [content.image] : [])
      if (!unifiedImages.length) return null
      return <section key={sectionKey} className="my-16">
        {title && <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="mb-8 text-center text-3xl font-medium tracking-wide text-textSecondary md:text-4xl">{title}</TypographyText>}
        <ImageLayout section={section} project={project} images={unifiedImages} title={title || project.title} onImageClick={index => onImageClick?.('custom-gallery', index, unifiedImages, title)} />
        {content.caption && <TypographyText project={project} section={section} role="caption" as="p" className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}
      </section>

    case 'rich text':
    case 'story':
    case 'text':
      return (
        <div key={sectionKey} className="max-w-4xl mx-auto my-16 px-4">
          {title && title !== 'Rich Text Section' && (
            <TypographyText project={project} section={section} role="sectionHeading" className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-6 text-center" as="h2">
              {title}
            </TypographyText>
          )}
          {content.heading && (
            <TypographyText project={project} section={section} role="subheading" as="h3" className="text-xl md:text-2xl font-bold text-amber-400 mb-4">
              {content.heading}
            </TypographyText>
          )}
          {content.text ? (
            <TypographyText project={project} section={section} role="richText" as="div"
              className="text-textSecondary text-base md:text-lg leading-relaxed space-y-4 font-normal"
              dangerouslySetInnerHTML={{ __html: content.text }} />
          ) : content.body ? (
            <p className="text-textSecondary text-base md:text-lg leading-relaxed">
              <TypographyText project={project} section={section} role="body" as="span">{content.body}</TypographyText>
            </p>
          ) : (
            <p className="text-textSecondary text-base md:text-lg leading-relaxed">
              <TypographyText project={project} section={section} role="body" as="span">{project.description}</TypographyText>
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
        <div key={sectionKey} className="max-w-5xl mx-auto my-16 px-4">
          {title && title !== 'Results Section' && (
            <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="text-2xl md:text-3xl font-heading font-bold text-textPrimary mb-8 text-center">
              {title}
            </TypographyText>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customStats.length > 0 ? (
              customStats.map((st, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-surface/50 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg"
                >
                  <TypographyText project={project} section={section} role="statistic" elementId={`${st.id || `stat-${sIdx}`}-value`} as="p" className="text-3xl font-heading font-black text-amber-400 mb-2">{st.value || st.stat}</TypographyText>
                  <TypographyText project={project} section={section} role="statisticLabel" elementId={`${st.id || `stat-${sIdx}`}-label`} as="p" className="text-sm font-semibold text-textPrimary mb-1">{st.label || st.title}</TypographyText>
                  {st.description && <TypographyText project={project} section={section} role="body" elementId={`${st.id || `stat-${sIdx}`}-description`} as="p" className="text-xs text-textSecondary">{st.description}</TypographyText>}
                </div>
              ))
            ) : (
              <>
                {metric1 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      01
                    </div>
                    <TypographyText project={project} section={section} role="statisticLabel" elementId="metric1" as="p" className="text-base font-semibold text-textPrimary">{metric1}</TypographyText>
                  </div>
                )}
                {metric2 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      02
                    </div>
                    <TypographyText project={project} section={section} role="statisticLabel" elementId="metric2" as="p" className="text-base font-semibold text-textPrimary">{metric2}</TypographyText>
                  </div>
                )}
                {metric3 && (
                  <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl text-center hover:border-amber-500/30 transition-all shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      03
                    </div>
                    <TypographyText project={project} section={section} role="statisticLabel" elementId="metric3" as="p" className="text-base font-semibold text-textPrimary">{metric3}</TypographyText>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )

    case 'gallery':
      if (section.settings?.imageLayout || (section.content?.images || []).some(image => typeof image === 'object')) return <section key={sectionKey} className="my-16">
        {title && <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="mb-10 text-center text-3xl font-medium text-textSecondary md:text-4xl">{title}</TypographyText>}
        <ImageLayout section={section} project={project} images={section.content?.images || []} title={title || project.title} onImageClick={idx => onImageClick?.('custom-gallery', idx, section.content?.images || [], title)} />
        {content.caption && <TypographyText project={project} section={section} role="caption" as="p" className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}
      </section>
      const galleryImages = Array.isArray(content.images) ? content.images : []
      const galleryConfig = galleryLayout(section)
      if (galleryImages.length === 0) return null

      return (
        <div key={sectionKey} className="max-w-7xl mx-auto my-16 px-4">
          {title && (
            <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="text-3xl md:text-4xl text-center mb-10 text-textSecondary font-medium tracking-wide">
              {title}
            </TypographyText>
          )}
          <div className={galleryConfig.mode === 'grid'
            ? `grid ${galleryConfig.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : galleryConfig.columns === 4 ? 'grid-cols-2 md:grid-cols-4' : galleryConfig.columns === 5 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`
            : `${galleryConfig.columns === 2 ? 'columns-1 sm:columns-2' : galleryConfig.columns === 4 ? 'columns-1 sm:columns-2 md:columns-4' : galleryConfig.columns === 5 ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-5' : 'columns-1 sm:columns-2 md:columns-3'}`}
            style={galleryConfig.mode === 'grid' ? { gap: `${galleryConfig.gap}px` } : { columnGap: `${galleryConfig.gap}px` }}>
            {galleryImages.map((imgSrc, imgIdx) => (
              <div
                key={imgIdx}
                onClick={() => onImageClick && onImageClick('custom-gallery', imgIdx, galleryImages, title)}
                className="group relative overflow-hidden aspect-[4/3] cursor-pointer bg-surface/30 border border-white/5 hover:border-amber-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] break-inside-avoid"
                style={galleryConfig.mode === 'masonry' ? { marginBottom: `${galleryConfig.gap}px` } : undefined}
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
          {content.caption && <TypographyText project={project} section={section} role="caption" as="p" className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}
        </div>
      )

    case 'video':
      const videoUrl = content.url || project.youtubeUrl || project.video
      if (!videoUrl && (!project.videos || project.videos.length === 0)) return null

      return (
        <div key={sectionKey} className="max-w-5xl mx-auto my-16 px-4">
          {title && (
            <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="text-3xl md:text-4xl text-center mb-8 text-textSecondary font-medium tracking-wide">
              {title}
            </TypographyText>
          )}

          {videoUrl ? <MediaVideo source={videoUrl} title={title || `${project.title} - Video`} aspectRatio={content.aspectRatio || project.aspectRatio} autoplay={section.settings?.autoplay === true} muted={section.settings?.muted === true} loop={section.settings?.loop === true} controls={section.settings?.controls !== false} poster={content.poster || project.videoPoster || project.image} onLoadedMetadata={onVideoLoadedMetadata} className="mb-6 border border-white/5 shadow-2xl" /> : null}

          {content.caption && <TypographyText project={project} section={section} role="caption" as="p" className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}

          {project.driveLinks?.video && (
            <div className="flex justify-center mt-6">
              <DownloadButton
              label="Download Video"
              driveLink={project.driveLinks.video}
              typographyProject={project}
              typographySection={section}
                icon="video"
                variant="primary"
              />
            </div>
          )}
        </div>
      )

    case 'design embed':
    case 'designembed':
      return <section key={sectionKey} className="my-16 overflow-hidden">
        {title && <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="mb-8 text-center text-3xl font-medium tracking-wide text-textSecondary md:text-4xl">{title}</TypographyText>}
        <DesignEmbedRenderer url={content.url} settings={section.settings} title={title || `${project.title} design`} />
      </section>

    case 'cta':
      const ctaHeading = content.heading || 'Ready to Capture Your Moments?'
      const ctaDescription = content.description || 'Get in touch with our team for custom photography and production services.'
      const ctaButton = content.buttonText || 'Contact Us'
      const ctaLink = content.link || '/contact'

      return (
        <div key={sectionKey} className="max-w-5xl mx-auto my-20 px-4 pb-[40px]">
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-surface to-secondary p-8 md:px-14 md:pt-14 md:pb-[40px] pb-[40px] border border-amber-500/20 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <TypographyText project={project} section={section} role="ctaHeading" as="h2" className="text-2xl md:text-4xl font-heading font-bold text-white tracking-tight">
                {ctaHeading}
              </TypographyText>
              <TypographyText project={project} section={section} role="body" as="p" className="text-textSecondary text-base md:text-lg">
                {ctaDescription}
              </TypographyText>
              <div className="pt-2">
                  <TypographyText
                  as={Link}
                  project={project}
                  section={section}
                  role="button"
                  to={ctaLink}
                  className="inline-block px-8 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-primary shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-sm uppercase tracking-wider"
                >
                  {ctaButton}
                </TypographyText>
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
        <div key={sectionKey} className="max-w-4xl mx-auto my-16 px-4">
          <div className="bg-surface/30 border border-white/5 p-8 md:p-12 rounded-3xl text-center relative shadow-xl">
            <div className="text-4xl md:text-5xl text-amber-400/40 mb-4 font-serif">“</div>
                <TypographyText project={project} section={section} role="quote" as="p" className="text-lg md:text-xl text-textPrimary italic leading-relaxed mb-6">
                  {quote}
                </TypographyText>
            {author && (
              <div>
                <TypographyText project={project} section={section} role="clientName" as="p" className="text-base font-bold text-amber-400">{author}</TypographyText>
                {role && <TypographyText project={project} section={section} role="clientDesignation" as="p" className="text-xs text-textSecondary uppercase tracking-widest mt-0.5">{role}</TypographyText>}
              </div>
            )}
          </div>
        </div>
      )

    case 'album gallery':
    case 'album':
      const effectiveAlbum = mediaAssets(sectionImages(section, albumImages.length ? albumImages : project.album || []))
      if (!effectiveAlbum.length) return null

      return (
        <div key={sectionKey} className="max-w-7xl mx-auto my-20 px-4">
          <TypographyText project={project} section={section} role="sectionHeading" as="h2" className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
            {title || 'Album Gallery'}
          </TypographyText>

          {section.settings?.imageLayout || effectiveAlbum.some(item => item.caption || item.link || item.objectFit || item.objectPosition || item.focalX !== 50 || item.focalY !== 50) ? <ImageLayout section={section} project={project} images={effectiveAlbum} title={title || 'Album Gallery'} onImageClick={idx => onImageClick?.('custom-gallery', idx, effectiveAlbum, title)} /> : <AlbumGrid images={effectiveAlbum} layout={galleryLayout(section)} onImageClick={idx => onImageClick?.('custom-gallery', idx, effectiveAlbum, title)} />}
          {content.caption && <TypographyText project={project} section={section} role="caption" as="p" className="mt-4 text-center text-sm text-textSecondary">{content.caption}</TypographyText>}

          {project.driveLinks?.albumGallery && (
            <div className="flex justify-center mt-12">
              <DownloadButton
                label="Download Album Photos"
                driveLink={project.driveLinks.albumGallery}
                typographyProject={project}
                typographySection={section}
                icon="download"
                variant="primary"
              />
            </div>
          )}
        </div>
      )

    case 'client access':
    case 'downloads':
      return <ClientAccess section={section} project={project} editor={accessEditor} />

    default:
      return null
  }
}

export default SectionRenderer
