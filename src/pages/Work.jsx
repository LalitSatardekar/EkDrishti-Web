import { useState } from 'react'
import { Link } from 'react-router-dom'
import { allCases } from '../data/cases'
import { getSortedCases } from '../lib/sortingEngine'
import category1 from '../assets/work/category1.png'
import category2 from '../assets/work/category2.png'
import category3 from '../assets/work/category3.png'

// Sub-filter pills per top-level category
const CATEGORY_FILTERS = {
  'EVENTS':            ['All', 'Family Events', 'Corporate'],
  'DIGITAL MARKETING': ['All', 'Social Media', 'SEO', 'Paid Ads', 'Email', 'Content', 'Influencer'],
  'PRODUCTION':        ['All', 'Brand Film', 'Corporate', 'Music Video', 'Documentary', 'Product'],
}

const Work = () => {
  const [activeCategory,  setActiveCategory]  = useState('DIGITAL MARKETING')
  const [activeSubFilter, setActiveSubFilter] = useState('All')

  const handleCategoryChange = (name) => {
    setActiveCategory(name)
    setActiveSubFilter('All')
  }

  // Run through engine: filter by category (and optionally subCategory), sort by priority
  const filteredItems = getSortedCases(allCases, {
    category: activeCategory,
    ...(activeSubFilter !== 'All' && { subCategory: activeSubFilter }),
    sortBy: 'priority',
  })

  return (
    <div className="bg-primary">
      <div className="section-container px-[70px]">
        {/* Header */}
        

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px] max-w-[1300px] mx-auto py-16">
          {[
            { name: 'EVENTS', active: false, image: category1 },
            { name: 'DIGITAL MARKETING', active: true, image: category2 },
            { name: 'PRODUCTION', active: false, image: category3 },
          ].map((category, index) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden group transition-all duration-300"
            >
              {/* Background Image */}
              <img 
                src={category.image} 
                alt={category.name}
                className={`w-full h-full ${index === 0 ? 'object-cover' : 'object-cover'}`}
              />
              
              {/* Black Overlay */}
              <div className={`absolute inset-0 transition-all duration-300 ${
                activeCategory === category.name
                  ? 'bg-black/70'
                  : 'bg-black/80 group-hover:bg-black/70'
              }`} />
              
              {/* Category Name */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className={`text-textPrimary font-heading font-bold text-3xl tracking-wide transition-all duration-300 ${
                  activeCategory === category.name
                    ? 'drop-shadow-[0_0_15px_rgba(242,160,32,0.8)]'
                    : 'group-hover:drop-shadow-[0_0_15px_rgba(242,160,32,0.8)]'
                }`}>
                  {category.name}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* Sub-category Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 max-w-[1300px] mx-auto pb-10">
          {(CATEGORY_FILTERS[activeCategory] || []).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveSubFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeSubFilter === filter
                  ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(242,160,32,0.4)]'
                  : 'bg-transparent border border-borderSubtle text-textSecondary hover:border-amber-500/50 hover:text-textPrimary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-[40px]">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/work/${item.slug}`}
              className="group block break-inside-avoid mb-6"
            >
              <div className={`relative rounded-2xl overflow-hidden ${item.height} w-full`}>
                {/* Project Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Hover Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <span className="inline-block px-3 py-1 bg-accent/90 text-white text-sm font-medium rounded-full mb-3">
                      {item.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-textPrimary mb-2">
                      {item.title}
                    </h3>
                  {/*  <p className="text-textSecondary text-sm mb-4">
                      {item.description}
                    </p> */}
                    <div className="text-accent font-medium flex items-center">
                      View Project
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Work
