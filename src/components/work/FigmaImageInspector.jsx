import React from 'react'

/**
 * FigmaImageInspector
 * Professional dark-mode design property inspector for fine-tuned image editing.
 * Provides controls for Dimensions (W/H), Aspect Ratios, Object Fit, Corner Radius, Shadow, Border, and Reordering.
 */
const FigmaImageInspector = ({
  selectedIdx,
  imageItem,
  totalImages,
  config = {},
  onUpdateConfig,
  onReorder,
  onRemove,
  onClose,
  title = 'Image'
}) => {
  if (selectedIdx === null || selectedIdx === undefined) return null

  const src = typeof imageItem === 'string' ? imageItem : (imageItem?.url || imageItem?.src || '')
  const {
    aspectRatio = 'auto',
    span = 1,
    height = 'auto',
    fit = 'cover',
    radius = '16px',
    shadow = 'md',
    border = 'none'
  } = config

  const parsedHeightNum = height === 'auto' ? '' : parseInt(height) || ''

  const RATIO_PRESETS = [
    { id: 'auto', label: 'Auto' },
    { id: '1:1', label: '1:1 Sq' },
    { id: '3:4', label: '3:4 Port' },
    { id: '4:3', label: '4:3 Land' },
    { id: '16:9', label: '16:9 Wide' },
    { id: '9:16', label: '9:16 Story' },
    { id: '3:2', label: '3:2 Photo' },
    { id: '2:3', label: '2:3 Tall' },
  ]

  const SPAN_PRESETS = [
    { val: 1, label: '1 Col (Standard)' },
    { val: 2, label: '2 Cols (Wide)' },
    { val: 3, label: '3 Cols (Large)' },
    { val: 4, label: '4 Cols (Full Width)' },
  ]

  const RADIUS_PRESETS = [
    { id: '0px', label: '0' },
    { id: '8px', label: '8' },
    { id: '16px', label: '16' },
    { id: '24px', label: '24' },
    { id: '36px', label: '36' },
  ]

  const SHADOW_PRESETS = [
    { id: 'none', label: 'None' },
    { id: 'md', label: 'Soft' },
    { id: '2xl', label: 'Elevated' },
    { id: 'glow', label: 'Glow' },
  ]

  const BORDER_PRESETS = [
    { id: 'none', label: 'None' },
    { id: 'subtle', label: 'Subtle' },
    { id: 'amber', label: 'Amber' },
    { id: 'white', label: 'Solid' },
  ]

  return (
    <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4 text-white select-none animate-fadeIn text-xs w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
            <img src={src} alt="Thumbnail" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-400 text-xs">Image #{selectedIdx + 1}</span>
              <span className="text-[10px] text-textSecondary font-mono">of {totalImages}</span>
            </div>
            <p className="text-[10px] text-textSecondary truncate max-w-[140px]">
              {src.split('/').pop()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateConfig({ height: 'auto', span: 1, aspectRatio: 'auto', fit: 'cover', radius: '16px', shadow: 'md', border: 'none' })}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-textSecondary hover:text-white transition-colors"
            title="Reset to natural default settings"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white text-xs font-bold transition-colors"
            title="Deselect"
          >
            ✕
          </button>
        </div>
      </div>

      {/* SECTION 1: TRANSFORM & DIMENSIONS (W / H) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-textSecondary uppercase tracking-wider">
          <span>📐 Dimensions (W & H)</span>
          <span className="text-amber-400 font-mono font-normal">
            {span > 1 ? `${span}x Cols` : '1 Col'} · {height}
          </span>
        </div>

        {/* Width Span */}
        <div className="grid grid-cols-4 gap-1">
          {SPAN_PRESETS.map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => onUpdateConfig({ span: s.val })}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all text-center ${span === s.val
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                }`}
            >
              {s.val === 1 ? '1 Col' : s.val === 2 ? '2x Wide' : s.val === 3 ? '3x Wide' : 'Full'}
            </button>
          ))}
        </div>

        {/* Height Slider & Manual Px Input */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-textSecondary">Height Limit:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="100"
                max="1200"
                step="20"
                placeholder="Auto"
                value={parsedHeightNum}
                onChange={(e) => {
                  const val = e.target.value
                  onUpdateConfig({ height: val ? `${val}px` : 'auto' })
                }}
                className="w-16 px-1.5 py-0.5 bg-[#0F172A] border border-white/15 rounded text-[11px] font-mono text-center text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-textSecondary font-mono">px</span>
              <button
                type="button"
                onClick={() => onUpdateConfig({ height: 'auto' })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${height === 'auto' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-textSecondary hover:text-white'
                  }`}
              >
                Auto
              </button>
            </div>
          </div>

          <input
            type="range"
            min="120"
            max="900"
            step="10"
            value={parsedHeightNum || 350}
            onChange={(e) => onUpdateConfig({ height: `${e.target.value}px` })}
            className="w-full accent-amber-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* SECTION 2: ASPECT RATIOS STRIP */}
      <div className="space-y-1.5 border-t border-white/5 pt-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-textSecondary uppercase tracking-wider">
          <span>🖼️ Aspect Ratio</span>
          <span className="text-blue-400 font-mono">{aspectRatio}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {RATIO_PRESETS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onUpdateConfig({ aspectRatio: r.id })}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${aspectRatio === r.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: FRAME FIT & OBJECT ALIGNMENT */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
            Object Fit
          </span>
          <div className="grid grid-cols-2 gap-1">
            {['cover', 'contain'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onUpdateConfig({ fit: f })}
                className={`py-1 rounded capitalize font-bold text-[10px] transition-all text-center ${fit === f
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
            Corner Radius
          </span>
          <div className="flex gap-1">
            {RADIUS_PRESETS.map((rad) => (
              <button
                key={rad.id}
                type="button"
                onClick={() => onUpdateConfig({ radius: rad.id })}
                className={`flex-1 py-1 rounded font-mono font-bold text-[10px] transition-all text-center ${radius === rad.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                  }`}
              >
                {rad.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: SHADOW & BORDER STYLES */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
            Shadow Effect
          </span>
          <div className="grid grid-cols-2 gap-1">
            {SHADOW_PRESETS.map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => onUpdateConfig({ shadow: sh.id })}
                className={`py-1 rounded font-bold text-[10px] transition-all text-center ${shadow === sh.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                  }`}
              >
                {sh.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
            Border Style
          </span>
          <div className="grid grid-cols-2 gap-1">
            {BORDER_PRESETS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onUpdateConfig({ border: b.id })}
                className={`py-1 rounded font-bold text-[10px] transition-all text-center ${border === b.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white border border-white/5'
                  }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: REORDER & ACTIONS */}
      <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-textSecondary font-bold mr-1">Position:</span>
          <button
            type="button"
            disabled={selectedIdx === 0}
            onClick={() => onReorder(selectedIdx, 'start')}
            className="px-2 py-1 bg-white/5 hover:bg-amber-500 hover:text-black rounded text-[10px] font-bold disabled:opacity-20 transition-colors"
            title="Move to first (#1)"
          >
            ⇤
          </button>
          <button
            type="button"
            disabled={selectedIdx === 0}
            onClick={() => onReorder(selectedIdx, -1)}
            className="px-2 py-1 bg-white/5 hover:bg-amber-500 hover:text-black rounded text-[10px] font-bold disabled:opacity-20 transition-colors"
            title="Move Left / Earlier"
          >
            ←
          </button>
          <button
            type="button"
            disabled={selectedIdx === totalImages - 1}
            onClick={() => onReorder(selectedIdx, 1)}
            className="px-2 py-1 bg-white/5 hover:bg-amber-500 hover:text-black rounded text-[10px] font-bold disabled:opacity-20 transition-colors"
            title="Move Right / Later"
          >
            →
          </button>
          <button
            type="button"
            disabled={selectedIdx === totalImages - 1}
            onClick={() => onReorder(selectedIdx, 'end')}
            className="px-2 py-1 bg-white/5 hover:bg-amber-500 hover:text-black rounded text-[10px] font-bold disabled:opacity-20 transition-colors"
            title="Move to Last"
          >
            ⇥
          </button>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(selectedIdx)}
            className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-red-500/30"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default FigmaImageInspector
