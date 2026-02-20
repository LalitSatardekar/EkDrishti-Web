import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AnimatedCounter from '../ui/AnimatedCounter'

gsap.registerPlugin(ScrollTrigger)

const METRICS = [
  { prefix: '', value: 1.2, suffix: 'M+', decimals: 1, label: 'Total Reach', icon: '📡' },
  { prefix: '', value: 8.4, suffix: '%',  decimals: 1, label: 'Engagement Rate', icon: '💬' },
  { prefix: '',  value: 3,   suffix: 'X',  decimals: 0, label: 'Average ROI',  icon: '📈' },
  { prefix: '', value: 250, suffix: 'K',  decimals: 0, label: 'Conversions',   icon: '🎯' },
  { prefix: '', value: 98,  suffix: '%',  decimals: 0, label: 'Client Retention', icon: '🤝' },
  { prefix: '', value: 150, suffix: '+',  decimals: 0, label: 'Brands Scaled', icon: '🚀' },
]

const MOCKUP_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    alt: 'Campaign analytics dashboard',
    classes: 'w-full h-48 object-cover rounded-2xl',
  },
  {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    alt: 'Marketing data visualisation',
    classes: 'w-3/4 h-36 object-cover rounded-2xl ml-auto',
  },
  {
    src: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80',
    alt: 'Growth metrics overview',
    classes: 'w-5/6 h-40 object-cover rounded-2xl',
  },
]

const StaticsSection = () => {
  const sectionRef = useRef(null)
  const imagesRef = useRef([])
  const metricsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // staggered float-in for mockup images
      gsap.fromTo(
        imagesRef.current,
        { opacity: 0, x: -40, y: 20 },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.9, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        }
      )

      // subtle floating loop on images
      imagesRef.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          y: i % 2 === 0 ? -8 : 6,
          duration: 3 + i * 0.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.4,
        })
      })

      // metrics grid reveal
      if (metricsRef.current) {
        gsap.fromTo(
          metricsRef.current.children,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, ease: 'back.out(1.4)', stagger: 0.08,
            scrollTrigger: { trigger: metricsRef.current, start: 'top 80%', once: true },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-accent/6 rounded-full blur-[100px]" />
      </div>

      {/* noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-container">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            Results That Speak
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary">
            Campaign{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Statics
            </span>
          </h2>
          <p className="mt-4 text-textSecondary max-w-xl mx-auto">
            Numbers that define our impact — aggregated across 150+ brands, 500+ campaigns, and a decade of digital excellence.
          </p>
        </div>

        {/* Main panel */}
        <div className="rounded-3xl border border-borderSubtle bg-surface/30 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.08)]">
          <div className="grid lg:grid-cols-5 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-borderSubtle">

            {/* LEFT — stacked mockup images */}
            <div className="lg:col-span-2 p-8 flex flex-col gap-5 justify-center bg-gradient-to-br from-accent/5 to-transparent">
              {MOCKUP_IMAGES.map((img, i) => (
                <div
                  key={i}
                  ref={(el) => (imagesRef.current[i] = el)}
                  className="overflow-hidden rounded-2xl border border-borderSubtle shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                >
                  <img src={img.src} alt={img.alt} className={img.classes} />
                </div>
              ))}
            </div>

            {/* RIGHT — metrics grid */}
            <div className="lg:col-span-3 p-8 md:p-12">
              <p className="text-textSecondary text-sm font-medium uppercase tracking-widest mb-8">
                Aggregated performance metrics
              </p>
              <div ref={metricsRef} className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {METRICS.map((m) => (
                  <div
                    key={m.label}
                    className="glass-card p-5 rounded-2xl flex flex-col gap-2
                               hover:border-amber-500/30 hover:shadow-[0_0_24px_rgba(245,158,11,0.08)]
                               transition-all duration-300 group"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="text-3xl font-heading font-bold text-amber-400">
                      <AnimatedCounter
                        target={m.value}
                        prefix={m.prefix}
                        suffix={m.suffix}
                        decimals={m.decimals}
                        duration={2.2}
                      />
                    </div>
                    <p className="text-xs text-textSecondary font-medium leading-snug">{m.label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-xs text-textSecondary/60">
                * Data aggregated across all managed accounts. Updated quarterly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StaticsSection
