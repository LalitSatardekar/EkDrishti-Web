import { useState } from 'react'

export const FAQ_ITEMS = [
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
    a: "Once you sign up, you'll receive a welcome kit and be paired with a dedicated account manager within 24 hours. Onboarding typically takes 5–7 business days and includes brand auditing, channel setup, and strategy alignment.",
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

const FaqItem = ({ item, index, isOpen, onToggle }) => (
  <div
    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isOpen
        ? 'border-[#F2A020]/40 bg-surface/60 shadow-[0_0_28px_rgba(242,160,32,0.18)]'
        : 'border-borderSubtle bg-surface/30 hover:border-[#F2A020]/20 hover:shadow-[0_0_16px_rgba(242,160,32,0.08)]'
    }`}
  >
    <button
      onClick={() => onToggle(index)}
      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      aria-expanded={isOpen}
    >
      <span
        className={`font-heading font-semibold text-base md:text-lg leading-snug ${
          isOpen ? 'text-textPrimary' : 'text-textSecondary'
        }`}
      >
        {item.q}
      </span>
      <span
        className={`shrink-0 flex items-center justify-center transition-transform duration-300 text-[#F2A020] ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 4.5L6 8L10 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>

    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <p className="px-6 pb-6 text-sm leading-relaxed text-textSecondary">{item.a}</p>
    </div>
  </div>
)

const FAQ = ({ items = FAQ_ITEMS }) => {
  const [openFaq, setOpenFaq] = useState(0)

  const toggle = (idx) => setOpenFaq((prev) => (prev === idx ? null : idx))

  return (
    <div className="mt-16 mb-16">
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

      <div className="relative max-w-3xl mx-auto">
        <div
          className="absolute -inset-4 rounded-3xl bg-accent/5 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative space-y-3">
          {items.map((item, idx) => (
            <FaqItem
              key={idx}
              item={item}
              index={idx}
              isOpen={openFaq === idx}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
