import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { trackCaseClick } from '../../lib/analytics'
import { selectDynamicHeroImages } from '../../lib/heroSelector'

/**
 * WorkPreviewModal
 * Quick-preview modal with dynamic image placement (zero cropping).
 */
const WorkPreviewModal = ({ item, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const heroImages = (item?.hero && item.hero.length > 0)
    ? item.hero.slice(0, 6)
    : selectDynamicHeroImages(item, { min: 5, max: 6 }).images

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <div
        className="relative w-full max-w-[480px] rounded-3xl overflow-hidden"
        style={{
          background: '#0f1123',
          border: '2px solid rgba(99,179,237,0.55)',
          boxShadow: '0 0 0 4px rgba(99,179,237,0.12), 0 32px 80px rgba(0,0,0,0.7)',
          animation: 'previewIn 280ms cubic-bezier(0.34,1.4,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner dots (decorative) */}
        <span className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-blue-400/60 z-10" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-400/60 z-10" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          aria-label="Close preview"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>

        {/* Photo grid - dynamic images fully visible */}
        <div className="p-3 pb-0">
          <div className="grid grid-cols-3 gap-2">
            {heroImages.slice(0, 6).map((src, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-black/40 flex items-center justify-center aspect-[3/4] border border-white/5"
              >
                <img src={src} alt="" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Video chip */}
        {item.hasVideo && (
          <div className="px-2.5 pt-2 pb-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              {/* Play icon */}
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                  <path d="M1.5 1.5l5 3-5 3V1.5z" fill="#f59e0b" />
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium">Video</span>
            </div>
          </div>
        )}

        {/* Footer — title + CTA */}
        <div className="p-4 pt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-blue-300/70 uppercase tracking-widest mb-0.5">
              {item.subCategory || item.category}
            </p>
            <h3 className="text-white font-heading font-bold text-base leading-snug truncate">
              {item.title}
            </h3>
            {item.client && (
              <p className="text-white/45 text-xs mt-0.5 truncate">{item.client}</p>
            )}
          </div>
          <Link
            to={`/work/${item.slug}`}
            onClick={() => {
              trackCaseClick(item, 'work_preview_modal')
              onClose()
            }}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-full transition-colors"
          >
            View Case →
          </Link>
        </div>
      </div>

      {/* Keyframe injected inline */}
      <style>{`
        @keyframes previewIn {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default WorkPreviewModal
