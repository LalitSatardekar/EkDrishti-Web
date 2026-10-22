import { accessButtons, accessElementId } from './clientAccess.js'
import { mediaAssets } from './media.js'

export const TYPOGRAPHY_ROLES = [
  { id: 'projectTitle', label: 'Project title', sample: 'Samruddhi & Kundan', group: 'Display' },
  { id: 'heroTitle', label: 'Hero heading', sample: 'A story worth remembering', group: 'Display' },
  { id: 'sectionIdentifier', label: 'Section identifier', sample: 'OUR STORY', group: 'Labels' },
  { id: 'sectionHeading', label: 'Section heading', sample: 'They Pick Each Other, Always & Forever', group: 'Headings' },
  { id: 'ctaHeading', label: 'CTA heading', sample: 'Ready to Capture Your Moments?', group: 'Headings' },
  { id: 'subheading', label: 'Subheading', sample: 'A celebration with family', group: 'Headings' },
  { id: 'body', label: 'Body text', sample: 'A few words about what made this day special.', group: 'Content' },
  { id: 'richText', label: 'Rich text', sample: 'Stories, paragraphs, and editorial content.', group: 'Content' },
  { id: 'quote', label: 'Quotes & testimonials', sample: '“It felt like reliving the best day of our lives.”', group: 'Content' },
  { id: 'clientName', label: 'Client name', sample: 'Samruddhi & Kundan', group: 'Details' },
  { id: 'clientDesignation', label: 'Client designation', sample: 'Our wonderful clients', group: 'Details' },
  { id: 'metadataLabel', label: 'Metadata labels', sample: 'DATE', group: 'Details' },
  { id: 'metadataValue', label: 'Metadata values', sample: '12 October 2026', group: 'Details' },
  { id: 'statistic', label: 'Statistics & numbers', sample: '250+', group: 'Details' },
  { id: 'statisticLabel', label: 'Statistic labels', sample: 'Memories captured', group: 'Details' },
  { id: 'button', label: 'Buttons & CTA text', sample: 'Get in touch', group: 'Interface' },
  { id: 'navigation', label: 'Case study navigation', sample: 'Back to Work', group: 'Interface' },
  { id: 'caption', label: 'Gallery & video captions', sample: 'The happy couple, surrounded by friends.', group: 'Content' },
  { id: 'credits', label: 'Credits', sample: 'Photography by Ekdrishti Studios', group: 'Details' },
  { id: 'closing', label: 'Footer & closing section', sample: 'Thanks for being part of this day.', group: 'Content' }
]

export const DEFAULT_CASE_TYPOGRAPHY = {
  // This preserves the existing case title appearance for older projects.
  projectTitle: { fontFamily: 'Great Vibes', fontSource: 'google' }
}

export function resolveCaseTypography(project, section, role, elementId) {
  const global = { ...(DEFAULT_CASE_TYPOGRAPHY[role] || {}), ...(project?.typography?.[role] || {}) }
  const local = section?.settings?.typographyOverrides?.[role] || {}

  // Map existing case and section font fields to the new shared roles.
  const legacyGlobal = role === 'sectionHeading' && project?.sectionTitleFont
    ? { fontFamily: project.sectionTitleFont, fontSource: 'google' }
    : {}
  const legacySection = role === 'sectionHeading' && section?.settings?.titleFontSource
    ? {
        fontFamily: section.settings.titleFontFamily,
        fontSource: section.settings.titleFontSource === 'file' || section.settings.titleFontSource === 'paste' ? 'custom' : section.settings.titleFontSource,
        fontUrl: section.settings.titleFontUrl,
        googleUrl: section.settings.titleFontGoogleUrl,
        pastedCss: section.settings.titleFontSource === 'paste' ? section.settings.titleFontCss : undefined
      }
    : {}

  return { ...legacyGlobal, ...global, ...(section?.settings?.typography || {}), ...legacySection, ...local, ...(elementId ? section?.settings?.textOverrides?.[elementId] || {} : {}) }
}

export function typographyElements(section, project = {}) {
  const content = section?.content || {}, type = String(section?.type || '').toLowerCase()
  if (['gallery', 'image section', 'imagesection', 'image', 'album', 'album gallery'].includes(type) && !(content.images?.length || content.image)) return []
  if (['client access', 'downloads'].includes(type) && !accessButtons(section, project).length) return []
  if (['testimonial', 'quote'].includes(type) && !(content.quote || content.text || content.body)) return []
  if (['results', 'stats', 'metrics'].includes(type) && !(content.stats?.length || content.metric1 || content.metric2 || content.metric3 || project.results?.metric1 || project.results?.metric2 || project.results?.metric3)) return []
  if (type === 'video' && !(content.url || project.youtubeUrl || project.video || project.videos?.length)) return []
  const elements = []
  const add = (role, sample, elementId, label) => { if (sample) elements.push({ role, sample: String(sample).replace(/<[^>]+>/g, '').slice(0, 200), elementId, label: label || TYPOGRAPHY_ROLES.find(item => item.id === role)?.label || role }) }
  if (type === 'hero') {
    add('heroTitle', content.heading || 'Hero heading'); add('subheading', content.subtitle || 'Hero subtitle'); add('body', content.description || 'Hero description'); add('button', content.buttonText || 'Hero button')
  } else if (['rich text', 'story', 'text'].includes(type)) {
    if (section.title !== 'Rich Text Section') add('sectionHeading', section.title)
    add('subheading', content.heading); add(content.text ? 'richText' : 'body', content.text || content.body || project.description)
  } else if (['results', 'stats', 'metrics'].includes(type)) {
    if (section.title !== 'Results Section') add('sectionHeading', section.title)
    if (content.stats?.length) content.stats.forEach((stat, index) => { const id = stat.id || `stat-${index}`; add('statistic', stat.value || stat.stat, `${id}-value`, `Statistic ${index + 1} value`); add('statisticLabel', stat.label || stat.title, `${id}-label`, `Statistic ${index + 1} label`); add('body', stat.description, `${id}-description`, `Statistic ${index + 1} description`) })
    else ['metric1', 'metric2', 'metric3'].forEach((id, index) => add('statisticLabel', content[id] || project.results?.[id], id, `Metric ${index + 1}`))
  } else if (type === 'cta') {
    add('ctaHeading', content.heading || 'Ready to Capture Your Moments?'); add('body', content.description || 'Get in touch with our team for custom photography and production services.'); add('button', content.buttonText || 'Contact Us')
  } else if (['testimonial', 'quote'].includes(type)) {
    add('quote', content.quote || content.text || content.body); add('clientName', content.author || content.name || project.client); add('clientDesignation', content.role || content.event || 'Client Review')
  } else {
    add('sectionHeading', section.title || (['album gallery', 'album'].includes(type) ? 'Album Gallery' : ['client access', 'downloads'].includes(type) ? 'Client Access' : ''))
    if (['client access', 'downloads'].includes(type)) {
      add('body', content.description || 'Access photos, videos, albums and other event files using the links below.')
      accessButtons(section, project).forEach((button, index) => {
        add('button', button.label, accessElementId(button.id), 'Button ' + (index+1) + ' label')
        add('caption', button.secondaryText, accessElementId(button.id) + '-secondary', 'Button ' + (index+1) + ' secondary text')
      })
    }
    if (type === 'video' && project.driveLinks?.video) add('button', 'Download Video')
    if (['album gallery', 'album'].includes(type) && project.driveLinks?.albumGallery) add('button', 'Download Album Photos')
  }
  add('caption', content.caption, undefined, 'Section caption')
  if (type !== 'hero' || !['video'].includes(section.settings?.heroMedia?.mode)) mediaAssets(content.images).forEach((image, index) => { if (image.caption) add('caption', image.caption, `media-${image.id}`, `Image ${index + 1} caption`) })
  return elements
}

export function patchTypography(section, role, changes, elementId) {
  const settings = { ...section.settings }
  const key = elementId ? 'textOverrides' : 'typographyOverrides'
  const id = elementId || role
  const styles = { ...settings[key] }, merged = { ...styles[id], ...changes }
  for (const [property, value] of Object.entries(merged)) if (value === '' || value === undefined || value === null) delete merged[property]
  if (Object.keys(merged).length) styles[id] = merged
  else delete styles[id]
  return { ...section, settings: { ...settings, [key]: styles } }
}

export function resetTypography(section, role, elementId) {
  const settings = { ...section.settings }
  if (!role) { delete settings.typography; delete settings.typographyOverrides; delete settings.textOverrides }
  else {
    const key = elementId ? 'textOverrides' : 'typographyOverrides', id = elementId || role
    settings[key] = { ...settings[key] }; delete settings[key][id]
  }
  if (!role || role === 'sectionHeading') for (const key of ['titleFontSource', 'titleFontFamily', 'titleFontUrl', 'titleFontGoogleUrl', 'titleFontCss']) delete settings[key]
  return { ...section, settings }
}
