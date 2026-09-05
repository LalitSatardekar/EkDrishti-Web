import React, { useState } from 'react'
import CachedImage from '../ui/CachedImage'
import { shuffleGridImages, balanceGridImages } from '../../lib/heroSelector'
import { detectClosestRatio } from '../../lib/aspectRatios'

/**
 * VisualImageArranger
 * Reusable visual drag-and-drop arranger for Gallery and Album image lists.
 * Renders the actual dynamic masonry layout with natural image proportions, reordering,
 * position shift buttons, shuffle, smart balance, upload, and album import.
 */
const VisualImageArranger = ({
  images = [],
  onChange,
  onUpload,
  onPickFromAlbum,
  title = 'Gallery',
  allowAlbumPick = true,
  allowUpload = true,
  maxImages = 100
}) => {
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [orientations, setOrientations] = useState({})
  const [showRawUrls, setShowRawUrls] = useState(false)
  const [viewMode, setViewMode] = useState('masonry') // 'masonry', 'compact', 'visitor'
  const [columnsCount, setColumnsCount] = useState(3) // 2, 3, 4

  const cleanImages = Array.isArray(images)
    ? images.map(img => (typeof img === 'string' ? img : (img?.url || img?.src || ''))).filter(Boolean)
    : []

  const handleImageLoad = (idx, e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth && naturalHeight) {
      const detected = detectClosestRatio(naturalWidth, naturalHeight)
      setOrientations(prev => (prev[idx] === detected.label ? prev : { ...prev, [idx]: detected.label }))
    }
  }

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, index) => {
    if (viewMode === 'visitor') return
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e, index) => {
    if (viewMode === 'visitor') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDragLeave = (e, index) => {
    if (viewMode === 'visitor') return
    if (dragOverIdx === index) {
      setDragOverIdx(null)
    }
  }

  const handleDrop = (e, targetIndex) => {
    if (viewMode === 'visitor') return
    e.preventDefault()
    e.stopPropagation()
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    const updated = [...cleanImages]
    const [moved] = updated.splice(draggedIdx, 1)
    updated.splice(targetIndex, 0, moved)

    setDraggedIdx(null)
    setDragOverIdx(null)
    onChange(updated)
  }

  const handleContainerDrop = (e) => {
    if (viewMode === 'visitor' || draggedIdx === null) return
    e.preventDefault()
    const updated = [...cleanImages]
    const [moved] = updated.splice(draggedIdx, 1)
    updated.push(moved)

    setDraggedIdx(null)
    setDragOverIdx(null)
    onChange(updated)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  // Move single item
  const moveItem = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= cleanImages.length) return
    const updated = [...cleanImages]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    onChange(updated)
  }

  const moveToEdge = (index, position) => {
    if (position === 'start' && index === 0) return
    if (position === 'end' && index === cleanImages.length - 1) return
    const updated = [...cleanImages]
    const [moved] = updated.splice(index, 1)
    if (position === 'start') {
      updated.unshift(moved)
    } else {
      updated.push(moved)
    }
    onChange(updated)
  }

  const handleRemove = (index) => {
    const updated = cleanImages.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleShuffle = () => {
    if (cleanImages.length <= 1) return
    onChange(shuffleGridImages(cleanImages))
  }

  const handleSmartBalance = () => {
    if (cleanImages.length <= 1) return
    onChange(balanceGridImages(cleanImages, orientations))
  }

  const isSingle = cleanImages.length === 1

  return (
    <div className="space-y-3">
      {/* Action & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B1120] p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {title} Photos
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
            {cleanImages.length} {cleanImages.length === 1 ? 'Image' : 'Images'}
          </span>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode('masonry')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                viewMode === 'masonry'
                  ? 'bg-amber-500 text-primary shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
              title="Show actual dynamic masonry grid layout"
            >
              🧱 Masonry
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-amber-500 text-primary shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
              title="Show uniform compact square tiles"
            >
              ▦ Compact
            </button>
            <button
              type="button"
              onClick={() => setViewMode(prev => (prev === 'visitor' ? 'masonry' : 'visitor'))}
              className={`px-2 py-1 rounded font-bold transition-all ${
                viewMode === 'visitor'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
              title="Toggle clean visitor view without badges"
            >
              👁️ Preview
            </button>
          </div>

          {/* Column selector in Masonry view */}
          {viewMode === 'masonry' && cleanImages.length > 2 && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px]">
              {[2, 3, 4].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColumnsCount(col)}
                  className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all ${
                    columnsCount === col
                      ? 'bg-white/20 text-white'
                      : 'text-textSecondary hover:text-white'
                  }`}
                  title={`${col} Columns Layout`}
                >
                  {col}C
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {cleanImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handleShuffle}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow"
                title="Shuffle photo sequence randomly"
              >
                🎲 Shuffle
              </button>
              <button
                type="button"
                onClick={handleSmartBalance}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow"
                title="Balance portraits & landscapes across columns"
              >
                ✨ Smart Balance
              </button>
            </>
          )}

          {allowUpload && onUpload && (
            <label className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow">
              📁 Upload
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onUpload}
                className="hidden"
              />
            </label>
          )}

          {allowAlbumPick && onPickFromAlbum && (
            <button
              type="button"
              onClick={onPickFromAlbum}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1"
            >
              📚 Pick from Album
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowRawUrls(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
              showRawUrls
                ? 'bg-blue-500 text-white font-bold'
                : 'bg-white/5 text-textSecondary hover:text-white border border-white/10'
            }`}
            title="Toggle raw URL textarea"
          >
            {showRawUrls ? '🖼️ Visual Grid' : '📝 URLs'}
          </button>

          {cleanImages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Clear all ${cleanImages.length} images from this ${title.toLowerCase()}?`)) {
                  onChange([])
                }
              }}
              className="px-2 py-1 text-red-400 hover:text-red-300 text-[10px] transition-colors"
              title="Clear all photos"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Raw URLs Textarea Drawer */}
      {showRawUrls && (
        <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-1.5 animate-fadeIn">
          <label className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider">
            Direct Image URLs (one per line)
          </label>
          <textarea
            rows="5"
            value={cleanImages.join('\n')}
            onChange={(e) => {
              const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              onChange(urls)
            }}
            placeholder="https://...\nhttps://..."
            className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-textPrimary text-[10px] font-mono focus:outline-none"
          />
        </div>
      )}

      {/* Visual Image Grid: Masonry Layout or Compact Grid */}
      <div
        className="p-4 bg-[#0B1120]/70 rounded-xl border border-white/5 min-h-[220px]"
        onDragOver={(e) => {
          if (viewMode !== 'visitor' && draggedIdx !== null) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }
        }}
        onDrop={handleContainerDrop}
      >
        {cleanImages.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-textSecondary">
            <div className="text-4xl opacity-40">🖼️</div>
            <p className="text-xs font-semibold">No images in this {title.toLowerCase()} yet.</p>
            <p className="text-[10px] opacity-70 max-w-sm mx-auto">
              Upload new photos, paste image URLs, or pick from the master album to populate this dynamic masonry showcase.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              {allowAlbumPick && onPickFromAlbum && (
                <button
                  type="button"
                  onClick={onPickFromAlbum}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-xl text-xs transition-all shadow"
                >
                  📚 Pick from Album
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'masonry' || viewMode === 'visitor' ? (
          /* ACTUAL DYNAMIC MASONRY LAYOUT */
          <div
            className={
              isSingle
                ? 'w-full max-w-2xl mx-auto flex justify-center items-center py-4'
                : `w-full ${
                    columnsCount === 2
                      ? 'columns-1 sm:columns-2 gap-4'
                      : columnsCount === 4
                      ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4'
                      : 'columns-1 sm:columns-2 md:columns-3 gap-4'
                  }`
            }
          >
            {cleanImages.map((src, index) => {
              const isDragging = draggedIdx === index
              const isDropTarget = dragOverIdx === index && draggedIdx !== index
              const orientationLabel = orientations[index]
              const isVisitor = viewMode === 'visitor'

              return (
                <div
                  key={`${src}-${index}`}
                  draggable={!isVisitor}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={(e) => handleDragLeave(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative mb-4 break-inside-avoid overflow-hidden transition-all duration-300 ${
                    !isVisitor ? 'select-none cursor-grab active:cursor-grabbing' : ''
                  } ${
                    isDragging
                      ? 'opacity-30 scale-95 ring-2 ring-amber-500 shadow-2xl'
                      : isDropTarget
                      ? 'ring-2 ring-amber-400 scale-[1.02] shadow-[0_0_24px_rgba(245,158,11,0.4)] z-20'
                      : 'hover:shadow-xl'
                  }`}
                >
                  {/* Drop Target Indicator */}
                  {isDropTarget && (
                    <div className="absolute inset-0 z-30 bg-amber-500/20 backdrop-blur-[1px] border-2 border-dashed border-amber-400 flex items-center justify-center pointer-events-none">
                      <span className="bg-amber-500 text-black text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                        Drop to Position #{index + 1}
                      </span>
                    </div>
                  )}

                  {/* Main Image Container (Sharp Corners, Natural Aspect Ratio) */}
                  <div className="relative overflow-hidden bg-[#0F172A]/40 border border-white/10 shadow-lg group">
                    <CachedImage
                      src={src}
                      alt={`${title} #${index + 1}`}
                      onLoad={(e) => handleImageLoad(index, e)}
                      className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Edit Controls: Badges, Move Arrows, and Delete */}
                  {!isVisitor && (
                    <>
                      {/* Top Bar: Order Badge + Delete */}
                      <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-md border border-white/15">
                          <span className="text-amber-400">⠿</span>
                          <span>#{index + 1}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(index)
                          }}
                          className="w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-500 active:scale-95 text-white text-xs font-black flex items-center justify-center transition-all shadow-lg border border-white/30 hover:scale-105"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Bottom Bar: Move Controls & Orientation */}
                      <div className="absolute bottom-2 inset-x-2 z-20 flex items-center justify-between pointer-events-auto gap-1">
                        {orientationLabel ? (
                          <span className="bg-black/85 backdrop-blur text-[9px] font-medium text-textSecondary border border-white/15 px-2 py-0.5 rounded-md shadow truncate max-w-[100px]">
                            {orientationLabel}
                          </span>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-0.5 bg-black/85 backdrop-blur border border-white/15 p-0.5 rounded shadow">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveToEdge(index, 'start')
                            }}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                            title="Move to first"
                          >
                            ⇤
                          </button>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveItem(index, -1)
                            }}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                            title="Move left"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={index === cleanImages.length - 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveItem(index, 1)
                            }}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                            title="Move right"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            disabled={index === cleanImages.length - 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveToEdge(index, 'end')
                            }}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                            title="Move to last"
                          >
                            ⇥
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* COMPACT UNIFORM GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cleanImages.map((src, index) => {
              const isDragging = draggedIdx === index
              const isDropTarget = dragOverIdx === index && draggedIdx !== index
              const orientationLabel = orientations[index]

              return (
                <div
                  key={`${src}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={(e) => handleDragLeave(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group overflow-hidden border border-white/10 shadow-md transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-30 scale-95 ring-2 ring-amber-500 shadow-2xl'
                      : isDropTarget
                      ? 'ring-2 ring-amber-400 scale-[1.03] shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20'
                      : 'hover:border-amber-500/50 hover:shadow-xl'
                  }`}
                >
                  {/* Drop Target Indicator */}
                  {isDropTarget && (
                    <div className="absolute inset-0 z-30 bg-amber-500/25 backdrop-blur-[1px] border-2 border-dashed border-amber-400 flex items-center justify-center pointer-events-none">
                      <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        Position #{index + 1}
                      </span>
                    </div>
                  )}

                  {/* Image Display */}
                  <div className="relative aspect-[4/3] bg-[#0F172A] overflow-hidden">
                    <CachedImage
                      src={src}
                      alt={`${title} #${index + 1}`}
                      onLoad={(e) => handleImageLoad(index, e)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Top Header: Order Badge + Delete */}
                  <div className="absolute top-1.5 inset-x-1.5 z-20 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1 bg-black/85 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow border border-white/15">
                      <span className="text-amber-400">⠿</span>
                      <span>#{index + 1}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(index)
                      }}
                      className="w-5 h-5 rounded bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center transition-all shadow border border-white/20 hover:scale-110"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Bottom Bar: Move Controls */}
                  <div className="absolute bottom-1.5 inset-x-1.5 z-20 flex items-center justify-between pointer-events-auto gap-1">
                    {orientationLabel ? (
                      <span className="bg-black/85 backdrop-blur text-[8px] font-mono text-textSecondary border border-white/10 px-1.5 py-0.5 rounded shadow truncate max-w-[70px]">
                        {orientationLabel}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-0.5 bg-black/85 backdrop-blur border border-white/15 p-0.5 rounded shadow">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveToEdge(index, 'start')
                        }}
                        className="w-3.5 h-4 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[8px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move to first"
                      >
                        ⇤
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveItem(index, -1)
                        }}
                        className="w-3.5 h-4 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === cleanImages.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveItem(index, 1)
                        }}
                        className="w-3.5 h-4 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move right"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        disabled={index === cleanImages.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveToEdge(index, 'end')
                        }}
                        className="w-3.5 h-4 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[8px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move to last"
                      >
                        ⇥
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualImageArranger

