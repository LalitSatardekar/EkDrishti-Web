import { useState } from 'react'
import { Link } from 'react-router-dom'
import ContactModal from '../ui/ContactModal'

const CONTACT_ITEMS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'edadmin@ekdrishti.com',
    href: 'mailto:edadmin@ekdrishti.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+91 816 966 7383',
    href: 'tel:+918169667383',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Office',
    value: 'Mulund East, Mumbai\nMaharashtra 400081',
    href: 'https://maps.google.com/?q=Plot+no+20,+Room+no.+B,+Swaroop+CHS,+Mulund+-+Airoli+Rd,+MHADA+Colony,+Mulund+East,+Mumbai,+Maharashtra+400081',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Business Hours',
    value: 'Mon – Sun · 8:00 AM – 8:00 PM',
    href: null,
  },
]

const CTABand = () => {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="section-container">
            <h2 className="text-4xl font-heading font-semibold text-textPrimary text-center mb-6">
                  Get in Touch
                </h2>
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d1224 0%, #10111f 60%, #13102a 100%)' }}
          >
            {/* subtle amber glow bottom-right */}
            <div
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }}
            />
            {/* subtle blue glow top-left */}
            <div
              className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)' }}
            />
              
            <div className="relative z-10 grid lg:grid-cols-2 gap-0">
              {/* ── LEFT : CTA ───────────────────────────── */}
              <div className="px-10 py-14 md:px-14 md:py-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/6">
                <div className="text-amber-400 text-xs font-semibold tracking-[0.22em] uppercase mb-4">
                  Ekdrishti Studios
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary leading-tight mb-4">
                  Ready to create<br />
                  <span className="text-amber-400">something great</span>?
                </h2>
                <p className="text-textSecondary text-base leading-relaxed mb-8 max-w-sm">
                  Whether it's a family celebration, a brand campaign, or a cinematic production — we're here to bring your vision to life.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-500 hover:text-white-400 text-black font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-amber-500/30"
                  >
                    Contact Us
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <Link
                    to="/work"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-amber-500/15 text-textSecondary hover:text-amber-500 hover:border-amber-500/30 text-sm font-medium transition-all duration-200"
                  >
                    View Our Work
                  </Link>
                </div>
              </div>

              {/* ── RIGHT : Contact info ─────────────────── */}
              <div className="px-10 py-14 md:px-14 md:py-16">
                {/* here */}
                <div className="flex flex-col gap-5">
                  {CONTACT_ITEMS.map((item) => {
                    const content = (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/6 bg-white/2 hover:border-amber-500/20 hover:bg-amber-500/4 transition-all duration-200 group">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all duration-200">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs text-textSecondary font-medium uppercase tracking-wide mb-0.5">
                            {item.label}
                          </div>
                          <div className="text-textPrimary text-sm font-medium whitespace-pre-line leading-snug">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    )
                    return item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={item.label}>{content}</div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  )
}

export default CTABand
