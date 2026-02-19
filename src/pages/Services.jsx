import { useState } from 'react'
import { services, pricingPlans, testimonials } from '../data/content'
import CinematicStackedCarousel from '../components/packages/CinematicStackedCarousel'
import { TestimonialCard } from '../components/sections/Testimonials'

const FAQ_ITEMS = [
  {
    q: 'How do I choose the right package for my business?',
    a: 'We recommend starting with a free discovery call. Our team will audit your current digital presence and suggest the plan that best fits your goals, budget, and timeline. Most small businesses start with Starter or Growth and scale up as results come in.',
  },
  {
    q: 'Can I upgrade or downgrade my plan at any time?',
    a: 'Absolutely. All plans are month-to-month with no lock-in contracts. You can upgrade instantly and downgrades take effect at the start of the next billing cycle.',
  },
  {
    q: 'What does onboarding look like?',
    a: 'Once you sign up, you\'ll receive a welcome kit and be paired with a dedicated account manager within 24 hours. Onboarding typically takes 5–7 business days and includes brand auditing, channel setup, and strategy alignment.',
  },
  {
    q: 'Do you work with international clients?',
    a: 'Yes — we work with clients across the globe. All strategy sessions are held over video call and deliverables are shared via our client portal, so location is never a barrier.',
  },
  {
    q: 'How are results tracked and reported?',
    a: 'Every plan includes a monthly analytics report. Growth and above also receive a custom dashboard with real-time KPIs. Pro and Enterprise clients get a dedicated BI integration and bi-weekly executive reviews.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'There is a one-time onboarding fee for Starter ($199) and Growth ($299) plans. Pro and Enterprise plans include complimentary onboarding as part of the package.',
  },
]

const FaqItem = ({ item, index, isOpen, onToggle }) => {
  const alwaysOpen = index === 0
  const open = alwaysOpen || isOpen

  return (
    <div
      className={`
        rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          open
            ? 'border-accent/40 bg-surface/60 shadow-[0_0_28px_rgba(37,99,235,0.18)]'
            : 'border-borderSubtle bg-surface/30 hover:border-accent/20 hover:shadow-[0_0_16px_rgba(37,99,235,0.08)]'
        }
      `}
    >
      <button
        onClick={() => !alwaysOpen && onToggle(index)}
        className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left ${
          alwaysOpen ? 'cursor-default' : 'cursor-pointer'
        }`}
        aria-expanded={open}
      >
        <span className={`font-heading font-semibold text-base md:text-lg leading-snug ${
          open ? 'text-textPrimary' : 'text-textSecondary'
        }`}>
          {item.q}
        </span>
        {!alwaysOpen && (
          <span
            className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
              open
                ? 'border-accent bg-accent/10 text-accent rotate-180'
                : 'border-borderSubtle text-textSecondary rotate-0'
            }`}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {alwaysOpen && (
          <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Popular
          </span>
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-6 text-sm leading-relaxed text-textSecondary">
          {item.a}
        </p>
      </div>
    </div>
  )
}

const ServiceDetailCard = ({ service, index }) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
      <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
        <div className="text-5xl mb-6">{service.icon}</div>
        <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
          {service.title}
        </h3>
        <p className="text-textSecondary text-lg leading-relaxed mb-6">
          {service.description}
        </p>
        <ul className="space-y-3">
          {['Strategic Planning', 'Implementation', 'Analytics & Optimization'].map((item) => (
            <li key={item} className="flex items-center text-textSecondary">
              <svg
                className="w-5 h-5 mr-3 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
        <div className="aspect-square rounded-2xl bg-surface flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl">{service.icon}</div>
            <p className="text-textSecondary">Service Image {index + 1}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Services = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            Our Services
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Comprehensive digital marketing solutions tailored to your business needs. From strategy to execution, we deliver results that matter.
          </p>
        </div>

        {/* Pricing / Packages Carousel */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-textPrimary mb-3">Our Packages</h2>
            <p className="text-textSecondary max-w-xl mx-auto text-sm">Choose a plan that fits your goals — upgrade anytime.</p>
          </div>
          <CinematicStackedCarousel items={pricingPlans} />
        </div>

        {/* Services List */}
        <div className="space-y-32">
          {services.map((service, index) => (
            <ServiceDetailCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-6">
              Our Process
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              A proven methodology that delivers consistent results
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals and challenges' },
              { step: '02', title: 'Strategy', desc: 'Crafting a tailored approach' },
              { step: '03', title: 'Execution', desc: 'Bringing the plan to life' },
              { step: '04', title: 'Optimization', desc: 'Continuous improvement' },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 text-center">
                <div className="text-5xl font-heading font-bold text-accent/30 mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-heading font-bold text-textPrimary mb-3">
                  {item.title}
                </h4>
                <p className="text-textSecondary">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-accent/10 border border-accent/20 text-accentLight">
              Client Stories
            </span>
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-4">
              Trusted by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentLight">
                Industry Leaders
              </span>
            </h2>
            <p className="text-textSecondary max-w-xl mx-auto">
              Real results from real partnerships — hear directly from the brands we&apos;ve helped grow.
            </p>
          </div>

          {/* Glow backdrop */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.id} t={t} featured={i === 0} />
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-4">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentLight">
                Questions
              </span>
            </h2>
            <p className="text-textSecondary max-w-xl mx-auto">
              Everything you need to know before getting started.
            </p>
          </div>

          {/* Outer glow wrapper */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-4 rounded-3xl bg-accent/5 blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="relative space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <FaqItem
                  key={idx}
                  item={item}
                  index={idx}
                  isOpen={openFaq === idx}
                  onToggle={toggleFaq}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center glass-card p-12 rounded-3xl">
          <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
            Let's Discuss Your Project
          </h3>
          <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
            Ready to take your digital marketing to the next level? Get in touch with our team.
          </p>
          <a href="/contact" className="btn-primary inline-block">
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}

export default Services
