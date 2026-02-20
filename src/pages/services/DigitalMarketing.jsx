import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StorySection from '../../components/digital/StorySection'
import ReelsSection from '../../components/digital/ReelsSection'
import StaticsSection from '../../components/digital/StaticsSection'
import InsightsSection from '../../components/digital/InsightsSection'
import FAQ from '../../components/sections/FAQ'

gsap.registerPlugin(ScrollTrigger)

/* ─── Hero ────────────────────────────────────────────────────── */
const Hero = () => {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out', stagger: 0.13 }
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-32">
      {/* Radial glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-amber-500/6 rounded-full blur-[110px]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div ref={heroRef} className="section-container text-center z-10 space-y-7">
        <span className="inline-block px-5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-semibold tracking-wide">
          Digital Marketing Services
        </span>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-textPrimary leading-tight max-w-4xl mx-auto">
          Grow Your Brand{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
            Digitally
          </span>
        </h1>

        <p className="text-xl text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Data-driven digital marketing strategies that elevate your brand, expand your reach, and convert audiences into loyal customers — measurably and at scale.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <a href="/contact" className="btn-primary inline-block text-center px-8 py-4 text-base shadow-[0_0_24px_rgba(37,99,235,0.3)] hover:shadow-[0_0_36px_rgba(37,99,235,0.45)]">
            Start Your Campaign
          </a>
          <a href="#insights" className="btn-secondary inline-block text-center px-8 py-4 text-base">
            View Analytics
          </a>
        </div>

        {/* Quick service chips */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {['Social Media', 'SEO & SEM', 'Paid Ads', 'Content', 'Email', 'Analytics'].map((t) => (
            <span key={t} className="px-4 py-1.5 text-xs font-medium bg-surface/50 border border-borderSubtle rounded-full text-textSecondary">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Services Grid ───────────────────────────────────────────── */
const SERVICES = [
  { icon: '📱', title: 'Social Media Management', desc: 'Strategic content creation and community management across all major platforms.' },
  { icon: '🔍', title: 'SEO & SEM', desc: 'Dominate search rankings with proven on-page, off-page, and paid search strategies.' },
  { icon: '✉️', title: 'Email Marketing', desc: 'Automated campaigns and personalised sequences that nurture leads and drive sales.' },
  { icon: '📊', title: 'Analytics & Reporting', desc: 'Real-time dashboards and monthly reports that turn data into actionable decisions.' },
  { icon: '🎯', title: 'Paid Advertising', desc: 'Hyper-targeted Meta, Google, and programmatic ads engineered for maximum ROI.' },
  { icon: '✍️', title: 'Content Marketing', desc: 'Compelling blogs, videos, and infographics that position your brand as an authority.' },
]

const ServicesGrid = () => {
  const gridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: gridRef.current, start: 'top 78%', once: true },
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-24 relative">
      <div className="section-container">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            What We Do
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Services
            </span>
          </h2>
          <p className="mt-4 text-textSecondary max-w-xl mx-auto">
            Full-spectrum digital marketing that covers every touchpoint of your customer's journey.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group glass-card p-8 hover:-translate-y-2 transition-all duration-300
                         hover:border-amber-500/30 hover:shadow-[0_0_28px_rgba(245,158,11,0.10)]"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-xl font-heading font-bold text-textPrimary mb-3 group-hover:text-amber-400 transition-colors duration-300">
                {s.title}
              </h3>
              <p className="text-textSecondary leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */
const DigitalMarketing = () => (
  <div className="bg-primary">
    {/* smooth scroll behaviour */}
    <style>{`html { scroll-behavior: smooth; }`}</style>

    <Hero />
    <ServicesGrid />
    <StorySection />
    <ReelsSection />
    <StaticsSection />
    <div id="insights">
      <InsightsSection />
    </div>
    <div className="section-container pb-24">
      <FAQ />
      <div className="mt-20 text-center glass-card p-12 rounded-3xl border-borderSubtle hover:border-accent/20 transition-all duration-300">
        <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
          Ready to Scale Your Brand?
        </h3>
        <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
          Let's build a data-driven strategy tailored to your goals. Our team is ready when you are.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" className="btn-primary inline-block px-8 py-4 shadow-[0_0_24px_rgba(37,99,235,0.3)]">
            Get a Free Audit
          </a>
          <a href="/work" className="btn-secondary inline-block px-8 py-4">
            View Our Work
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default DigitalMarketing
