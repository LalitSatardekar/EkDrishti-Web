import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const REELS = [
  {
    id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80',
    label: 'Brand Campaign',
    views: '1.2M',
  },
  {
    id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80',
    label: 'Lead Gen Ad',
    views: '847K',
  },
  {
    id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80',
    label: 'Product Launch',
    views: '2.4M',
  },
  {
    id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80',
    label: 'Analytics Reel',
    views: '631K',
  },
]

/* Play icon SVG */
const PlayIcon = () => (
  <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="rgba(245,158,11,0.85)" />
    <path d="M9.5 7.5l7 4.5-7 4.5V7.5z" fill="white" />
  </svg>
)

const ReelCard = ({ reel, cardRef }) => (
  <div
    ref={cardRef}
    className="group relative rounded-3xl overflow-hidden cursor-pointer
               shadow-[0_4px_32px_rgba(0,0,0,0.4)]
               hover:shadow-[0_8px_48px_rgba(245,158,11,0.18)]
               transition-shadow duration-500"
    style={{ aspectRatio: '9/16' }}
  >
    {/* Background image */}
    <img
      src={reel.thumbnail}
      alt={reel.label}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />

    {/* Play button — fades in on hover */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <PlayIcon />
    </div>

    {/* Bottom meta */}
    <div className="absolute bottom-0 left-0 right-0 px-5 py-5">
      <p className="text-textPrimary font-heading font-semibold text-sm">{reel.label}</p>
      <p className="text-textSecondary text-xs mt-0.5 flex items-center gap-1">
        <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        {reel.views} views
      </p>
    </div>

    {/* Top badge */}
    <div className="absolute top-4 left-4">
      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
        Reel
      </span>
    </div>
  </div>
)

const ReelsSection = () => {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 60, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.85, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            Content Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Reels
            </span>
          </h2>
          <p className="mt-4 text-textSecondary max-w-xl mx-auto">
            Short-form content engineered for virality. Every reel is crafted with data-backed hooks, brand storytelling, and platform-native design.
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-7">
          {REELS.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-textSecondary mt-8">
          Hover to preview · Click to watch full case study
        </p>
      </div>
    </section>
  )
}

export default ReelsSection
