import { memo, useEffect, useId, useState } from 'react'
import { DEFAULT_DESIGN_EMBED, parseDesignEmbed } from '../../lib/designEmbed'

const containers = { content: 960, wide: 1400, custom: null }
const ratios = { '16:9': '16 / 9', '4:3': '4 / 3', '1:1': '1 / 1' }

function DesignEmbedRenderer({ url, settings = {}, title = 'Embedded design', className = '' }) {
  const config = { ...DEFAULT_DESIGN_EMBED, ...settings }
  const parsed = parseDesignEmbed(url)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const rawId = useId()
  const cssId = `design-embed-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const maxWidth = config.containerWidth === 'fullBleed' ? 'none' : `${containers[config.containerWidth] || Number(config.customWidth) || 1400}px`
  const margin = config.alignment === 'left' ? '0 auto 0 0' : config.alignment === 'right' ? '0 0 0 auto' : '0 auto'
  const aspectRatio = config.aspectRatio === 'custom' ? config.customAspectRatio : ratios[config.aspectRatio]
  const providerName = parsed.provider === 'figma' ? 'Figma' : 'Canva'

  useEffect(() => { setLoaded(false); setFailed(false) }, [parsed.embedUrl])

  if (!url) return null
  if (parsed.error) return <div className={`mx-auto my-8 max-w-3xl rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center ${className}`}><p className="font-semibold text-amber-300">Unable to load design</p><p className="mt-1 text-sm text-textSecondary">{parsed.error}</p></div>

  return <div id={cssId} className={className} style={{ maxWidth, margin, paddingLeft: config.containerWidth === 'fullBleed' ? 0 : config.sidePadding, paddingRight: config.containerWidth === 'fullBleed' ? 0 : config.sidePadding, paddingTop: config.paddingTop, paddingBottom: config.paddingBottom }}>
    <style>{`#${cssId} .design-embed-frame{height:${Number(config.heightDesktop) || 800}px}@media(max-width:1023px){#${cssId} .design-embed-frame{height:${Number(config.heightTablet) || 700}px}}@media(max-width:767px){#${cssId} .design-embed-frame{height:${Number(config.heightMobile) || 500}px}}`}</style>
    <div className="design-embed-frame relative w-full overflow-hidden border border-white/10 shadow-xl" style={{ borderRadius: `${Number(config.borderRadius) || 0}px`, background: config.background === 'dark' ? '#0B1120' : config.background === 'light' ? '#fff' : 'transparent', ...(aspectRatio ? { aspectRatio, height: 'auto' } : {}) }}>
      {!loaded && !failed && <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-white/[0.04] text-sm text-textSecondary">Loading {providerName} design…</div>}
      {failed ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0B1120] p-5 text-center"><strong className="text-white">Unable to load design</strong><span className="text-sm text-textSecondary">Check that this {providerName} design is publicly accessible.</span><a href={parsed.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-amber-400 hover:text-amber-300">Open original design</a></div> : <iframe key={parsed.embedUrl} src={parsed.embedUrl} title={title} loading="lazy" allowFullScreen allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </div>
  </div>
}

export default memo(DesignEmbedRenderer, (previous, next) => previous.url === next.url && previous.settings === next.settings && previous.title === next.title && previous.className === next.className)
