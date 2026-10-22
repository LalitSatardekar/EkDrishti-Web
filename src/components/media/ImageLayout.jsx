import { useEffect, useId, useRef, useState } from 'react'
import MediaCarousel from './MediaCarousel'
import MediaImage from './MediaImage'
import TypographyText from '../work/sections/TypographyText'
import { imageLayout, justifiedRows, mediaAssets, responsiveValue } from '../../lib/media'

const ratios = { '1:1': '1 / 1', '4:3': '4 / 3', '3:2': '3 / 2', '16:9': '16 / 9', '9:16': '9 / 16', portrait: '3 / 4' }

export default function ImageLayout({ section, images, project, title = 'Image section', onImageClick, arrangement }) {
  const items = mediaAssets(images)
  const layout = imageLayout(section)
  const rawId = useId().replace(/[^a-z0-9_-]/gi, '')
  const className = `image-layout-${rawId}`
  const root = useRef(null)
  const [width, setWidth] = useState(0)
  const [dimensions, setDimensions] = useState({})
  const [dragged, setDragged] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [viewport, setViewport] = useState(() => typeof window === 'undefined' ? 1280 : window.innerWidth)
  useEffect(() => {
    const resize = () => { setWidth(root.current?.clientWidth || 0); setViewport(window.innerWidth) }
    resize()
    const observer = new ResizeObserver(resize)
    if (root.current) observer.observe(root.current)
    window.addEventListener('resize', resize)
    return () => { observer.disconnect(); window.removeEventListener('resize', resize) }
  }, [])
  const loaded = (src, w, h) => setDimensions(previous => previous[src]?.width === w && previous[src]?.height === h ? previous : { ...previous, [src]: { width: w, height: h } })
  const cols = device => Math.max(1, Math.min(12, Number(layout[`columns${device}`]) || 1))
  const maxWidth = layout.containerWidth === 'content' ? 960 : layout.containerWidth === 'wide' ? 1400 : layout.containerWidth === 'fullBleed' ? 'none' : layout.maxWidth
  const container = { maxWidth: maxWidth === 'none' ? undefined : `${Number(maxWidth) || 1400}px`, padding: `${layout.paddingTop}px ${layout.sidePadding}px ${layout.paddingBottom}px`, marginLeft: layout.align === 'left' ? 0 : 'auto', marginRight: layout.align === 'right' ? 0 : 'auto' }
  const aspectRatio = layout.uniformRatio === false ? undefined : ratios[layout.aspectRatio] || (layout.aspectRatio === 'custom' ? layout.customAspectRatio : undefined)
  const fit = responsiveValue({ desktop: layout.objectFit, tablet: layout.objectFitTablet || layout.objectFit, mobile: layout.objectFitMobile || layout.objectFit }, viewport)
  const position = responsiveValue({ desktop: layout.objectPosition, tablet: layout.objectPositionTablet || layout.objectPosition, mobile: layout.objectPositionMobile || layout.objectPosition }, viewport)
  const move = (from, to) => {
    if (from === null || from === to || to < 0 || to >= images.length) return
    const next = [...images]; next.splice(to, 0, ...next.splice(from, 1)); arrangement?.onReorder(next)
  }
  const editing = arrangement?.enabled
  const image = (item, index, boxStyle = {}, natural = false) => <div key={item.id} data-arrangement-card={editing ? index : undefined}
    draggable={!!editing}
    onDragStart={event => { if (!editing) return; event.stopPropagation(); setDragged(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)) }}
    onDragOver={event => { if (!editing || dragged === null) return; event.preventDefault(); event.stopPropagation(); setDropIndex(index) }}
    onDrop={event => { if (!editing) return; event.preventDefault(); event.stopPropagation(); move(dragged, index); setDragged(null); setDropIndex(null) }}
    onDragEnd={() => { setDragged(null); setDropIndex(null) }}
    className="relative min-w-0 overflow-hidden bg-surface/30" style={{ borderRadius: `${layout.radius}px`, ...boxStyle, ...(item.placement?.height && !['justified', 'horizontalMasonry'].includes(layout.mode) ? { height: `${item.placement.height}px` } : {}), outline: editing && (dropIndex === index || arrangement.selectedIndex === index) ? '3px solid #fbbf24' : undefined, outlineOffset: -3, opacity: editing && dragged === index ? .5 : 1 }}>
    <button type="button" aria-label={`${editing ? 'Select' : 'Open'} ${item.alt || `${title} photo ${index + 1}`}`} aria-pressed={editing ? arrangement.selectedIndex === index : undefined} onClick={() => editing ? arrangement.onSelect(index) : onImageClick?.(index)} className="block h-full w-full text-left" style={{ aspectRatio: item.placement?.aspectRatio || (natural ? undefined : aspectRatio) }}>
      <MediaImage item={item} alt={`${title} ${index + 1}`} fit={fit} position={position} natural={natural && !item.placement?.aspectRatio && !item.placement?.height} onDimensions={loaded} />
    </button>
    {editing && <div className="absolute left-1 top-1 flex gap-1 rounded bg-black/80 p-1 text-xs text-white">
      <span>{index + 1}</span><button type="button" aria-label={`Move preview image ${index + 1} earlier`} disabled={index === 0} onClick={() => move(index, index - 1)}>←</button><button type="button" aria-label={`Move preview image ${index + 1} later`} disabled={index === images.length - 1} onClick={() => move(index, index + 1)}>→</button>
    </div>}
    {editing && dropIndex === index && dragged !== index && <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-amber-400 p-2 text-center text-xs text-black">Drop at position {index + 1}</span>}
    {item.link && <a href={item.link} target="_blank" rel="noreferrer" aria-label={`Open image link ${index + 1}`} className="absolute right-2 top-2 rounded bg-black/70 p-2 text-xs text-white">↗</a>}
    {item.caption && <TypographyText project={project} section={section} role="caption" elementId={`media-${item.id}`} as="p" className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-left text-xs text-white">{item.caption}</TypographyText>}
  </div>
  let content
  if (!items.length) content = null
  else if (layout.mode === 'carousel') content = <MediaCarousel images={items} settings={section.settings?.carousel} title={title} project={project} section={section} objectFit={fit} objectPosition={position} onImageClick={onImageClick} aspectRatio={aspectRatio} radius={layout.radius} />
  else if (layout.mode === 'justified' || layout.mode === 'horizontalMasonry') {
    const available = Math.max(1, width - Number(layout.sidePadding) * 2)
    const rows = justifiedRows(items.map(item => {
      const configured = item.placement?.aspectRatio?.split(/[/:]/).map(Number)
      return { ...item, ...dimensions[item.src], ...(configured?.length === 2 ? { ratio: configured[0] / configured[1] } : {}) }
    }), available, layout)
    content = <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gapY}px` }}>
      {rows.map((row, index) => <div key={index} data-justified-row className="flex" style={{ gap: `${layout.gapX}px`, justifyContent: row.final && layout.lastRow === 'center' ? 'center' : 'flex-start' }}>
        {row.items.map((item, i) => image(item, item.index, { width: `${row.widths[i]}px`, height: `${row.height}px`, flexShrink: 0 }))}
      </div>)}
    </div>
  } else if (layout.mode === 'masonry' || layout.mode === 'verticalMasonry') content = <div className={`${className} masonry`} style={{ columnGap: `${layout.gapX}px` }}>{items.map((item, index) => <div key={item.id} style={{ breakInside: 'avoid', marginBottom: `${layout.gapY}px` }}>{image(item, index, {}, true)}</div>)}</div>
  else if (layout.mode === 'horizontal') content = <div className="flex snap-x snap-mandatory overflow-x-auto" style={{ gap: `${layout.gapX}px` }}>{items.map((item, index) => <div key={item.id} className="w-[75%] shrink-0 snap-center sm:w-[45%] lg:w-[30%]">{image(item, index, {}, !aspectRatio)}</div>)}</div>
  else if (layout.mode === 'fullWidth') content = <div className="grid" style={{ gap: `${layout.gapY}px` }}>{items.map((item, index) => { const height = responsiveValue(layout.height, viewport); return image(item, index, height ? { height } : {}, !aspectRatio && !height) })}</div>
  else if (layout.mode === 'featured') content = <div className="grid md:grid-cols-2" style={{ gap: `${layout.gapX}px` }}>{items.map((item, index) => image(item, index, index === 0 ? { gridRow: `span ${Math.max(1, items.length - 1)}` } : {}, index > 0 && !aspectRatio))}</div>
  else content = <div className={`grid ${layout.mode === 'split' ? 'md:grid-cols-2' : className}`} style={{ columnGap: `${layout.gapX}px`, rowGap: `${layout.gapY}px` }}>{items.map((item, index) => image(item, index, {}, !aspectRatio))}</div>
  return <div ref={root} style={container} data-image-layout={layout.mode}>
    <style>{`.${className}{grid-template-columns:repeat(${cols('Mobile')},minmax(0,1fr));column-count:${cols('Mobile')}}@media(min-width:768px){.${className}{grid-template-columns:repeat(${cols('Tablet')},minmax(0,1fr));column-count:${cols('Tablet')}}}@media(min-width:1024px){.${className}{grid-template-columns:repeat(${cols('Desktop')},minmax(0,1fr));column-count:${cols('Desktop')}}}`}</style>
    {content}
  </div>
}
