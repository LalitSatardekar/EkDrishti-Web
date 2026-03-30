import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getMindMapConfig } from './mindMapConfig'

/**
 * MindMapHero Component
 * Animated mind map hero section with "WE MANAGE" center and floating service bubbles
 * @param {string} serviceType - 'events', 'digitalMarketing', or 'production'
 */
const MindMapHero = ({ serviceType = 'events' }) => {
  const containerRef = useRef(null)
  const centerRef = useRef(null)
  const bubblesRef = useRef([])
  const linesRef = useRef([])

  const config = getMindMapConfig(serviceType)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Simple fade-in for reduced motion
        gsap.set([centerRef.current, bubblesRef.current, linesRef.current], {
          opacity: 1,
        })
        gsap.set(bubblesRef.current, {
          left: (i) => bubblesRef.current[i].dataset.left,
          top: (i) => bubblesRef.current[i].dataset.top,
        })
      } else {
        // Initial state: all bubbles at center
        gsap.set(bubblesRef.current, {
          scale: 0,
          opacity: 0,
          left: '50%',
          top: '50%',
        })

        gsap.set(linesRef.current, {
          opacity: 0,
          strokeDashoffset: 100,
        })

        // Animation timeline
        const tl = gsap.timeline({ delay: 0.3 })

        // 1. Fade in center text
        tl.fromTo(
          centerRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }
        )

        // 2. Expand bubbles to their positions
        tl.to(bubblesRef.current, {
          scale: 1,
          opacity: 1,
          left: (i) => {
            const bubble = bubblesRef.current[i]
            return bubble.dataset.left
          },
          top: (i) => {
            const bubble = bubblesRef.current[i]
            return bubble.dataset.top
          },
          duration: 1.5,
          ease: 'power2.out',
          stagger: 0.08,
        }, '-=0.3')

        // 3. Fade in connecting lines
        tl.to(linesRef.current, {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.inOut',
        }, '-=1.2')

        // 4. Gentle continuous floating animation
        bubblesRef.current.forEach((bubble, i) => {
          if (bubble) {
            gsap.to(bubble, {
              y: `+=${8}`,
              duration: 3 + (i % 3) * 0.5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: i * 0.15,
            })
          }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [serviceType])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-amber-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-accent/6 rounded-full blur-[110px]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mind map container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 py-20">
        <div className="relative w-full aspect-[16/10] max-h-[80vh]">
          {/* SVG for connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.1)" />
                <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.1)" />
              </linearGradient>
            </defs>
            {config.services.map((service, index) => {
              const centerX = 50
              const centerY = 50
              const bubbleX = 50 + service.position.x
              const bubbleY = 50 + service.position.y

              return (
                <line
                  key={service.id}
                  ref={(el) => (linesRef.current[index] = el)}
                  x1={`${centerX}%`}
                  y1={`${centerY}%`}
                  x2={`${bubbleX}%`}
                  y2={`${bubbleY}%`}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{
                    strokeDashoffset: 100,
                  }}
                />
              )
            })}
          </svg>

          {/* Center node - "WE MANAGE" */}
          <div
            ref={centerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 10 }}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-accent/20 to-amber-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              
              {/* Center content */}
              <div className="relative px-6 py-4 md:px-12 md:py-8 bg-surface/60 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold tracking-wider" style={{ color: '#F2A020' }}>
                  {config.centerText}
                </h1>
              </div>
            </div>
          </div>

          {/* Service bubbles */}
          {config.services.map((service, index) => {
            // Calculate position: center (50%) + offset
            const left = `calc(50% + ${service.position.x}%)`
            const top = `calc(50% + ${service.position.y}%)`

            return (
              <div
                key={service.id}
                ref={(el) => (bubblesRef.current[index] = el)}
                data-left={left}
                data-top={top}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: left,
                  top: top,
                  zIndex: 5,
                  willChange: 'transform',
                }}
              >
                <div className="relative group cursor-default">
                  {/* Golden glow effect */}
                  <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-amber-500/25 transition-all duration-500" />
                  
                  {/* Bubble content */}
                  <div className="relative px-4 py-2 md:px-6 md:py-3 bg-surface/50 backdrop-blur-md border border-amber-500/30 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300">
                    <span className="text-[10px] md:text-xs lg:text-sm font-medium text-textPrimary whitespace-nowrap tracking-wide">
                      {service.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs text-textSecondary uppercase tracking-widest">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-amber-500/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-amber-500/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        <h1>{config.centerText}</h1>
        <ul>
          {config.services.map((service) => (
            <li key={service.id}>{service.label}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default MindMapHero

// Made with Bob
