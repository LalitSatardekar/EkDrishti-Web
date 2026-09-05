import { useState } from 'react'
import CachedImage from '../ui/CachedImage'
import { detectClosestRatio } from '../../lib/aspectRatios'

/**
 * HeroMasonryGrid
 * Clean, sharp-cornered (no rounded corners) dynamic masonry grid for 1 to 20 images of any orientation.
 * Fully center-aligned with smooth drag-and-drop reordering.
 */
const HeroMasonryGrid = ({
  images = [],
  onImageClick,
  editable = false,
  onReorder,
  onRemove,
  title = 'Hero Grid'
}) => {
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [orientations, setOrientations] = useState({})

  if (!images || images.length === 0) {
    return (
      <div className="w-full py-16 text-center border border-dashed border-white/10 bg-[#0B1120]/40">
        <p className="text-textSecondary text-sm">No hero images selected.</p>
        {editable && (
          <p className="text-textSecondary/60 text-xs mt-1">
            Add 1 to 20 images to populate the dynamic hero grid.
          </p>
        )}
      </div>
    )
  }

  const getImgSrc = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item.url || item.src || ''
  }

  const handleImageLoad = (idx, e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth && naturalHeight) {
      const detected = detectClosestRatio(naturalWidth, naturalHeight)
      setOrientations((prev) => (prev[idx] === detected.label ? prev : { ...prev, [idx]: detected.label }))
    }
  }

  // --- Drag & Drop Reordering Handlers ---
  const handleDragStart = (e, index) => {
    if (!editable) return
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e, index) => {
    if (!editable) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDragLeave = (e, index) => {
    if (!editable) return
    if (dragOverIdx === index) {
      setDragOverIdx(null)
    }
  }

  const handleDrop = (e, targetIndex) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    const updated = [...images]
    const [moved] = updated.splice(draggedIdx, 1)
    updated.splice(targetIndex, 0, moved)

    setDraggedIdx(null)
    setDragOverIdx(null)

    if (onReorder) {
      onReorder(updated)
    }
  }

  const handleContainerDrop = (e) => {
    if (!editable || draggedIdx === null) return
    e.preventDefault()
    const updated = [...images]
    const [moved] = updated.splice(draggedIdx, 1)
    updated.push(moved)

    setDraggedIdx(null)
    setDragOverIdx(null)

    if (onReorder) {
      onReorder(updated)
    }
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  // Instant reorder buttons
  const moveItem = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    if (onReorder) {
      onReorder(updated)
    }
  }

  const moveToEdge = (index, position) => {
    if (position === 'start' && index === 0) return
    if (position === 'end' && index === images.length - 1) return
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    if (position === 'start') {
      updated.unshift(moved)
    } else {
      updated.push(moved)
    }
    if (onReorder) {
      onReorder(updated)
    }
  }

  const isSingle = images.length === 1

  return (
    <div
      className="w-full min-h-[200px] flex justify-center items-center mx-auto"
      onDragOver={(e) => {
        if (editable && draggedIdx !== null) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }
      }}
      onDrop={handleContainerDrop}
    >
      {/* Dynamic Masonry Columns / Centered Single */}
      <div
        className={
          isSingle
            ? 'w-full max-w-4xl mx-auto flex justify-center items-center py-4 text-center'
            : 'w-full max-w-7xl mx-auto columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4'
        }
      >
        {images.map((item, index) => {
          const src = getImgSrc(item)
          const isDragging = draggedIdx === index
          const isDropTarget = dragOverIdx === index && draggedIdx !== index
          const orientationLabel = orientations[index]

          return (
            <div
              key={`${src}-${index}`}
              data-hero-card="true"
              draggable={editable}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={(e) => handleDragLeave(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!editable && onImageClick) {
                  onImageClick(index)
                }
              }}
              className={`relative mb-4 break-inside-avoid overflow-hidden transition-all duration-300 ${
                isSingle ? 'w-full max-w-3xl mx-auto' : 'w-full'
              } ${
                editable ? 'select-none cursor-grab active:cursor-grabbing' : 'cursor-pointer'
              } ${
                isDragging
                  ? 'opacity-30 scale-95 ring-2 ring-amber-500 shadow-2xl'
                  : isDropTarget
                  ? 'ring-2 ring-amber-400 scale-[1.02] shadow-[0_0_24px_rgba(245,158,11,0.4)]'
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Drop Target Indicator Banner */}
              {isDropTarget && (
                <div className="absolute inset-0 z-30 bg-amber-500/20 backdrop-blur-[1px] border-2 border-dashed border-amber-400 flex items-center justify-center pointer-events-none">
                  <span className="bg-amber-500 text-black text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    Drop to Position #{index + 1}
                  </span>
                </div>
              )}

              {/* Main Image Container (No Rounded Corners) */}
              <div className="relative overflow-hidden bg-[#0F172A]/40 border border-white/5 shadow-lg group">
                <CachedImage
                  src={src}
                  alt={`${title} hero ${index + 1}`}
                  onLoad={(e) => handleImageLoad(index, e)}
                  className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />

                {/* Public View: subtle hover zoom icon */}
                {!editable && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Mode Controls: Order Badge + Move Arrows + Delete */}
              {editable && (
                <>
                  {/* Top Bar: Order Badge + Delete Button */}
                  <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-md border border-white/15">
                      <span className="text-amber-400">⠿</span>
                      <span>#{index + 1}</span>
                    </div>

                    {onRemove && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemove(index)
                        }}
                        className="w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-500 active:scale-95 text-white text-xs font-black flex items-center justify-center transition-all shadow-lg border border-white/30 hover:scale-105"
                        title="Delete image from Hero Grid"
                        aria-label={`Delete image #${index + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Bottom Bar: Orientation Label + Reorder Controls */}
                  <div className="absolute bottom-2 inset-x-2 z-20 flex items-center justify-between pointer-events-auto gap-1">
                    {orientationLabel ? (
                      <span className="bg-black/85 backdrop-blur text-[9px] font-medium text-textSecondary border border-white/15 px-2 py-0.5 rounded-md shadow truncate max-w-[100px]">
                        {orientationLabel}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-0.5 bg-black/85 backdrop-blur border border-white/15 p-0.5 rounded-lg shadow">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveToEdge(index, 'start')
                        }}
                        className="w-4 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move to first position (#1)"
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
                        className="w-4 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move left / earlier"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveItem(index, 1)
                        }}
                        className="w-4 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move right / later"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveToEdge(index, 'end')
                        }}
                        className="w-4 h-5 rounded bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold flex items-center justify-center disabled:opacity-20 transition-colors"
                        title="Move to last position"
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

        {/* Blank Drop Zone Tile */}
        {editable && draggedIdx !== null && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={handleContainerDrop}
            className="break-inside-avoid mb-4 min-h-[160px] border-2 border-dashed border-amber-400/60 bg-amber-500/10 backdrop-blur flex flex-col items-center justify-center p-4 text-center text-amber-400 animate-pulse cursor-pointer shadow-lg"
          >
            <span className="text-xl mb-1">📥</span>
            <span className="text-xs font-bold">Drop here to move to end</span>
            <span className="text-[10px] opacity-70">or drop onto any card to slot in</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroMasonryGrid
