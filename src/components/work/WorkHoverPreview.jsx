import { useRef, useEffect, useState } from 'react'

const IFRAME_W     = 1280
const SCROLL_SPEED = 100

// Compute the fixed position for the preview based on the card element's live rect
const getPos = (el) => {
  const r    = el.getBoundingClientRect()
  const boxW = Math.round(r.width  * 1.15)
  const boxH = Math.round(boxW * (3 / 4))
  const vw   = window.innerWidth
  const vh   = window.innerHeight
  let left   = r.left + (r.width  - boxW) / 2
  let top    = r.top  + (r.height - boxH) / 2
  if (top + boxH > vh - 8) top = vh - boxH - 8
  if (top < 8)             top = 8
  left = Math.max(8, Math.min(left, vw - boxW - 8))
  return { boxW, boxH, left, top }
}

const WorkHoverPreview = ({ item, anchorEl }) => {
  const iframeRef = useRef(null)
  const rafRef    = useRef(null)
  const t0Ref     = useRef(null)
  const [loaded, setLoaded]   = useState(false)
  const [pos,    setPos]      = useState(() => getPos(anchorEl))

  const { boxW, boxH, left, top } = pos
  const scale   = boxW / IFRAME_W
  const iframeH = Math.round(boxH / scale)

  // Keep preview glued to card on scroll / resize
  useEffect(() => {
    const update = () => setPos(getPos(anchorEl))
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [anchorEl])

  // Auto-scroll once iframe has loaded
  useEffect(() => {
    if (!loaded) return
    const win = iframeRef.current?.contentWindow
    if (!win) return

    win.scrollTo(0, 0)
    t0Ref.current = null

    const step = (ts) => {
      if (t0Ref.current === null) t0Ref.current = ts
      const dt        = (ts - t0Ref.current) / 1000
      const docH      = win.document?.documentElement?.scrollHeight ?? iframeH
      const maxScroll = docH - iframeH
      if (maxScroll <= 0) return

      const nextY = Math.min(dt * SCROLL_SPEED, maxScroll)
      win.scrollTo(0, nextY)

      if (nextY < maxScroll) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setTimeout(() => {
          if (!iframeRef.current) return
          iframeRef.current.contentWindow?.scrollTo(0, 0)
          t0Ref.current = null
          rafRef.current = requestAnimationFrame(step)
        }, 1500)
      }
    }

    const tid = setTimeout(() => { rafRef.current = requestAnimationFrame(step) }, 600)
    return () => { clearTimeout(tid); cancelAnimationFrame(rafRef.current) }
  }, [loaded, iframeH])

  return (
    <div
      style={{
        position:      'fixed',
        left,
        top,
        width:         boxW,
        height:        boxH,
        zIndex:        9999,
        borderRadius:  16,
        overflow:      'hidden',
        boxShadow:     '0 0 0 2px rgba(99,179,237,0.5), 0 24px 64px rgba(0,0,0,0.85)',
        background:    '#0d0f1e',
        animation:     'hoverIn 380ms cubic-bezier(0.34,1.56,0.64,1) both',
        pointerEvents: 'none',
      }}
    >
      {/* Shimmer while loading */}
      {!loaded && (
        <div style={{
          position:       'absolute',
          inset:          0,
          background:     'linear-gradient(135deg, #1a1d35 25%, #22263d 50%, #1a1d35 75%)',
          backgroundSize: '400% 400%',
          animation:      'shimmer 1.4s ease infinite',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'sans-serif' }}>
            Loading…
          </span>
        </div>
      )}

      {/* Scaled-down iframe of the real case page */}
      <iframe
        ref={iframeRef}
        src={`/work/${item.slug}?preview=1`}
        title={item.title}
        scrolling="no"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        style={{
          position:        'absolute',
          top:             0,
          left:            0,
          width:           IFRAME_W,
          height:          iframeH,
          border:          'none',
          transformOrigin: 'top left',
          transform:       `scale(${scale})`,
          pointerEvents:   'none',
          opacity:         loaded ? 1 : 0,
          transition:      'opacity 300ms ease',
        }}
      />

      {/* Bottom fade overlay */}
      <div style={{
        position:      'absolute',
        inset:         0,
        pointerEvents: 'none',
        background:    'linear-gradient(to bottom, transparent 65%, rgba(7,7,20,0.9) 100%)',
      }} />

      <style>{`
        @keyframes hoverIn {
          0%   { opacity: 0; transform: scale(0.78) translateY(18px); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0;  }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export default WorkHoverPreview
