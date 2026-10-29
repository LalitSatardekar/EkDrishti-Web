import { useState } from 'react'
import { Link } from 'react-router-dom'
import EventsTypingHero from '../hero/EventsTypingHero'
import FAQ from '../sections/FAQ'
import ContactModal from '../ui/ContactModal'
import SEO from '../ui/SEO'
import { PortfolioGroup, PORTFOLIO_GROUPS } from '../sections/CaseStudiesPreview'
import { servicePages } from '../../data/servicePages'
import { trackButtonClick } from '../../lib/analytics'

export default function ServicePage({ service, children }) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const config = servicePages[service]
  const group = PORTFOLIO_GROUPS.find(group => group.service === service)
  return <div className="service-page bg-primary">
    <SEO title={config.title} description={config.description} />
    <EventsTypingHero serviceType={config.heroType} />
    {children}
    <div className="section-container"><PortfolioGroup group={group} /><FAQ items={config.faqs} />
      <section className="service-cta text-center glass-card px-5 py-10 md:p-12 mb-16">
        <h2 className="text-2xl md:text-4xl font-bold">{config.cta}</h2><p className="text-textSecondary max-w-2xl mx-auto mt-4 mb-7">{config.description}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4"><button className="portfolio-button" onClick={() => { trackButtonClick(config.action, service + '_cta'); setIsContactOpen(true) }}>{config.action}</button><Link className="btn-secondary" to={'/work?category=' + group.slug}>{config.explore}</Link></div>
      </section>
    </div>
    <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} initialService={service} />
  </div>
}
