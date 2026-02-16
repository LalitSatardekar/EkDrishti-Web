import { caseStudies } from '../../data/content'
import SuggestionCard from './SuggestionCard'

const SuggestionSection = ({ currentProjectSlug, currentCategory }) => {
  const getSuggestedProjects = () => {
    const sameCategory = caseStudies.filter(
      project => project.category === currentCategory && project.slug !== currentProjectSlug
    )
    
    const differentCategory = caseStudies.filter(
      project => project.category !== currentCategory && project.slug !== currentProjectSlug
    )
    
    const sameCategoryCount = Math.min(sameCategory.length, 3)
    const selectedSameCategory = sameCategory.slice(0, sameCategoryCount)
    
    const differentCategoryCount = Math.min(4 - sameCategoryCount, differentCategory.length)
    const selectedDifferentCategory = differentCategory.slice(0, differentCategoryCount)
    
    const suggestions = [...selectedSameCategory, ...selectedDifferentCategory].slice(0, 4)
    
    return suggestions
  }

  const suggestions = getSuggestedProjects()

  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="bg-secondary border-t border-borderSubtle py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary mb-4">
            Explore More Work
          </h2>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto">
            Discover other projects we've crafted with passion and precision
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {suggestions.map((project) => (
            <SuggestionCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SuggestionSection
