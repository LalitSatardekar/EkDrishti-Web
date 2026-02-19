import { Link } from 'react-router-dom'
import { caseStudies } from '../../data/content'

const CaseStudyCard = ({ study }) => {
  return (
    <Link
      to={`/work/${study.slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/3]"
    >
      {/* Image Placeholder with gradient overlay */}
      <div className="absolute inset-0 bg-surface flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-textSecondary font-medium">CASE STUDY IMAGE</p>
          <p className="text-sm text-textSecondary/70">{study.client}</p>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <span className="text-amber-400 text-sm font-medium mb-2">
          {study.category}
        </span>
        <h3 className="text-3xl font-heading font-bold text-textPrimary mb-3 group-hover:text-amber-400 transition-colors duration-300">
          {study.title}
        </h3>
        <p className="text-textSecondary mb-4">
          {study.description}
        </p>
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
  return (
    <section className="py-24">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-amber-400 font-medium mb-4 block">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary mb-6">
            Featured Work
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Explore how we've helped leading brands achieve extraordinary results through strategic digital marketing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {caseStudies.map((study) => (
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
