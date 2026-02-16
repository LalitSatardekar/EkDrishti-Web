import { Link } from 'react-router-dom'

const SuggestionCard = ({ project }) => {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
    >
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-surface flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-textSecondary/50 text-sm">CASE STUDY IMAGE</p>
            <p className="text-textSecondary/30 text-xs">{project.client}</p>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <span className="inline-block px-3 py-1 bg-accent/10 text-accentLight text-xs font-medium rounded-full mb-3 w-fit">
            {project.category}
          </span>
          <h3 className="text-2xl font-heading font-bold text-textPrimary mb-2 group-hover:text-accent transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-textSecondary text-sm line-clamp-2 mb-4">
            {project.description}
          </p>
          <div className="flex items-center text-accent text-sm font-medium">
            View Project
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300"
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
      </div>
    </Link>
  )
}

export default SuggestionCard
