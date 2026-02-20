import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Decorative scribble/wave SVG — animated line-draw via GSAP stroke-dashoffset */
const ScribbleLines = ({ svgRef }) => (
  <svg
    ref={svgRef}
    viewBox="0 0 420 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[380px] opacity-60"
    aria-hidden="true"
  >
    {[
      'M10 40 C60 10, 120 70, 180 40 S300 10, 360 40 S410 70, 420 50',
      'M10 90 C50 60, 130 120, 200 90 S310 55, 370 90 S415 115, 420 100',
      'M10 140 C70 100, 150 170, 220 140 S330 105, 390 140 S418 155, 420 148',
      'M10 190 C55 160, 140 210, 210 190 S320 160, 385 190 S416 200, 420 195',
      'M10 235 C65 205, 145 255, 215 235 S325 210, 390 235',
    ].map((d, i) => (
      <path
        key={i}
        d={d}
        stroke="url(#scribble-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        style={{ strokeDasharray: 600, strokeDashoffset: 600 }}
        className={`scribble-path-${i}`}
      />
    ))}
    <defs>
      <linearGradient id="scribble-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
      </linearGradient>
    </defs>
  </svg>
)

const StorySection = () => {
  const sectionRef = useRef(null)
  const mediaRef = useRef(null)
  const textRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Media reveal
      gsap.fromTo(
        mediaRef.current,
        { scale: 0.92, opacity: 0, y: 40 },
        {
          scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: mediaRef.current, start: 'top 80%', once: true },
        }
      )

      // Text block reveal
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: textRef.current, start: 'top 80%', once: true },
        }
      )

      // SVG line draw
      if (svgRef.current) {
        const paths = svgRef.current.querySelectorAll('path')
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: 'power2.inOut',
          stagger: 0.18,
          scrollTrigger: { trigger: svgRef.current, start: 'top 85%', once: true },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Ambient glow blob */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container">
        {/* Section label */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            Who We Are
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Story
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* LEFT — Media */}
          <div ref={mediaRef} className="relative">
            {/* Glow halo */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent/20 to-amber-500/10 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-borderSubtle shadow-[0_0_60px_rgba(37,99,235,0.15)]">
              {/* Campaign image placeholder — swap src for real asset */}
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=85"
                alt="Ekdrishti digital campaign"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-primary/20 to-transparent" />
              {/* floating badge */}
              <div className="absolute bottom-6 left-6 px-4 py-2 glass-card rounded-xl flex items-center gap-2 backdrop-blur">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-textPrimary">Live campaigns running</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Text + scribble */}
          <div ref={textRef} className="space-y-7">
            <p className="text-2xl md:text-3xl font-heading font-bold text-textPrimary leading-snug">
              Built for brands that{' '}
              <span className="text-amber-400">demand results</span>,<br />
              not just visibility.
            </p>
            <p className="text-textSecondary text-lg leading-relaxed">
              Ekdrishti was founded on a single belief: that great marketing isn't about noise — it's about precision. We combine data science, creative storytelling, and platform expertise to build campaigns that move the needle in measurable ways.
            </p>
            <p className="text-textSecondary leading-relaxed">
              From hyper-targeted paid media to organic content ecosystems, every strategy we craft is rooted in your brand's unique voice and backed by real-time analytics. We don't guess — we test, iterate, and scale.
            </p>

            {/* Animated scribble lines */}
            <div className="pt-2 pl-1">
              <ScribbleLines svgRef={svgRef} />
            </div>

            {/* Quick trust chips */}
            <div className="flex flex-wrap gap-3 pt-2">
              {['Meta Partner', 'Google Certified', 'ISO-9001 Quality', '10+ Yr Experience'].map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1.5 text-xs font-medium bg-surface/60 border border-borderSubtle rounded-full text-textSecondary"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StorySection
