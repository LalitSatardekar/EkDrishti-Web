import { DEFAULT_CAROUSEL } from '../../lib/media'

const field = 'mt-1 h-8 w-full rounded border border-white/10 bg-[#0B1120] px-2 text-xs text-white'
export default function CarouselInspector({ value, onChange, imageCount }) {
  const config = { ...DEFAULT_CAROUSEL, ...value }
  const patch = changes => onChange(changes)
  const number = (key, label, min, max, step = 1) => <label className="text-[10px] text-textSecondary" key={key}>{label}<input aria-label={label} type="number" min={min} max={max} step={step} value={config[key] ?? ''} onChange={event => patch({ [key]: Number(event.target.value) })} className={field} /></label>
  return <details open className="rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-xs font-semibold text-amber-400">Carousel</summary>
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
      {number('slidesPerViewDesktop', 'Desktop slides visible', 1, Math.max(1, imageCount))}{number('slidesPerViewTablet', 'Tablet slides visible', 1, Math.max(1, imageCount))}{number('slidesPerViewMobile', 'Mobile slides visible', 1, Math.max(1, imageCount))}
      {number('gap', 'Slide gap (px)', 0, 100)}{number('interval', 'Autoplay interval (ms)', 250, 60000, 250)}{number('speed', 'Transition duration (ms)', 0, 5000, 50)}
      {number('slidesPerScroll', 'Slides per navigation', 1, Math.max(1, imageCount))}{number('resumeAfter', 'Resume after interaction (ms; 0 = manual)', 0, 60000, 250)}
      <label className="text-[10px] text-textSecondary">Transition<select aria-label="Carousel transition" value={config.transition} onChange={event => patch({ transition: event.target.value })} className={field}><option value="slide">Slide horizontally</option><option value="vertical">Slide vertically</option><option value="fade">Fade</option><option value="crossfade">Crossfade</option></select></label>
      <label className="text-[10px] text-textSecondary">Easing<select value={config.easing} onChange={event => patch({ easing: event.target.value })} className={field}>{['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].map(option => <option key={option}>{option}</option>)}</select></label>
      <label className="text-[10px] text-textSecondary">Height behavior<select value={config.heightMode} onChange={event => patch({ heightMode: event.target.value })} className={field}><option value="fixed">Fixed / responsive height</option><option value="adaptive">Adaptive to images</option></select></label>
      {config.heightMode !== 'adaptive' && ['Desktop', 'Tablet', 'Mobile'].map(device => <label key={device} className="text-[10px] text-textSecondary">{device} height<input value={config[`height${device}`] || ''} placeholder={device === 'Desktop' ? '650px' : '420px'} onChange={event => patch({ [`height${device}`]: event.target.value })} className={field} /></label>)}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-textSecondary">{Object.entries({ autoplay: 'Autoplay', pauseOnHover: 'Pause on hover', pauseOnInteraction: 'Pause after manual interaction', loop: 'Infinite loop', arrows: 'Previous / next arrows', dots: 'Pagination dots', swipe: 'Touch swipe', keyboard: 'Keyboard when focused', progress: 'Progress indicator' }).map(([key, label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(config[key])} onChange={event => patch({ [key]: event.target.checked })} />{label}</label>)}</div>
    <p className="mt-2 text-[10px] text-textSecondary">Autoplay pauses in inactive tabs and respects reduced motion. Slide counts are capped to available images.</p>
  </details>
}
