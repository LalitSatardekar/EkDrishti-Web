import { useEffect, useId, useRef, useState } from 'react'
import { parseSectionTitleFontInput } from '../../lib/sectionTitleFont'
import useSectionTitleFont from '../../hooks/useSectionTitleFont'

const variable = [300, 400, 500, 600, 700, 800]
export const FONT_CATALOG = [
  ['Inter', variable, true], ['Roboto', [300, 400, 500, 700, 900], true], ['Open Sans', [300, 400, 500, 600, 700, 800], true],
  ['Lato', [300, 400, 700, 900], true], ['Montserrat', variable, true], ['Poppins', variable, true], ['Manrope', [300, 400, 500, 600, 700, 800], false],
  ['DM Sans', variable, true], ['Playfair Display', [400, 500, 600, 700, 800, 900], true], ['Cormorant Garamond', [300, 400, 500, 600, 700], true],
  ['Libre Baskerville', [400, 700], true], ['Merriweather', [300, 400, 700, 900], true], ['Bodoni Moda', [400, 500, 600, 700, 800, 900], true],
  ['EB Garamond', [400, 500, 600, 700, 800], true], ['Raleway', variable, true], ['Oswald', [300, 400, 500, 600, 700], false],
  ['Source Sans 3', variable, true], ['Source Serif 4', variable, true], ['Space Grotesk', [300, 400, 500, 600, 700], false],
  ['Plus Jakarta Sans', variable, true], ['Work Sans', variable, true], ['Outfit', variable, false], ['Nunito Sans', variable, true],
  ['Roboto Slab', variable, false], ['Great Vibes', [400], false], ['Dancing Script', [400, 500, 600, 700], false],
  ['Arial', [400, 700], true, 'system'], ['Georgia', [400, 700], true, 'system'], ['Times New Roman', [400, 700], true, 'system'],
  ['Helvetica', [400, 700], true, 'system'], ['system-ui', [400, 500, 600, 700], true, 'system']
].map(([family, weights, italics, source = 'google']) => ({ family, weights, italics, source }))

const fieldClass = 'h-8 min-w-0 rounded-md border border-white/10 bg-[#0B1120] px-2 text-[11px] text-textPrimary outline-none transition-colors hover:border-white/20 focus:border-amber-500/60'
const weightNames = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black' }

function NumericField({ label, value, placeholder, min, max, step = 1, suffix, onChange }) {
  const adjust = event => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const amount = step * (event.shiftKey ? 10 : 1) * (event.key === 'ArrowUp' ? 1 : -1)
    const current = Number.parseFloat(value) || 0
    onChange(String(Math.min(max, Math.max(min, current + amount))))
  }
  return <label className="min-w-0 text-[9px] uppercase tracking-wide text-textSecondary">{label}<span className="relative mt-1 block">
    <input type="text" inputMode="decimal" value={value ?? ''} placeholder={placeholder} onKeyDown={adjust}
      onChange={event => onChange(event.target.value)} onBlur={event => {
        if (event.target.value === '') return
        const number = Number.parseFloat(event.target.value)
        if (Number.isFinite(number)) onChange(String(Math.min(max, Math.max(min, number))))
      }} className={`${fieldClass} w-full pr-6`} />
    {suffix && <span className="pointer-events-none absolute right-2 top-2 text-[9px] text-textSecondary">{suffix}</span>}
  </span></label>
}

export default function TypographyStyleEditor({ style = {}, sample, onChange, onReset, onUploadFont, availableFonts = [] }) {
  const id = useId()
  const root = useRef(null)
  const [fontOpen, setFontOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [more, setMore] = useState(false)
  const [uploadingFont, setUploadingFont] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [device, setDevice] = useState('Desktop')
  const catalog = [...FONT_CATALOG, ...availableFonts.filter(font => font.fontSource === 'custom' || !FONT_CATALOG.some(item => item.family === font.fontFamily)).map(font => ({ ...font, family: font.fontFamily, source: font.fontSource || 'custom', weights: variable, italics: true }))]
  const selected = catalog.find(font => font.family.toLowerCase() === String(style.fontFamily || '').toLowerCase() && (style.fontUrl ? font.fontUrl === style.fontUrl : font.source === (style.fontSource || 'google')))
  const filtered = catalog.filter(font => font.family.toLowerCase().includes(query.toLowerCase()))
  const weights = selected?.weights || variable
  const variants = weights.flatMap(weight => [{ value: `${weight}:normal`, label: `${weightNames[weight] || weight} ${weight}` }, { value: `${weight}:italic`, label: `${weightNames[weight] || weight} Italic ${weight}` }])
  const currentVariant = `${style.fontWeight || 400}:${style.fontStyle || 'normal'}`
  const parsed = style.pastedCss ? parseSectionTitleFontInput(style.pastedCss) : null
  const loadedFont = useSectionTitleFont({ titleFontSource: style.pastedCss ? 'paste' : style.fontSource === 'custom' ? 'file' : (style.fontSource || 'google'), titleFontFamily: style.fontFamily, titleFontUrl: style.fontUrl, titleFontGoogleUrl: style.googleUrl, titleFontCss: style.pastedCss, fontWeight: style.fontWeight, fontStyle: style.fontStyle })

  useEffect(() => {
    const close = event => { if (!root.current?.contains(event.target)) setFontOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const chooseFont = font => {
    onChange({ fontFamily: font.family, fontSource: font.source, fontUrl: font.fontUrl || '', googleUrl: font.googleUrl || '', fontWeight: font.weights.includes(Number(style.fontWeight)) ? style.fontWeight : 400, fontStyle: style.fontStyle || 'normal', pastedCss: font.pastedCss || '' })
    setQuery(''); setFontOpen(false)
  }
  const fontKeyDown = event => {
    if (!fontOpen && ['ArrowDown', 'Enter'].includes(event.key)) { setFontOpen(true); return }
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlighted(value => Math.min(filtered.length - 1, value + 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlighted(value => Math.max(0, value - 1)) }
    if (event.key === 'Enter' && filtered[highlighted]) { event.preventDefault(); chooseFont(filtered[highlighted]) }
    if (event.key === 'Escape') setFontOpen(false)
  }
  const previewStyle = { ...loadedFont.style, fontWeight: style.fontWeight, fontStyle: style.fontStyle, color: style.color, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, textAlign: style.textAlign, textTransform: style.textTransform, textDecoration: style.textDecoration, textShadow: style.textShadow, WebkitTextStrokeWidth: style.WebkitTextStrokeWidth, WebkitTextStrokeColor: style.WebkitTextStrokeColor }
  const sizeKey = `fontSize${device}`
  const summarySize = style.fontSizeDesktop || style.fontSize || 'Auto'
  const summarySizeLabel = /^\d+(\.\d+)?$/.test(String(summarySize)) ? `${summarySize}px` : summarySize
  const summaryWeight = weightNames[style.fontWeight || 400] || style.fontWeight || 'Regular'

  return <div className="mt-1.5 rounded-lg border border-white/[0.07] bg-[#0B1120]/55" ref={root}>
    <button type="button" aria-expanded={expanded} aria-controls={`${id}-typography-controls`}
      onClick={() => { setExpanded(value => !value); setFontOpen(false) }}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-amber-500/50">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-textSecondary">Typography</span>
      <span className="min-w-0 flex-1 truncate text-[10px] text-white/80" style={loadedFont.style}>
        {style.fontFamily || 'Default font'} · {summaryWeight}{style.fontStyle === 'italic' ? ' Italic' : ''} · {summarySizeLabel}
      </span>
      <span aria-hidden="true" className={`text-[10px] text-amber-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
    </button>
    {expanded && <div id={`${id}-typography-controls`} className="border-t border-white/5 p-2">
    <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-[9px] font-semibold uppercase tracking-wider text-textSecondary">Text controls</span><div className="flex items-center gap-1">
      {['Desktop', 'Tablet', 'Mobile'].map(target => <button key={target} type="button" title={`${target} font size`} onClick={() => setDevice(target)} className={`h-5 rounded px-1.5 text-[9px] ${device === target ? 'bg-amber-500/15 text-amber-400' : 'text-textSecondary hover:text-white'}`}>{target[0]}</button>)}
      <button type="button" onClick={() => setMore(value => !value)} aria-expanded={more} className={`h-5 rounded px-1.5 text-[11px] ${more ? 'bg-amber-500/15 text-amber-400' : 'text-textSecondary hover:text-white'}`}>•••</button>
    </div></div>
    <div className="grid grid-cols-[minmax(140px,1.6fr)_minmax(115px,1fr)_70px] gap-1.5">
      <div className="relative min-w-0">
        <input role="combobox" aria-expanded={fontOpen} aria-controls={`${id}-fonts`} value={fontOpen ? query : (style.fontFamily || '')} placeholder="Choose font" onFocus={() => { setFontOpen(true); setQuery(''); setHighlighted(0) }} onChange={event => { setQuery(event.target.value); setFontOpen(true); setHighlighted(0) }} onKeyDown={fontKeyDown} className={`${fieldClass} w-full`} />
        {fontOpen && <div id={`${id}-fonts`} role="listbox" className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#111827] p-1 shadow-2xl">
          {filtered.map((font, index) => <button key={`${font.family}:${font.source}:${font.fontUrl || ''}`} type="button" role="option" aria-selected={index === highlighted} onMouseEnter={() => setHighlighted(index)} onClick={() => chooseFont(font)} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${index === highlighted ? 'bg-amber-500/15 text-amber-300' : 'text-white hover:bg-white/5'}`} style={{ fontFamily: `${JSON.stringify(font.family)}, sans-serif` }}>{font.family}<span className="float-right text-[8px] uppercase text-textSecondary">{font.source}</span></button>)}
          {!filtered.length && <p className="px-2 py-3 text-[10px] text-textSecondary">No font found. Use Custom under •••.</p>}
        </div>}
      </div>
      <select aria-label="Font weight and style" value={variants.some(item => item.value === currentVariant) ? currentVariant : `${weights[0]}:normal`} onChange={event => { const [fontWeight, fontStyle] = event.target.value.split(':'); onChange({ fontWeight: Number(fontWeight), fontStyle }) }} className={`${fieldClass} w-full`}>{variants.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      <NumericField label={device[0]} value={style[sizeKey] ?? (device === 'Desktop' ? style.fontSize : '')} placeholder="Auto" min={8} max={240} onChange={value => onChange({ [sizeKey]: value })} />
    </div>
    {more && <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-white/5 pt-2 sm:grid-cols-5">
      <NumericField label="Line height" value={style.lineHeight || ''} placeholder="Auto" min={0.5} max={5} step={0.05} onChange={value => onChange({ lineHeight: value })} />
      <NumericField label="Letter spacing" value={String(style.letterSpacing || '').replace(/px$/, '')} placeholder="0" min={-20} max={100} step={0.1} suffix="px" onChange={value => onChange({ letterSpacing: value === '' ? '' : `${value}px` })} />
      <label className="text-[9px] uppercase text-textSecondary">Text color<div className="mt-1 flex gap-1"><input aria-label="Text color picker" type="color" value={/^#[0-9a-f]{6}$/i.test(style.color || '') ? style.color : '#ffffff'} onChange={event => onChange({ color: event.target.value })} className="h-8 w-8 shrink-0 rounded bg-transparent" /><input aria-label="Text color HEX" value={style.color || ''} placeholder="Inherit / #FFFFFF" onChange={event => onChange({ color: event.target.value })} className={`${fieldClass} w-full`} /></div></label>
      <NumericField label="Space before (px)" value={String(style.marginTop || '').replace(/px$/, '')} placeholder="Inherit" min={-100} max={500} onChange={value => onChange({ marginTop: value === '' ? '' : `${value}px` })} />
      <NumericField label="Space after (px)" value={String(style.marginBottom || '').replace(/px$/, '')} placeholder="Inherit" min={-100} max={500} onChange={value => onChange({ marginBottom: value === '' ? '' : `${value}px` })} />
      <label className="text-[9px] uppercase text-textSecondary">Text shadow<input value={style.textShadow || ''} placeholder="0 2px 8px #000000" onChange={event => onChange({ textShadow: event.target.value })} className={`${fieldClass} mt-1 w-full`} /></label>
      <NumericField label="Stroke width (px)" value={String(style.WebkitTextStrokeWidth || '').replace(/px$/, '')} placeholder="0" min={0} max={10} step={0.1} onChange={value => onChange({ WebkitTextStrokeWidth: value === '' ? '' : `${value}px` })} />
      <label className="text-[9px] uppercase text-textSecondary">Stroke color<input value={style.WebkitTextStrokeColor || ''} placeholder="#000000" onChange={event => onChange({ WebkitTextStrokeColor: event.target.value })} className={`${fieldClass} mt-1 w-full`} /></label>
      <label className="text-[9px] uppercase tracking-wide text-textSecondary">Align<select value={style.textAlign || ''} onChange={event => onChange({ textAlign: event.target.value })} className={`${fieldClass} mt-1 w-full`}><option value="">Auto</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option></select></label>
      <label className="text-[9px] uppercase tracking-wide text-textSecondary">Case<select value={style.textTransform || ''} onChange={event => onChange({ textTransform: event.target.value })} className={`${fieldClass} mt-1 w-full`}><option value="">Original</option><option value="uppercase">UPPERCASE</option><option value="lowercase">lowercase</option><option value="capitalize">Capitalize</option></select></label>
      <label className="text-[9px] uppercase tracking-wide text-textSecondary">Decoration<select value={style.textDecoration || ''} onChange={event => onChange({ textDecoration: event.target.value })} className={`${fieldClass} mt-1 w-full`}><option value="">None</option><option value="underline">Underline</option><option value="line-through">Strikethrough</option></select></label>
      <details className="col-span-2 sm:col-span-5"><summary className="cursor-pointer text-[9px] text-textSecondary hover:text-white">Custom font / pasted CSS</summary><div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <input type="text" value={style.fontSource === 'custom' ? (style.fontFamily || '') : ''} placeholder="Custom font family name" onChange={event => onChange({ fontFamily: event.target.value, fontSource: 'custom' })} className={`${fieldClass} w-full`} />
        {onUploadFont && <label className={`flex h-8 cursor-pointer items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 px-3 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/20 ${uploadingFont ? 'pointer-events-none opacity-60' : ''}`}>
          {uploadingFont ? 'Uploading font…' : 'Upload font file'}
          <input type="file" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf" className="hidden" onChange={async event => {
            const file = event.target.files?.[0]
            if (!file) return
            setUploadError(''); setUploadingFont(true)
            try {
              const fontUrl = await onUploadFont(file)
              const inferredFamily = file.name.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]+/g, ' ').trim()
              onChange({ fontUrl, fontFamily: style.fontFamily || inferredFamily || 'Custom Font', fontSource: 'custom', pastedCss: '' })
            } catch (error) {
              setUploadError(error.message || 'Font upload failed.')
            } finally {
              setUploadingFont(false); event.target.value = ''
            }
          }} />
        </label>}
        <textarea rows="2" value={style.pastedCss || ''} placeholder={'font-family: "My Font"; font-weight: 600;'} onChange={event => { const css = event.target.value; const result = parseSectionTitleFontInput(css); onChange({ pastedCss: css, fontSource: css ? 'custom' : style.fontSource, ...(result.family ? { fontFamily: result.family } : {}) }) }} className={`${fieldClass} h-auto py-2 font-mono`} />
        <input type="url" value={style.fontUrl || ''} placeholder="Or paste a hosted .woff2 URL" onChange={event => onChange({ fontUrl: event.target.value, fontSource: 'custom', pastedCss: '' })} className={`${fieldClass} w-full`} />
      </div>{(uploadError || parsed?.error) && <p className="mt-1 text-[9px] text-amber-400">{uploadError || parsed.error}</p>}</details>
    </div>}
    {(loadedFont.loading || loadedFont.error) && <p className={`mt-1 text-[9px] ${loadedFont.error ? 'text-amber-400' : 'text-textSecondary'}`}>{loadedFont.error || 'Loading font…'}</p>}
    {sample && <p className="mt-1.5 break-words border-t border-white/5 pt-1.5 text-sm text-white" style={previewStyle}>{sample}</p>}
    {onReset && <button type="button" onClick={onReset} className="mt-1 text-[9px] text-textSecondary hover:text-amber-400">Reset typography</button>}
    </div>}
  </div>
}
