import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { allCases } from '../data/cases'
import { getSortedCases } from '../lib/sortingEngine'
import WorkHoverPreview from '../components/work/WorkHoverPreview'
import category1 from '../assets/work/category1.png'
import category2 from '../assets/work/category2.png'
import category3 from '../assets/work/category3.png'

// Sub-filter pills per top-level category
const CATEGORY_FILTERS = {
  // Temporarily disabled; pills hidden in UI
  // 'EVENTS':            ['All', 'Family Events', 'Corporate'],
  // 'DIGITAL MARKETING': ['All', 'Social Media', 'SEO', 'Paid Ads', 'Email', 'Content', 'Influencer'],
  // 'PRODUCTION':        ['All', 'Brand Film', 'Corporate', 'Music Video', 'Documentary', 'Product'],
}

const Work = () => {
  const [activeCategory,  setActiveCategory]  = useState('EVENTS')
  const [activeSubFilter, setActiveSubFilter] = useState('All')
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoveredEl,   setHoveredEl]   = useState(null)
  const cleanupRef = useRef(null)

  const clear = () => {
    setHoveredItem(null)
    setHoveredEl(null)
  }

  const handleMouseEnter = (e, item) => {
    // Remove listener from previous card if still attached
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    const el = e.currentTarget
    // Native mouseleave on the element fires reliably even on fast moves
    const onLeave = () => {
      clear()
      cleanupRef.current = null
    }
    el.addEventListener('mouseleave', onLeave, { once: true })
    cleanupRef.current = () => el.removeEventListener('mouseleave', onLeave)

    setHoveredEl(el)
    setHoveredItem(item)
  }

  const handleMouseLeave = () => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    clear()
  }

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
      <div className="section-container md:px-[70px]">
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

        {/* Divider */}
        <div className="max-w-[1300px] mx-auto px-4">
          <div className="h-px w-full bg-borderSubtle/60" />
        </div>

        {/* Sub-category Filter Pills (temporarily hidden) */}
        {/* <div className="flex flex-wrap items-center gap-3 max-w-[1300px] mx-auto pb-10">
          {(CATEGORY_FILTERS[activeCategory] || []).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveSubFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeSubFilter === filter
                  ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(242,160,32,0.4)]'
                  : 'bg-transparent border border-borderSubtle text-textSecondary hover-border-amber-500/50 hover:text-textPrimary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div> */}

        {/* Conditional Rendering: Coming Soon or Masonry Grid */}
        {filteredItems.length === 0 ? (
          /* Coming Soon State */
          <div className="flex flex-col items-center justify-center py-32 px-6">
            <div className="text-7xl md:text-8xl mb-6 opacity-50">🚧</div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-4 text-center">
              Coming Soon
            </h2>
            <p className="text-textSecondary text-base md:text-lg text-center max-w-md mb-8 leading-relaxed">
              We're currently working on showcasing our {activeCategory.toLowerCase()} projects.
              Check back soon to see our latest work!
            </p>
            <Link
              to="/contact"
              className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-full
                         hover:bg-amber-400 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get in Touch
            </Link>
          </div>
        ) : (
          /* Masonry Grid */
          <div
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-[40px]"
            onMouseLeave={handleMouseLeave}
          >
            {filteredItems.map((item, index) => {
            const mod = index % 3
            const stagger = mod === 1
              ? 'mt-12 md:mt-16'
              : mod === 2
              ? 'mt-6 md:mt-10'
              : ''
            const aspectClass = mod === 0 ? 'md:aspect-video aspect-[3/2]' : 'aspect-[3/2]'

            // Prefer thumbnails that match the box aspect: provide thumbnail32 or thumbnail169 in cases.js for best fit
            const thumb = mod === 0
              ? item.thumbnail169 || item.thumbnail || item.image || (item.album && item.album[0])
              : item.thumbnail32  || item.thumbnail || item.image || (item.album && item.album[0])
            if (!thumb) return null

            return (
              <div
                key={item.id}
                className={`group block break-inside-avoid mb-6 cursor-pointer ${stagger}`}
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={`/work/${item.slug}`} className="block">
                  <div className={`relative rounded-2xl overflow-hidden w-full bg-surface ${aspectClass}`}>
                    <img
                      src={thumb}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 bg-surface"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-6">
                      <h3 className="text-white font-heading font-bold text-2xl text-center leading-snug drop-shadow-lg">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            )
            })}
          </div>
        )}

        {/* Hover Preview */}
        {hoveredItem && hoveredEl && (
          <WorkHoverPreview item={hoveredItem} anchorEl={hoveredEl} />
        )}
      </div>
    </div>
  )
}

export default Work
