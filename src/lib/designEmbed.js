export const DEFAULT_DESIGN_EMBED = Object.freeze({
  containerWidth: 'wide',
  customWidth: 1400,
  heightDesktop: 800,
  heightTablet: 700,
  heightMobile: 500,
  aspectRatio: 'auto',
  customAspectRatio: '16 / 9',
  alignment: 'center',
  borderRadius: 0,
  background: 'transparent',
  paddingTop: 0,
  paddingBottom: 0,
  sidePadding: 20
})

const invalid = (sourceUrl, error) => ({ provider: 'unknown', sourceUrl, embedUrl: '', error })

export function parseDesignEmbed(input) {
  const sourceUrl = String(input || '').trim()
  if (!sourceUrl) return invalid('', '')
  if (/<\/?iframe\b/i.test(sourceUrl)) return invalid(sourceUrl, 'Paste only the Figma or Canva URL, not iframe HTML.')

  let url
  try { url = new URL(sourceUrl) } catch { return invalid(sourceUrl, 'Enter a complete Figma or Canva URL.') }
  if (url.protocol !== 'https:') return invalid(sourceUrl, 'Design embeds must use a secure HTTPS URL.')
  const host = url.hostname.toLowerCase()

  if (host === 'www.figma.com' && url.pathname === '/embed' && url.searchParams.get('url')) {
    return parseDesignEmbed(url.searchParams.get('url'))
  }
  if (['figma.com', 'www.figma.com', 'embed.figma.com'].includes(host)) {
    const match = url.pathname.match(/^\/(design|proto|board|slides|deck|file)\/([a-zA-Z0-9]{10,128})(?:\/.*)?$/)
    if (!match) return invalid(sourceUrl, 'Use a Figma file, frame, FigJam, Slides, or prototype share URL.')
    const embed = new URL(url.toString())
    embed.hostname = 'embed.figma.com'
    if (!embed.searchParams.has('embed-host')) embed.searchParams.set('embed-host', 'ekdrishti-case-study')
    return { provider: 'figma', sourceUrl, embedUrl: embed.toString(), error: '' }
  }

  if (host === 'canva.com' || host === 'www.canva.com') {
    if (!/^\/design\/[a-zA-Z0-9_-]{6,128}\/(view|watch)\/?$/.test(url.pathname)) {
      return invalid(sourceUrl, 'Use Canva Share → Embed and paste its public view/embed link. Canva editor links cannot be embedded.')
    }
    const embed = new URL(url.toString())
    embed.hostname = 'www.canva.com'
    if (!embed.searchParams.has('embed')) embed.searchParams.set('embed', '')
    return { provider: 'canva', sourceUrl, embedUrl: embed.toString(), error: '' }
  }

  return invalid(sourceUrl, 'Only trusted Figma and Canva design links are supported.')
}
