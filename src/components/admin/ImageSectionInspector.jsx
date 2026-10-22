import CarouselInspector from './CarouselInspector'
const input = 'mt-1 h-8 w-full rounded-md border border-white/10 bg-[#0B1120] px-2 text-xs text-white'
export default function ImageSectionInspector({ layout, carousel, onLayoutChange, onCarouselChange, imageCount = 1, allowCarousel = true }) {
  const patch = changes => onLayoutChange(changes)
  const number = (key, label, min = 0, max = 300) => <label key={key} className="text-[10px] text-textSecondary">{label}<input aria-label={label} type="number" min={min} max={max} value={layout[key] ?? ''} onChange={event => patch({ [key]: Number(event.target.value) })} className={input} /></label>
  const select = (key, label, choices) => <label className="text-[10px] text-textSecondary">{label}<select aria-label={label} value={layout[key] || ''} onChange={event => patch({ [key]: event.target.value })} className={input}>{choices.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>
  return <div className="space-y-3"><details open className="rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-xs font-semibold text-white">Layout & responsive appearance</summary>
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
      {select('mode', 'Image layout', [['grid', 'Normal Grid'], ['masonry', 'Vertical Masonry'], ['justified', 'Horizontal Masonry'], ['fullWidth', 'Full Width'], ...(allowCarousel ? [['carousel', 'Carousel']] : []), ['horizontal', 'Horizontal Scroll'], ['featured', 'Featured + Grid'], ['split', 'Split']])}
      {['grid', 'masonry', 'verticalMasonry'].includes(layout.mode) && ['Desktop', 'Tablet', 'Mobile'].map(device => number(`columns${device}`, `${device} columns`, 1, 12))}
      {number('gapX', 'Horizontal gap (px)', 0, 100)}{number('gapY', 'Vertical gap (px)', 0, 100)}
      {layout.mode === 'justified' && <>{number('targetRowHeight', 'Target row height', 20, 1000)}{number('minRowHeight', 'Minimum row height', 20, 1000)}{number('maxRowHeight', 'Maximum row height', 20, 1200)}{select('lastRow', 'Final row', [['left', 'Natural / left'], ['center', 'Natural / center'], ['justify', 'Justify']])}</>}
      {!['masonry', 'justified'].includes(layout.mode) && select('aspectRatio', 'Image aspect ratio', [['original', 'Original'], ['1:1', '1:1'], ['4:3', '4:3'], ['3:2', '3:2'], ['16:9', '16:9'], ['9:16', '9:16'], ['portrait', 'Portrait'], ['custom', 'Custom']])}
      {layout.aspectRatio === 'custom' && <label className="text-[10px] text-textSecondary">Custom ratio<input value={layout.customAspectRatio || ''} onChange={event => patch({ customAspectRatio: event.target.value })} placeholder="5 / 4" className={input} /></label>}
      {select('objectFit', 'Image fit', [['cover', 'Cover'], ['contain', 'Contain']])}
      {select('objectPosition', 'Image position', [['center', 'Center'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right']])}{number('radius', 'Corner radius', 0, 100)}
    </div>
    <details className="mt-3"><summary className="cursor-pointer text-[10px] text-textSecondary">Container, spacing & device overrides</summary><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
      {select('containerWidth', 'Container width', [['content', 'Content'], ['wide', 'Wide'], ['fullBleed', 'Full Bleed'], ['custom', 'Custom']])}{number('maxWidth', 'Custom width (px)', 100, 3000)}{select('align', 'Container alignment', [['left', 'Left'], ['center', 'Center'], ['right', 'Right']])}
      {number('sidePadding', 'Side padding', 0, 200)}{number('paddingTop', 'Top spacing', 0, 500)}{number('paddingBottom', 'Bottom spacing', 0, 500)}
      {['Tablet', 'Mobile'].map(device => <div key={device}>{select(`objectFit${device}`, `${device} fit`, [['', 'Inherit'], ['cover', 'Cover'], ['contain', 'Contain']])}{select(`objectPosition${device}`, `${device} position`, [['', 'Inherit'], ['center', 'Center'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right']])}</div>)}
    </div></details>
  </details>{allowCarousel && layout.mode === 'carousel' && <CarouselInspector value={carousel} onChange={onCarouselChange} imageCount={imageCount} />}</div>
}
