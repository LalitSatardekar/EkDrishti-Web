import HeroMasonryGrid from '../work/HeroMasonryGrid'
import ImageLayout from './ImageLayout'
import MediaCarousel from './MediaCarousel'
import MediaVideo from './MediaVideo'
import { heroMode, mediaAssets, sectionImages } from '../../lib/media'

export default function HeroMedia({ section, project, fallbackImages = [], onImageClick, arrangement }) {
  const hero = section.settings?.heroMedia || {}
  const mode = heroMode(section)
  const images = sectionImages(section, fallbackImages)
  if (mode === 'video') return <MediaVideo source={hero.videoUrl || section.content?.videoUrl || project.youtubeUrl || project.video} title={`${project.title} hero video`} autoplay={hero.autoplay} muted={hero.muted} loop={hero.loop} controls={hero.controls !== false} aspectRatio={hero.aspectRatio || '16 / 9'} />
  const fit = { desktop: hero.objectFit || 'cover', tablet: hero.objectFitTablet || hero.objectFit || 'cover', mobile: hero.objectFitMobile || hero.objectFit || 'cover' }
  const position = { desktop: hero.objectPosition || 'center', tablet: hero.objectPositionTablet || hero.objectPosition || 'center', mobile: hero.objectPositionMobile || hero.objectPosition || 'center' }
  const height = { desktop: hero.carousel?.heightDesktop || hero.heightDesktop || '720px', tablet: hero.carousel?.heightTablet || hero.heightTablet || '560px', mobile: hero.carousel?.heightMobile || hero.heightMobile || '420px' }
  if (mode === 'carousel') return <MediaCarousel images={images} settings={hero.carousel} project={project} section={section} title={`${project.title} hero`} height={height} objectFit={fit} objectPosition={position} aspectRatio={hero.aspectRatio} onImageClick={onImageClick} />
  if (!images.length) return null
  // Existing saved arrangements keep their appearance until the owner selects a new layout.
  const individualAppearance = mediaAssets(images).some(item => item.placement || item.caption || item.link || item.objectFit || item.objectPosition || item.focalX !== 50 || item.focalY !== 50)
  if (!section.settings?.imageLayout && hero.mode !== 'single' && !individualAppearance) return <HeroMasonryGrid editable={!!arrangement?.enabled} onReorder={arrangement?.onReorder} selectedIndex={arrangement?.selectedIndex} onSelect={arrangement?.onSelect} images={images} heroSettings={section.settings?.legacyHeroSettings || project.heroSettings || {}} title={project.title} onImageClick={onImageClick} />
  const layout = section.settings?.imageLayout || { mode: hero.mode === 'single' ? 'fullWidth' : 'masonry', sidePadding: 0, objectFit: hero.objectFit || 'cover', objectPosition: hero.objectPosition || 'center', objectFitTablet: hero.objectFitTablet, objectFitMobile: hero.objectFitMobile, objectPositionTablet: hero.objectPositionTablet, objectPositionMobile: hero.objectPositionMobile }
  const one = images.length === 1 || hero.mode === 'single'
  return <div>
    <ImageLayout arrangement={arrangement} section={{ ...section, settings: { ...section.settings, imageLayout: { ...layout, ...(one ? { mode: 'fullWidth', height: { desktop: hero.heightDesktop, tablet: hero.heightTablet || hero.heightDesktop, mobile: hero.heightMobile || hero.heightTablet || hero.heightDesktop } } : {}) } } }} images={hero.mode === 'single' ? images.slice(0, 1) : images} project={project} title={`${project.title} hero`} onImageClick={onImageClick} />
  </div>
}
