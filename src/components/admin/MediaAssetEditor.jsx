import { useEffect, useRef, useState } from 'react'
import { createBlockId, deepClone } from '../../lib/caseBlocks'
import { mediaAssets } from '../../lib/media'

const field = 'h-8 min-w-0 rounded border border-white/10 bg-[#0B1120] px-2 text-[11px] text-white outline-none focus:border-amber-500/60'
export default function MediaAssetEditor({ images, onChange, onUploadFile, onPickFromAlbum, title = 'Images' }) {
  const items = mediaAssets(images)
  const [dragged, setDragged] = useState(null), [error, setError] = useState(''), [pending, setPending] = useState([])
  const mounted = useRef(true), pendingUrls = useRef([])
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; pendingUrls.current.forEach(URL.revokeObjectURL) } }, [])
  const change = updater => onChange(current => updater(mediaAssets(current)))
  const update = (id, patch) => change(current => current.map(item => item.id === id ? { ...item, ...patch } : item))
  const move = (id, target) => change(current => { const next = [...current]; const index = next.findIndex(item => item.id === id); if (index < 0 || target < 0 || target >= next.length) return current; const [item] = next.splice(index, 1); next.splice(target, 0, item); return next })
  const upload = async (event, replaceId) => {
    const files = Array.from(event.target.files || []); event.target.value = ''
    if (!files.length || !onUploadFile) return
    setError('')
    const previews = files.map(file => ({ src: URL.createObjectURL(file), name: file.name }))
    pendingUrls.current.push(...previews.map(item => item.src)); setPending(previous => [...previous, ...previews])
    for (const file of files) {
      try {
        const uploaded = await onUploadFile(file)
        change(current => replaceId ? current.map(item => item.id === replaceId ? { ...item, ...uploaded } : item) : [...current, { ...uploaded, id: createBlockId('media'), alt: '' }])
      } catch (failure) { if (mounted.current) setError(previous => `${previous ? `${previous} ` : ''}${file.name}: ${failure.message}`) }
    }
    previews.forEach(item => URL.revokeObjectURL(item.src))
    pendingUrls.current = pendingUrls.current.filter(url => !previews.some(item => item.src === url))
    if (mounted.current) setPending(current => current.filter(item => !previews.includes(item)))
  }
  return <details open className="space-y-3 rounded-xl border border-white/10 p-3">
    <summary className="cursor-pointer text-xs font-semibold text-white">{title} — Selected images: {items.length}</summary>
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {onUploadFile && <label className="cursor-pointer rounded-lg bg-amber-500 px-3 py-2 font-semibold text-primary">+ Add Images<input aria-label="Add images from device" type="file" multiple accept="image/*" className="hidden" onChange={upload} /></label>}
      {onPickFromAlbum && <button type="button" onClick={onPickFromAlbum} className="text-amber-400">Select existing media</button>}
      <button type="button" onClick={() => change(() => [])} disabled={!items.length} className="text-red-400 disabled:opacity-40">Clear Selection</button>
    </div>
    <p className="text-[10px] text-textSecondary">Drag images to reorder, or use the move buttons. Each image keeps its own settings.</p>
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    {pending.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Uploading images">{pending.map(item => <div key={item.src} className="w-20 text-[9px] text-textSecondary"><img src={item.src} alt={item.name} className="h-16 w-20 rounded object-cover opacity-60" />Uploading…</div>)}</div>}
    {!items.length && !pending.length && <p className="py-6 text-center text-xs text-textSecondary">No images selected. Add one or several images.</p>}
    <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">{items.map((item, index) => <div key={item.id} data-media-id={item.id} draggable onDragStart={event => { setDragged(item.id); event.dataTransfer.setData('text/plain', item.id) }} onDragEnd={() => setDragged(null)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragged && dragged !== item.id) move(dragged, index); setDragged(null) }} className="rounded-lg border border-white/10 bg-[#0B1120]/60 p-2">
      <div className="flex gap-2"><div className="relative h-20 w-24 shrink-0 overflow-hidden rounded"><img src={item.src} alt={item.alt || `Selected image ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[10px] text-white">{index + 1}</span></div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2"><input aria-label={`Image ${index + 1} alt text`} value={item.alt} placeholder="Alt text" onChange={event => update(item.id, { alt: event.target.value })} className={field} /><input aria-label={`Image ${index + 1} caption`} value={item.caption} placeholder="Caption" onChange={event => update(item.id, { caption: event.target.value })} className={field} /><input aria-label={`Image ${index + 1} URL`} value={item.src} placeholder="Image URL" onChange={event => update(item.id, { src: event.target.value })} className={`${field} col-span-2`} /></div>
        <div className="flex flex-col gap-1 text-xs"><button type="button" aria-label={`Move image ${index + 1} up`} disabled={index === 0} onClick={() => move(item.id, index - 1)}>↑</button><button type="button" aria-label={`Move image ${index + 1} down`} disabled={index === items.length - 1} onClick={() => move(item.id, index + 1)}>↓</button><button type="button" aria-label={`Duplicate image ${index + 1}`} onClick={() => change(current => { const i = current.findIndex(value => value.id === item.id); return [...current.slice(0, i + 1), { ...deepClone(current[i]), id: createBlockId('media') }, ...current.slice(i + 1)] })}>⧉</button><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => change(current => current.filter(value => value.id !== item.id))} className="text-red-400">×</button></div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px]">{onUploadFile && <label className="cursor-pointer text-amber-400">Replace image<input aria-label={`Replace image ${index + 1}`} type="file" accept="image/*" className="hidden" onChange={event => upload(event, item.id)} /></label>}</div>
      <details className="mt-2"><summary className="cursor-pointer text-[10px] text-textSecondary">Individual image appearance</summary><div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-[10px] text-textSecondary">Fit<select value={item.objectFit || ''} onChange={event => update(item.id, { objectFit: event.target.value })} className={`${field} w-full`}><option value="">Inherit</option><option value="cover">Cover</option><option value="contain">Contain</option></select></label>
        <label className="text-[10px] text-textSecondary">Position<input value={item.objectPosition} placeholder="Inherit / focal point" onChange={event => update(item.id, { objectPosition: event.target.value })} className={`${field} w-full`} /></label>
        {['X', 'Y'].map(axis => <label key={axis} className="text-[10px] text-textSecondary">Focal {axis}: {item[`focal${axis}`]}%<input aria-label={`Image ${index + 1} focal ${axis}`} type="range" min="0" max="100" value={item[`focal${axis}`]} onChange={event => update(item.id, { [`focal${axis}`]: Number(event.target.value), objectPosition: '' })} className="w-full" /></label>)}
        <input value={item.link} placeholder="Optional image link" onChange={event => update(item.id, { link: event.target.value })} className={`${field} col-span-2`} />
      </div></details>
    </div>)}</div>
    <label className="block text-[10px] text-textSecondary">Add an image URL<input aria-label="Add image URL" placeholder="Paste URL and press Enter" className={`${field} mt-1 w-full`} onKeyDown={event => { if (event.key !== 'Enter') return; event.preventDefault(); const src = event.currentTarget.value.trim(); if (src) change(current => [...current, { id: createBlockId('media'), src }]); event.currentTarget.value = '' }} /></label>
  </details>
}
