import { Link } from 'react-router-dom'
import { allCases } from '../../data/cases'
import { getSortedCases } from '../../lib/sortingEngine'

const CaseStudyCard = ({ study }) => {
  return (
    <Link
      to={`/work/${study.slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/3]"
    >
      <img
        src={study.image}
        alt={study.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end space-y-3">
       {/* <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold w-fit">
          {study.category}
        </span>*/}
        <div>
          <h3 className="text-xl lg:text-3xl font-heading font-bold text-textPrimary mb-2 lg:mb-3 group-hover:text-amber-400 transition-colors duration-300">
            {study.title}
          </h3>
          
        </div>
        <div className="flex items-center text-amber-400 font-medium">
          View Case Study
          <svg
            className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

const CaseStudiesPreview = () => {
  const featured = getSortedCases(allCases, { featured: true, sortBy: 'priority', limit: 6 })
  const fallback = featured.length > 0 ? featured : getSortedCases(allCases, { sortBy: 'priority', limit: 6 })

  return (
    <section className="lg:py-5 px-8 md:py-24">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-amber-400 font-medium mb-4 block">Success Stories</span>
          <h2 className="text-3xl md:text-4xl lg:text-5 font-heading font-bold text-textPrimary mb-4 md:mb-6">
            Dreams we built, together
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Explore how we've helped leading brands achieve extraordinary results through strategic digital marketing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {fallback.map((study) => (
            <CaseStudyCard key={study.id} study={study} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/work" className="btn-secondary inline-block">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CaseStudiesPreview
