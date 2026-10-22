import { useEffect, useRef, useState } from 'react'
import { DEFAULT_CAROUSEL, carouselGap, carouselPage, mediaAssets, responsiveValue } from '../../lib/media'
import MediaImage from './MediaImage'
import TypographyText from '../work/sections/TypographyText'

export default function MediaCarousel({ images, settings = {}, title = 'Image slideshow', className = '', height, objectFit = 'cover', objectPosition = 'center', slidesPerView, aspectRatio, project, section, onImageClick, radius = 0 }) {
  const items = mediaAssets(images)
  const config = { ...DEFAULT_CAROUSEL, ...settings }
  const [page, setPage] = useState({ active: 0, previous: null, direction: 1, serial: 0 })
  const [hovered, setHovered] = useState(false)
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [viewport, setViewport] = useState(() => typeof window === 'undefined' ? 1280 : window.innerWidth)
  const [width, setWidth] = useState(0)
  const [dimensions, setDimensions] = useState({})
  const root = useRef(null), pointer = useRef(null), resumeTimer = useRef(null)
  const requestedCount = slidesPerView ?? { desktop: config.slidesPerViewDesktop, tablet: config.slidesPerViewTablet, mobile: config.slidesPerViewMobile }
  const count = Math.max(1, Math.min(Math.floor(Number(responsiveValue(requestedCount, viewport))) || 1, items.length || 1))
  const last = Math.max(0, items.length - count)
  const active = Math.min(last, page.active)
  const step = Math.max(1, Math.floor(Number(config.slidesPerScroll) || 1))
  const speed = reduced ? 0 : Math.max(0, Number(config.speed) || 0)
  const gap = carouselGap(config.gap, width, count)
  const vertical = ['vertical', 'slideVertical'].includes(config.transition)
  const transition = ['fade', 'crossfade'].includes(config.transition) ? config.transition : vertical ? 'vertical' : 'slide'
  const manualPause = () => {
    if (!config.pauseOnInteraction) return
    setPaused(true); clearTimeout(resumeTimer.current)
    if (Number(config.resumeAfter) > 0) resumeTimer.current = setTimeout(() => setPaused(false), Number(config.resumeAfter))
  }
  const go = (delta, manual = true, absolute = false) => {
    if (manual) manualPause()
    setPage(current => {
      const before = Math.min(last, current.active)
      const next = carouselPage(absolute ? delta : before + delta, items.length, count, config.loop)
      return next === before ? current : { active: next, previous: speed ? before : null, direction: absolute ? (next >= before ? 1 : -1) : Math.sign(delta), serial: current.serial + 1 }
    })
  }
  useEffect(() => {
    const resize = () => { setViewport(window.innerWidth); setWidth(root.current?.clientWidth || 0) }
    const visibility = () => setHidden(document.hidden)
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => setReduced(query.matches)
    resize(); motion()
    const observer = new ResizeObserver(resize)
    if (root.current) observer.observe(root.current)
    window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility); query.addEventListener?.('change', motion)
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); query.removeEventListener?.('change', motion); clearTimeout(resumeTimer.current) }
  }, [items.length === 0])
  const identity = items.map(item => item.id).join('|')
  useEffect(() => { setPage(current => ({ ...current, active: Math.min(last, current.active), previous: null })) }, [identity, count, last])
  useEffect(() => {
    if (page.previous === null) return
    const timer = setTimeout(() => setPage(current => ({ ...current, previous: null })), speed)
    return () => clearTimeout(timer)
  }, [page.serial, speed])
  useEffect(() => {
    if (!config.autoplay || !config.pauseOnInteraction) { clearTimeout(resumeTimer.current); setPaused(false) }
  }, [config.autoplay, config.pauseOnInteraction])
  useEffect(() => {
    if (!config.autoplay || reduced || hidden || paused || (config.pauseOnHover && hovered) || !last || (!config.loop && active === last)) return
    const timer = setTimeout(() => go(step, false), Math.max(250, speed + 50, Number(config.interval) || 5000))
    return () => clearTimeout(timer)
  }, [active, page.serial, count, last, identity, step, config.autoplay, config.interval, config.loop, config.pauseOnHover, hovered, hidden, paused, reduced, speed])
  if (!items.length) return <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-textSecondary">No images selected.</div>
  const fit = responsiveValue(objectFit, viewport), position = responsiveValue(objectPosition, viewport)
  const fixedHeight = responsiveValue(height, viewport) || responsiveValue({ desktop: config.heightDesktop || config.height, tablet: config.heightTablet || config.height, mobile: config.heightMobile || config.height }, viewport) || 'clamp(280px, 50vw, 650px)'
  const visible = items.slice(active, active + count)
  const ratioNumber = value => { const parts = String(value || '').split(/[/:]/).map(Number); return parts.length === 2 && parts.every(v => v > 0) ? parts[0] / parts[1] : null }
  const available = Math.max(1, (width - gap * (count - 1)) / count)
  const adaptive = config.heightMode === 'adaptive'
  const adaptiveHeight = Math.max(1, ...visible.map(item => available / (ratioNumber(aspectRatio) || (dimensions[item.src]?.width / dimensions[item.src]?.height) || item.width / item.height || 1.5)))
  const easing = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(config.easing) ? config.easing : 'ease'
  const group = (start, outgoing) => <div key={`${page.serial}-${outgoing ? 'out' : 'in'}`} aria-hidden={outgoing || undefined} {...(outgoing ? { inert: '' } : {})} className="absolute inset-0 flex" style={{ gap, pointerEvents: outgoing ? 'none' : undefined, animation: page.previous !== null && speed ? `carousel-${transition}-${outgoing ? 'out' : 'in'} ${speed}ms ${easing} both` : undefined, '--carousel-direction': page.direction }}>
    {items.slice(start, start + count).map((item, index) => <div key={item.id} className="relative h-full min-w-0 flex-1 overflow-hidden" style={{ flexBasis: `${available}px` }}>
      <button type="button" aria-label={`Open ${item.alt || `${title} image ${start + index + 1}`}`} tabIndex={outgoing ? -1 : 0} onClick={() => onImageClick?.(start + index)} className="block h-full w-full">
        <MediaImage item={item} alt={`${title} ${start + index + 1}`} fit={fit} position={position} eager onDimensions={(src, w, h) => setDimensions(current => current[src]?.width === w && current[src]?.height === h ? current : { ...current, [src]: { width: w, height: h } })} />
      </button>
      {item.link && !outgoing && <a href={item.link} target="_blank" rel="noreferrer" className="absolute right-2 top-2 rounded bg-black/60 p-2 text-white">↗</a>}
      {item.caption && <TypographyText project={project} section={section} role="caption" elementId={`media-${item.id}`} as="p" className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 text-sm text-white">{item.caption}</TypographyText>}
    </div>)}
  </div>
  return <div ref={root} className={`relative overflow-hidden bg-black ${className}`} style={{ borderRadius: `${Math.max(0, Number(radius) || 0)}px` }} tabIndex={config.keyboard ? 0 : undefined} role="region" aria-roledescription="carousel" aria-label={title} data-active-slide={active} data-visible-slides={count}
    onKeyDown={event => { if (!config.keyboard || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return; if (['ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); go(-step) } if (['ArrowRight', 'ArrowDown'].includes(event.key)) { event.preventDefault(); go(step) } }}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onPointerDown={event => { if (config.swipe && event.pointerType !== 'mouse') pointer.current = { x: event.clientX, y: event.clientY } }}
    onPointerCancel={() => { pointer.current = null }} onPointerUp={event => { if (!pointer.current) return; const delta = vertical ? event.clientY - pointer.current.y : event.clientX - pointer.current.x; pointer.current = null; if (Math.abs(delta) > 45) go(delta < 0 ? step : -step) }}>
    <style>{`@keyframes carousel-slide-in{from{transform:translateX(calc(var(--carousel-direction)*100%))}to{transform:translateX(0)}}@keyframes carousel-slide-out{from{transform:translateX(0)}to{transform:translateX(calc(var(--carousel-direction)*-100%))}}@keyframes carousel-vertical-in{from{transform:translateY(calc(var(--carousel-direction)*100%))}to{transform:translateY(0)}}@keyframes carousel-vertical-out{from{transform:translateY(0)}to{transform:translateY(calc(var(--carousel-direction)*-100%))}}@keyframes carousel-fade-in{from{opacity:0}to{opacity:1}}@keyframes carousel-fade-out{from{opacity:1}to{opacity:0}}@keyframes carousel-crossfade-in{from{opacity:0}to{opacity:1}}@keyframes carousel-crossfade-out{from{opacity:1}to{opacity:0}}`}</style>
    <div className="relative w-full" style={{ height: adaptive ? `${adaptiveHeight}px` : ratioNumber(aspectRatio) ? `${available / ratioNumber(aspectRatio)}px` : fixedHeight, touchAction: vertical ? 'pan-x' : 'pan-y' }}>{page.previous !== null && group(Math.min(last, page.previous), true)}{group(active, false)}</div>
    {config.arrows && last > 0 && <><button type="button" aria-label="Previous slide" disabled={!config.loop && !active} onClick={() => go(-step)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white disabled:opacity-30">←</button><button type="button" aria-label="Next slide" disabled={!config.loop && active === last} onClick={() => go(step)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white disabled:opacity-30">→</button></>}
    {config.dots && last > 0 && <div className="absolute inset-x-4 bottom-3 flex flex-wrap justify-center gap-2">{Array.from({ length: last + 1 }, (_, index) => <button type="button" key={index} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => go(index, true, true)} className={`h-3 rounded-full ${index === active ? 'w-6 bg-amber-400' : 'w-3 bg-white/70'}`} />)}</div>}
    {paused && config.autoplay && <button type="button" onClick={() => { clearTimeout(resumeTimer.current); setPaused(false) }} className="absolute left-3 top-3 rounded bg-black/70 px-3 py-2 text-xs text-white">Resume autoplay</button>}
    {config.progress && last > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-amber-400" style={{ width: `${((active + 1) / (last + 1)) * 100}%` }} /></div>}
  </div>
}
