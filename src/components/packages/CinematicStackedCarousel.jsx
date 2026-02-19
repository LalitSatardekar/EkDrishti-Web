/**
 * CinematicStackedCarousel
 * Stacked 3-card carousel with GSAP (gsap.timeline, power4.out, back.out, quickTo).
 * Uses ONLY existing project color tokens and Tailwind classes.
 *
 * Usage:
 *   <CinematicStackedCarousel items={services} />
 *
 * Each item shape:
 *   { id, title, subtitle, description, icon, image, features[] }
 */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'
import PackageCard from './PackageCard'

// ─── Slot definitions ────────────────────────────────────────────────────────
// All x values are in "%". GSAP's `x` with "%" is relative to the element width.
// We use the *outer container's* width via a translate trick instead —
// so all x values here are in px at runtime, set via a helper below.

const EASING = {
  main: 'power4.out',
  enter: 'back.out(1.4)',
}

const DUR = {
  exit: 0.42,
  shift: 0.52,
  enter: 0.62,
  appear: 0.38,
  stagger: 0.48,
}

// These are multipliers of container half-width — resolved to px at runtime
const X_SLOT = {
  hiddenLeft: -1.45,
  left: -0.6,
  center: 0,
  right: 0.6,
  hiddenRight: 1.45,
}

const SCALE = {
  hiddenLeft: 0.68,
  left: 0.87,
  center: 1,
  right: 0.87,
  hiddenRight: 0.68,
}

const OPACITY = {
  hiddenLeft: 0,
  left: 0.6,
  center: 1,
  right: 0.6,
  hiddenRight: 0,
}

const ROTATION_Y = {
  hiddenLeft: 28,
  left: 14,
  center: 0,
  right: -14,
  hiddenRight: -28,
}

const FILTER = {
  hiddenLeft: 'blur(8px)',
  left: 'blur(2.5px)',
  center: 'blur(0px)',
  right: 'blur(2.5px)',
  hiddenRight: 'blur(8px)',
}

const Z_INDEX = {
  hiddenLeft: 0,
  left: 2,
  center: 10,
  right: 2,
  hiddenRight: 0,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a slot name → gsap properties, with optional mobile override */
function slotProps(slotName, containerHalfWidth, isMobile) {
  const rotY = isMobile ? 0 : ROTATION_Y[slotName]
  const blurVal = isMobile
    ? slotName === 'center'
      ? 'blur(0px)'
      : 'blur(0px)'
    : FILTER[slotName]

  // On mobile hide side cards entirely
  const opVal =
    isMobile && slotName !== 'center'
      ? 0
      : OPACITY[slotName]

  return {
    x: X_SLOT[slotName] * containerHalfWidth,
    scale: SCALE[slotName],
    opacity: opVal,
    rotationY: rotY,
    filter: blurVal,
    zIndex: Z_INDEX[slotName],
  }
}

/** Which slot name belongs to an item index given an active index (linear, non-wrapping) */
function slotName(idx, activeIdx, N) {
  if (idx === activeIdx) return 'center'
  if (idx === activeIdx - 1) return 'left'
  if (idx === activeIdx + 1) return 'right'
  if (idx < activeIdx) return 'hiddenLeft'
  return 'hiddenRight'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CinematicStackedCarousel({ items = [] }) {
  const N = items.length

  // ── Refs ──
  const containerRef  = useRef(null)
  // Per-item outer wrapper (GSAP position, scale, opacity, rotationY)
  const wrapperRefs   = useRef([])
  // Per-item inner parallax layer (GSAP quickTo x/y)
  const parallaxRefs  = useRef([])
  // Stable view of active index for use inside GSAP callbacks
  const activeIdxRef  = useRef(0)
  const isAnimating   = useRef(false)
  const isMobile      = useRef(false)
  // Store quickTo functions for the currently active card's parallax layer
  const quickX        = useRef(null)
  const quickY        = useRef(null)
  // Store the gsap.context for cleanup
  const ctx           = useRef(null)

  // Only state that React cares about (for dots + PackageCard isActive prop)
  const [activeIndex, setActiveIndex] = useState(0)

  // ── Utility: resolve container half-width ──
  const halfWidth = useCallback(() => {
    if (!containerRef.current) return 280
    return containerRef.current.offsetWidth / 2
  }, [])

  // ── Mobile detection (SSR-safe) ──
  useEffect(() => {
    const update = () => {
      isMobile.current = window.innerWidth < 768
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── Initial GSAP position setup ──
  useLayoutEffect(() => {
    if (N === 0) return

    ctx.current = gsap.context(() => {
      const hw = halfWidth()
      items.forEach((_, idx) => {
        const wrapper = wrapperRefs.current[idx]
        if (!wrapper) return
        const sName = slotName(idx, 0, N)
        gsap.set(wrapper, {
          ...slotProps(sName, hw, isMobile.current),
          transformPerspective: 900,
        })
      })
    }, containerRef)

    return () => ctx.current?.revert()
  }, [N]) // only on mount / items change

  // ── Parallax ──
  const rebuildParallax = useCallback((idx) => {
    const pl = parallaxRefs.current[idx]
    if (!pl) return
    // Kill existing quickTo functions (they're just closures, no formal kill needed)
    quickX.current = gsap.quickTo(pl, 'x', { duration: 0.5, ease: 'power2.out' })
    quickY.current = gsap.quickTo(pl, 'y', { duration: 0.5, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    rebuildParallax(activeIndex)
  }, [activeIndex, rebuildParallax])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMove = (e) => {
      if (isAnimating.current || !quickX.current || !quickY.current) return
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / (rect.width / 2)   // –1 → +1
      const ny = (e.clientY - cy) / (rect.height / 2)
      quickX.current(nx * 6)
      quickY.current(ny * 4)
    }

    const onLeave = () => {
      quickX.current?.(0)
      quickY.current?.(0)
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Core navigation ──
  const navigate = useCallback(
    (direction) => {
      // Non-infinite: stop at boundaries
      if (direction === 'next' && activeIdxRef.current >= N - 1) return
      if (direction === 'prev' && activeIdxRef.current <= 0) return
      if (isAnimating.current || N < 2) return
      isAnimating.current = true

      const a   = activeIdxRef.current
      const hw  = halfWidth()
      const mob = isMobile.current

      const newActive   = direction === 'next' ? a + 1 : a - 1
      // The slot that was at the far side (may be out-of-bounds — guard before use)
      const oldOtherIdx = direction === 'next' ? a - 1 : a + 1
      // The new peek slot that will appear on the opposite side (may be OOB)
      const newPeekIdx  = direction === 'next' ? newActive + 1 : newActive - 1

      // Update ref immediately so callbacks see new value
      activeIdxRef.current = newActive

      const tl = gsap.timeline({
        onComplete() {
          isAnimating.current = false
          setActiveIndex(newActive)
        },
      })

      // Reset parallax of the outgoing center card
      const oldCenterPl = parallaxRefs.current[a]
      if (oldCenterPl) tl.set(oldCenterPl, { x: 0, y: 0 }, 0)

      // Push far-side card fully off screen (only if it exists)
      if (oldOtherIdx >= 0 && oldOtherIdx < N && wrapperRefs.current[oldOtherIdx]) {
        const exitSlot = direction === 'next' ? 'hiddenLeft' : 'hiddenRight'
        tl.to(wrapperRefs.current[oldOtherIdx], { ...slotProps(exitSlot, hw, mob), duration: DUR.exit, ease: EASING.main }, 0)
      }

      // Old center slides to side
      const centerToSide = direction === 'next' ? 'left' : 'right'
      tl.to(wrapperRefs.current[a], { ...slotProps(centerToSide, hw, mob), duration: DUR.shift, ease: EASING.main }, 0)

      // New center arrives with cinematic overshoot
      tl.to(wrapperRefs.current[newActive], { ...slotProps('center', hw, mob), duration: DUR.enter, ease: EASING.enter }, 0)

      // New peek card slides in from far side (only if it exists)
      if (newPeekIdx >= 0 && newPeekIdx < N && wrapperRefs.current[newPeekIdx]) {
        const peekSlot = direction === 'next' ? 'right' : 'left'
        const fromSlot = direction === 'next' ? 'hiddenRight' : 'hiddenLeft'
        tl.set(wrapperRefs.current[newPeekIdx], slotProps(fromSlot, hw, mob), 0)
        tl.to(wrapperRefs.current[newPeekIdx], { ...slotProps(peekSlot, hw, mob), duration: DUR.appear, ease: EASING.main }, DUR.exit * 0.6)
      }

      // Stagger text elements inside the incoming card
      const incomingWrapper = wrapperRefs.current[newActive]
      if (incomingWrapper) {
        const textEls = incomingWrapper.querySelectorAll('[data-stagger]')
        if (textEls.length) {
          tl.fromTo(
            textEls,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: DUR.stagger, ease: 'power3.out', stagger: 0.08 },
            DUR.enter * 0.55
          )
        }
      }
    },
    [N, halfWidth]
  )

  // ── Direct dot navigation (jump to any index) ──
  const navigateTo = useCallback(
    (targetIdx) => {
      // Clamp target to valid bounds — no wrapping
      const clamped = Math.max(0, Math.min(N - 1, targetIdx))
      if (isAnimating.current || clamped === activeIdxRef.current) return
      const a    = activeIdxRef.current
      const diff = Math.abs(clamped - a)

      // Adjacent → delegate to single-step navigate
      if (diff === 1) {
        navigate(clamped > a ? 'next' : 'prev')
        return
      }

      // Non-adjacent → cinematic crossfade
      isAnimating.current = true
      const hw  = halfWidth()
      const mob = isMobile.current

      activeIdxRef.current = clamped
      const tl = gsap.timeline({
        onComplete() {
          isAnimating.current = false
          setActiveIndex(clamped)
        },
      })

      wrapperRefs.current.forEach((el) => {
        if (!el) return
        tl.to(el, { opacity: 0, duration: 0.22, ease: 'power2.in' }, 0)
      })
      items.forEach((_, idx) => {
        const el = wrapperRefs.current[idx]
        if (!el) return
        const sName = slotName(idx, clamped, N)
        const props = slotProps(sName, hw, mob)
        tl.set(el, props, 0.25)
        tl.to(el, { opacity: props.opacity, duration: 0.38, ease: 'power2.out' }, 0.28)
      })

      const inEl = wrapperRefs.current[clamped]
      if (inEl) {
        const textEls = inEl.querySelectorAll('[data-stagger]')
        if (textEls.length) {
          tl.fromTo(
            textEls,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out', stagger: 0.07 },
            0.38
          )
        }
      }
    },
    [N, navigate, halfWidth, items]
  )

  // ── Keyboard ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // ── Touch / swipe ──
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let startX = 0
    const onStart = (e) => { startX = e.touches[0].clientX }
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) > 48) navigate(dx < 0 ? 'next' : 'prev')
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
    }
  }, [navigate])

  // ─── Render ───────────────────────────────────────────────────────────────
  if (N === 0) return null

  return (
    <section
      className="w-full py-16 overflow-hidden select-none"
      ref={containerRef}
      aria-label="Services carousel"
    >
      {/* Card track */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '520px', perspective: '1100px' }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id ?? idx}
            ref={(el) => (wrapperRefs.current[idx] = el)}
            className="absolute w-full max-w-[420px] will-change-transform cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            onClick={() => {
              if (idx !== activeIdxRef.current) {
                navigateTo(idx)
              }
            }}
          >
            {/* Parallax inner layer */}
            <div
              ref={(el) => (parallaxRefs.current[idx] = el)}
              className="w-full"
            >
              <PackageCard item={item} isActive={idx === activeIndex} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Navigation controls ── */}
      <div className="flex items-center justify-center gap-5 mt-10">
        {/* Prev */}
        <button
          onClick={() => navigate('prev')}
          disabled={activeIndex === 0}
          aria-label="Previous service"
          className={`group flex items-center justify-center w-10 h-10 rounded-full border bg-surface/40 backdrop-blur-sm transition-all duration-300 ${
            activeIndex === 0
              ? 'border-borderSubtle text-borderSubtle opacity-30 cursor-not-allowed'
              : 'border-borderSubtle text-textSecondary hover:border-accent hover:text-textPrimary'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Carousel slides">
          {items.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => navigateTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                idx === activeIndex
                  ? 'w-7 bg-accent'
                  : 'w-1.5 bg-borderSubtle hover:bg-textSecondary'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => navigate('next')}
          disabled={activeIndex === N - 1}
          aria-label="Next service"
          className={`group flex items-center justify-center w-10 h-10 rounded-full border bg-surface/40 backdrop-blur-sm transition-all duration-300 ${
            activeIndex === N - 1
              ? 'border-borderSubtle text-borderSubtle opacity-30 cursor-not-allowed'
              : 'border-borderSubtle text-textSecondary hover:border-accent hover:text-textPrimary'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}
