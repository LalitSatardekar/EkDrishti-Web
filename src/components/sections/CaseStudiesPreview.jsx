import { Link } from 'react-router-dom'
import { useCases } from '../../context/CasesContext'
import { getSortedCases } from '../../lib/sortingEngine'
import { trackCaseClick } from '../../lib/analytics'

export const PORTFOLIO_GROUPS = [
  { service: 'family-events', slug: 'events', title: 'Events', columns: 'lg:grid-cols-4', limit: 8 },
  { service: 'digital-marketing', slug: 'digital-marketing', title: 'Digital Marketing', columns: 'lg:grid-cols-2', limit: 6 },
  { service: 'production', slug: 'production', title: 'Production', columns: 'lg:grid-cols-3', limit: 6 },
]
export const IMAGE_FALLBACK = '/assets/image-placeholder.svg'
export const imageFallback = event => { event.currentTarget.onerror = null; event.currentTarget.src = IMAGE_FALLBACK }

export const CaseStudyCard = ({ study }) => <Link to={'/work/' + study.slug} onClick={() => trackCaseClick(study, 'portfolio')} className="reveal-card case-card" aria-label={'View Case Study: ' + study.title}>
  <img src={study.thumbnail || study.image || IMAGE_FALLBACK} onError={imageFallback} alt={study.title} loading="lazy" width="800" height="600" />
  <div className="card-reveal"><h3 className="text-lg md:text-xl font-bold text-white">{study.title}</h3><span className="mt-3 block text-sm font-semibold text-amber-400">View Case Study →</span></div>
</Link>

export const PortfolioGroup = ({ group, home = false }) => {
  const { allCases, loading } = useCases()
  const cases = getSortedCases(allCases, { service: group.service, featured: home, limit: group.limit })
  return <section className="portfolio-group" aria-label={group.title}>
    <div className="text-center mb-7"><h2 className="text-2xl md:text-3xl font-semibold">{home ? group.title : group.title + ' Case Studies'}</h2>
      {!home && <p className="text-textSecondary mt-3">Explore our work in {group.title.toLowerCase()}.</p>}</div>
    {cases.length ? <div className={'grid sm:grid-cols-2 ' + group.columns + ' gap-4 md:gap-6'}>{cases.map(study => <CaseStudyCard key={study.slug || study.id} study={study} />)}</div> : <p role="status" className="text-center text-textSecondary py-10">{loading ? 'Loading projects…' : home ? 'Featured projects will be shared here soon.' : 'Projects will be shared here soon.'}</p>}
    <div className="text-center mt-8"><Link className="portfolio-button" to={'/work?category=' + group.slug}>View More {group.title}</Link></div>
  </section>
}
export default function CaseStudiesPreview() {
  return <section className="section-container py-12 md:py-16"><h2 className="text-center text-3xl md:text-4xl font-bold mb-10">Portfolios</h2>{PORTFOLIO_GROUPS.map(group => <PortfolioGroup key={group.service} group={group} home />)}</section>
}
