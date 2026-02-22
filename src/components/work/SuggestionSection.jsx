import { allCases } from '../../data/cases'
import { getSortedCases } from '../../lib/sortingEngine'
import SuggestionCard from './SuggestionCard'

const SuggestionSection = ({ currentProjectSlug, currentCategory }) => {
  const getSuggestedProjects = () => {
    // Same category, sorted by priority, excluding current item
    const same = getSortedCases(allCases, { category: currentCategory, sortBy: 'priority' })
      .filter((p) => p.slug !== currentProjectSlug)

    // Different category, featured/priority first
    const other = getSortedCases(allCases, { sortBy: 'priority' })
      .filter((p) => p.slug !== currentProjectSlug && p.category !== currentCategory)

    // Fill up to 4: up to 3 from same category, rest from other
    const sameSlice  = same.slice(0, 3)
    const otherSlice = other.slice(0, 4 - sameSlice.length)
    return [...sameSlice, ...otherSlice].slice(0, 4)
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
