import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '../context/CasesContext'
import { getSortedCases } from '../lib/sortingEngine'
import WorkHoverPreview from '../components/work/WorkHoverPreview'
import { trackButtonClick, trackCaseClick } from '../lib/analytics'
import category1 from '../assets/work/category1.png'
import category2 from '../assets/work/category2.png'
import category3 from '../assets/work/category3.png'

// Sub-filter pills per top-level category
const CATEGORY_FILTERS = {
}

const Work = () => {
  const { allCases, loading } = useCases()
  const [activeCategory,  setActiveCategory]  = useState('EVENTS')
  const [activeSubFilter, setActiveSubFilter] = useState('All')
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoveredEl,   setHoveredEl]   = useState(null)
  const cleanupRef = useRef(null)
  const gridRef = useRef(null)

  const isMarketing = activeCategory === 'DIGITAL MARKETING'
  const isProduction = activeCategory === 'PRODUCTION'
  const isDarkFill = isMarketing || isProduction

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
    setTimeout(() => {
      if (!gridRef.current) return
      const NAVBAR_H = 80 // matches h-20 in Navbar.jsx
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - NAVBAR_H - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }, 50)
  }

  // Run through engine: filter by category (and optionally subCategory), sort by priority
  const filteredItems = getSortedCases(allCases, {
    category: activeCategory,
    ...(activeSubFilter !== 'All' && { subCategory: activeSubFilter }),
    sortBy: 'priority',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4 animate-gradient-x"></div>
          <p className="text-textSecondary text-xs">Loading showcase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden ${
      isDarkFill ? 'bg-[#1A1A1A]' : 'bg-[#0B1120]'
    }`}>
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
          isMarketing ? 'bg-white/5' : isProduction ? 'bg-[#D01C1E]/10' : 'bg-[#F2A020]/5'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
          isMarketing ? 'bg-white/5' : isProduction ? 'bg-[#D01C1E]/10' : 'bg-[#F2A020]/5'
        }`} />
      </div>

      <div className="section-container md:px-[70px] relative z-10">
        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px] max-w-[1300px] mx-auto py-16">
          {[
            { name: 'EVENTS', image: category1 },
            { name: 'DIGITAL MARKETING', image: category2 },
            { name: 'PRODUCTION', image: category3 },
          ].map((category) => {
            const isActive = activeCategory === category.name
            let borderStyle = 'border border-white/15 hover:border-white/30'
            let glowStyle = 'text-white/80 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'

            if (isActive) {
              if (category.name === 'EVENTS') {
                borderStyle = 'border-2 border-[#F2A020] shadow-lg shadow-[#F2A020]/20'
                glowStyle = 'drop-shadow-[0_0_15px_rgba(242,160,32,0.9)] text-[#F2A020] font-black'
              } else if (category.name === 'DIGITAL MARKETING') {
                borderStyle = 'border-2 border-white shadow-lg shadow-white/20'
                glowStyle = 'drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] text-white font-black'
              } else if (category.name === 'PRODUCTION') {
                borderStyle = 'border-2 border-[#D01C1E] shadow-lg shadow-[#D01C1E]/30'
                glowStyle = 'drop-shadow-[0_0_15px_rgba(208,28,30,0.9)] text-[#D01C1E] font-black'
              }
            }

            return (
              <button
                key={category.name}
                onClick={() => {
                  handleCategoryChange(category.name)
                  trackButtonClick('Category Select', 'work_page', {
                    category: category.name,
                  })
                }}
                className={`relative w-full aspect-[4/3] rounded-[32px] overflow-hidden group transition-all duration-300 ${borderStyle}`}
              >
                {/* Background Image */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-black/75'
                    : 'bg-black/85 group-hover:bg-black/70'
                }`} />
                
                {/* Category Name */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className={`font-heading tracking-wider transition-all duration-300 text-2xl lg:text-3xl md:text-xl text-center ${glowStyle}`}>
                    {category.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div ref={gridRef} className="max-w-[1300px] mx-auto px-4">
          <div className={`h-px w-full transition-colors duration-500 ${
            isMarketing
              ? 'bg-white/25'
              : isProduction
              ? 'bg-[#D01C1E]/35'
              : 'bg-[#F2A020]/25'
          }`} />
        </div>

        {/* Conditional Rendering: Coming Soon or Masonry Grid */}
        {filteredItems.length === 0 ? (
          /* Coming Soon State */
          <div className="flex flex-col items-center justify-center py-32 px-6">
            <div className="text-7xl md:text-8xl mb-6 opacity-50">🚧</div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4 text-center">
              Coming Soon
            </h2>
            <p className="text-white/70 text-base md:text-lg text-center max-w-md mb-8 leading-relaxed">
              We're currently working on showcasing our {activeCategory.toLowerCase()} projects.
              Check back soon to see our latest work!
            </p>
            <Link
              to="/contact"
              onClick={() => trackButtonClick('Get in Touch', 'work_page_empty')}
              className={`px-8 py-3 font-bold rounded-full transition-all duration-300 shadow-lg ${
                isMarketing
                  ? 'bg-white text-[#1A1A1A] hover:bg-white/90 shadow-white/10'
                  : isProduction
                  ? 'bg-[#D01C1E] text-white hover:bg-[#B01719] shadow-[#D01C1E]/20'
                  : 'bg-[#F2A020] text-[#0B1120] hover:bg-[#E89018] shadow-[#F2A020]/20'
              }`}
            >
              Get in Touch
            </Link>
          </div>
        ) : (
          /* Masonry Grid */
          <div
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pt-12 pb-[60px]"
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

              const thumb = mod === 0
                ? item.thumbnail169 || item.thumbnail || item.image || (item.album && item.album[0])
                : item.thumbnail32  || item.thumbnail || item.image || (item.album && item.album[0])
              if (!thumb) return null

              return (
                <div
                  key={item.id || item._id || item.slug || index}
                  className={`group block break-inside-avoid mb-6 cursor-pointer ${stagger}`}
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/work/${item.slug}`}
                    onClick={() => trackCaseClick(item, 'work_grid')}
                    className="block"
                  >
                    <div className={`relative rounded-2xl overflow-hidden w-full bg-surface border transition-all duration-300 ${
                      isMarketing
                        ? 'border-white/10 group-hover:border-white/40 shadow-lg group-hover:shadow-white/5'
                        : isProduction
                        ? 'border-white/10 group-hover:border-[#D01C1E]/60 shadow-lg group-hover:shadow-[#D01C1E]/10'
                        : 'border-white/10 group-hover:border-[#F2A020]/50 shadow-lg group-hover:shadow-[#F2A020]/10'
                    } ${aspectClass}`}>
                      <img
                        src={thumb}
                        alt={item.title}
                        loading={index < 6 ? 'eager' : 'lazy'}
                        fetchpriority={index < 3 ? 'high' : 'auto'}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-6">
                        <h3 className={`font-heading font-bold text-2xl text-center leading-snug drop-shadow-lg transition-colors duration-300 ${
                          isMarketing
                            ? 'text-white font-black'
                            : isProduction
                            ? 'text-[#D01C1E] font-black'
                            : 'text-[#F2A020] font-black'
                        }`}>
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
          <WorkHoverPreview item={hoveredItem} anchorEl={hoveredEl} activeCategory={activeCategory} />
        )}
      </div>
    </div>
  )
}

export default Work
