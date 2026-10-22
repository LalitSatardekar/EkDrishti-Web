import { useEffect, useRef, useState } from 'react'
import SectionRenderer from '../work/sections/SectionRenderer'
import { arrangementOrder, balanceGridImages, restoreArrangement, shuffleGridImages } from '../../lib/heroSelector'
import { analyzeImage } from '../../lib/imageAnalyzer'
import { heroMode, imageLayout, mediaAsset } from '../../lib/media'

const button = 'rounded border border-white/20 px-3 py-2 text-xs text-white disabled:opacity-40'
const field = 'mt-1 w-full rounded border border-white/20 bg-[#0B1120] p-2 text-xs text-white'
export default function HeroArrangementPreview({ section, project, onUpdate, history }) {
  const images = section.content?.images || []
  const [enabled, setEnabled] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [, refresh] = useState(0)
  const root = useRef(null)
  const latest = useRef(section)
  latest.current = section
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const entry = history[section.id] ||= { baseline: arrangementOrder(images), undo: [] }
  const selectedIndex = images.findIndex((item,i) => mediaAsset(item,i).id === selectedId)
  const selected = selectedIndex < 0 ? null : mediaAsset(images[selectedIndex], selectedIndex)
  const reorder = change => {
    const previous = latest.current.content?.images || []
    const next = typeof change === 'function' ? change(previous) : restoreArrangement(previous, arrangementOrder(change))
    if (JSON.stringify(arrangementOrder(previous)) === JSON.stringify(arrangementOrder(next))) return
    const order = arrangementOrder(next)
    entry.undo.push(arrangementOrder(previous)); if (entry.undo.length > 50) entry.undo.shift()
    onUpdate(current => heroMode(current) !== 'static' ? current : ({ ...current, content: { ...current.content, images: restoreArrangement(current.content?.images || [], order) } }))
  }
  const undo = () => { const order = entry.undo.pop(); if (order) onUpdate(current => ({ ...current, content: { ...current.content, images: restoreArrangement(current.content?.images || [], order) } })); refresh(value=>value+1) }
  const balance = async () => {
    setBusy(true); setMessage('Analyzing image proportions...')
    const layout = imageLayout(section), width = root.current?.querySelector('[data-image-layout]')?.clientWidth || root.current?.clientWidth || 1200
    const viewport = window.innerWidth
    layout.columnsDesktop = viewport < 768 ? layout.columnsMobile : viewport < 1024 ? layout.columnsTablet : layout.columnsDesktop
    const analyses = await Promise.all(images.map(async item => { const asset=mediaAsset(item); return [asset.src, asset.width && asset.height ? { ratio: asset.width/asset.height } : await analyzeImage(asset.src, { forceLoad: true })] }))
    if (!mounted.current) return
    reorder(current => balanceGridImages(current, Object.fromEntries(analyses), { ...layout, width: Math.max(1,width-Number(layout.sidePadding)*2) }))
    setBusy(false); setMessage('Balanced for the current layout. Already balanced images may keep their order.')
  }
  const placement = patch => onUpdate(current => ({ ...current, content: { ...current.content, images: (current.content?.images || []).map((item,i) => mediaAsset(item,i).id === selectedId ? { ...mediaAsset(item,i), ...patch } : item) } }))
  return <div ref={root} data-hero-arrangement={section.id}>
    <div className="my-3 flex flex-wrap gap-2" role="group" aria-label="Static hero arrangement">
      <button type="button" className={button} aria-pressed={enabled} onClick={()=>setEnabled(!enabled)}>Arrange Images</button>
      <button type="button" className={button} disabled={images.length<2 || busy} onClick={balance}>{busy ? 'Balancing...' : 'Smart Balance'}</button>
      <button type="button" className={button} disabled={images.length<2 || busy} onClick={()=>reorder(shuffleGridImages)}>Shuffle</button>
      <button type="button" className={button} disabled={images.length<2 || busy} onClick={()=>reorder(current=>restoreArrangement(current,entry.baseline))}>Reset Arrangement</button>
      <button type="button" className={button} disabled={!entry.undo.length || busy} onClick={undo}>Undo Last Arrangement</button>
    </div>
    <p className="mb-3 text-xs text-textSecondary">Reset uses the order when this editing session opened. Added images stay at the end; removed images stay removed. Drag onto a photo to place it at that position, or use its move buttons.</p>
    <p role="status" className="mb-2 text-xs text-amber-300">{message}</p>
    {selected && <div className="mb-3 rounded border border-amber-400/40 p-3" aria-label="Selected image placement">
      <p className="mb-2 text-xs text-white">Image {selectedIndex+1}: {selected.alt || 'Individual placement'}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-xs text-textSecondary">Selected image fit<select aria-label="Selected image fit" className={field} value={selected.objectFit || ''} onChange={event=>placement({objectFit:event.target.value})}><option value="">Inherit</option><option value="cover">Cover</option><option value="contain">Contain</option></select></label>
        {['X','Y'].map(axis=><label key={axis} className="text-xs text-textSecondary">{axis==='X'?'Horizontal':'Vertical'} focal point<input aria-label={'Selected focal '+axis} className={field} type="number" min="0" max="100" value={selected['focal'+axis]} onChange={event=>placement({['focal'+axis]:Math.max(0,Math.min(100,Number(event.target.value))),objectPosition:''})} /></label>)}
          <label className="text-xs text-textSecondary">Aspect ratio<select aria-label="Selected aspect ratio" className={field} value={selected.placement?.aspectRatio || ''} onChange={event=>placement({placement:{...selected.placement,aspectRatio:event.target.value}})}><option value="">Inherit / natural</option>{['1 / 1','4 / 3','3 / 2','16 / 9','3 / 4','9 / 16'].map(value=><option key={value}>{value}</option>)}</select></label>
        {! ['justified','horizontalMasonry'].includes(imageLayout(section).mode) && <label className="text-xs text-textSecondary">Height (px)<input aria-label="Selected image height" className={field} type="number" min="0" max="3000" placeholder="Natural" value={selected.placement?.height || ''} onChange={event=>placement({placement:{...selected.placement,height:Math.min(3000,Math.max(0,Number(event.target.value)))}})} /></label>}
      </div>
      <button type="button" className={button+' mt-3'} onClick={()=>placement({objectFit:'',objectPosition:'',focalX:50,focalY:50,placement:undefined})}>Reset Individual Placement</button>
    </div>}
    <SectionRenderer section={section} project={project} arrangement={{ enabled, selectedIndex, onSelect:index=>setSelectedId(mediaAsset(images[index],index).id), onReorder:reorder }} />
  </div>
}
