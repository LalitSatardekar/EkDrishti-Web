import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { cn } from '../../lib/utils'
import ContactModal from '../ui/ContactModal'

const serviceLinks = [
  { name: 'Family Events', path: '/services/family-events'},
  { name: 'Digital Marketing', path: '/services/digital-marketing' },
  { name: 'Production', path: '/services/production' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  // TWEAK: rename button label in the JSX below (search "Let's Talk")
  const [isContactOpen, setIsContactOpen] = useState(false)
  const scrollPosition = useScrollPosition()
  const location = useLocation()
  const isPreview = new URLSearchParams(location.search).get('preview') === '1'
  const dropdownRef = useRef(null)
  const hoverTimeout = useRef(null)

  const openDropdown = useCallback(() => {
    clearTimeout(hoverTimeout.current)
    setServicesOpen(true)
  }, [])

  const closeDropdown = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setServicesOpen(false), 120)
  }, [])

  const isScrolled = scrollPosition > 50

  const leftNavLinks = [
    { name: 'About', path: '/about' },
  ]

  const rightNavLinks = [
    { name: 'Work', path: '/work' },
  ]

  const isActive = (path) => location.pathname === path
  const isServicesActive = location.pathname.startsWith('/services')

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      clearTimeout(hoverTimeout.current)
    }
  }, [])

  useEffect(() => {
    setServicesOpen(false)
    setIsOpen(false)
    setMobileServicesOpen(false)
  }, [location.pathname])

  const scrollIfSameRoute = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  const closeMobileMenu = () => {
    setIsOpen(false)
    setMobileServicesOpen(false)
  }

  if (isPreview) return null

  return (
    <>
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-borderSubtle"
      style={{ backgroundColor: '#151627ee' }}
    >
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-center h-20 relative pr-10 lg:pr-0">
          {/* Left Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-16 mr-16">
            {leftNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => scrollIfSameRoute(link.path)}
                className={cn(
                  'relative font-medium text-base transition-colors duration-200 whitespace-nowrap pb-1',
                  'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-amber-500 after:transition-all after:duration-300',
                  isActive(link.path)
                    ? 'text-amber-500 after:w-full'
                    : 'text-textPrimary hover:text-amber-500 after:w-0 hover:after:w-full'
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef} onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
              <button
                onClick={() => setServicesOpen((v) => !v)}
                className={cn(
                  'relative flex items-center gap-1.5 font-medium text-base transition-colors duration-200 whitespace-nowrap pb-1',
                  'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-amber-500 after:transition-all after:duration-300',
                  isServicesActive
                    ? 'text-amber-500 after:w-full'
                    : 'text-textPrimary hover:text-amber-500 after:w-0'
                )}
              >
                Services
                <svg
                  className={cn('w-3.5 h-3.5 transition-transform duration-200', servicesOpen ? 'rotate-180' : 'rotate-0')}
                  fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M2 4.5L6 8L10 4.5" />
                </svg>
              </button>
              {servicesOpen && (
                <div
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl border border-amber-500/15 shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(21, 22, 39, 0.98)' }}
                >
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      onClick={() => scrollIfSameRoute(s.path)}
                      className={cn(
                        'flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 ease-out',
                        isActive(s.path)
                          ? 'text-amber-400 bg-amber-500/12'
                          : 'text-textSecondary hover:text-amber-400 hover:bg-amber-500/8'
                      )}
                    >
                      <span className="text-lg">{s.icon}</span>
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Logo */}
          <Link to="/" onClick={() => scrollIfSameRoute('/')} className="flex items-center flex-shrink-0">
            <img 
              src={!isScrolled ? "/logo.png" : "/logo2.svg"}
              alt="Ekdrishti" 
              className={cn(
                'w-auto transition-all duration-300',
                !isScrolled ? 'h-14' : 'h-14'
              )}
            />
          </Link>

          {/* Right Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-8 ml-16">
            {rightNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => scrollIfSameRoute(link.path)}
                className={cn(
                  'relative font-medium text-base transition-colors duration-200 whitespace-nowrap pb-1',
                  'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-amber-500 after:transition-all after:duration-300',
                  isActive(link.path)
                    ? 'text-amber-500 after:w-full'
                    : 'text-textPrimary hover:text-amber-500 after:w-0 hover:after:w-full'
                )}
              >
                {link.name}
              </Link>
            ))}
            {/* TWEAK: change button label, padding, or colors below */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-amber-500/30 hover:shadow-md"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden focus:outline-none absolute right-0 text-textPrimary"
            aria-label={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isOpen
              ? 'max-h-[520px] opacity-100 border-t border-borderSubtle pb-6'
              : 'max-h-0 opacity-0 pb-0'
          )}
        >
          <div className="flex flex-col space-y-1">
              {leftNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => { scrollIfSameRoute(link.path); closeMobileMenu() }}
                  className={cn(
                    'font-medium px-2 py-2.5 transition-colors duration-200 rounded-lg',
                    isActive(link.path) ? 'text-amber-500' : 'text-textSecondary hover:text-textPrimary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {/* Mobile Services Accordion */}
              <div>
                <button
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2.5 font-medium transition-colors duration-200 rounded-lg',
                    isServicesActive ? 'text-amber-500' : 'text-textSecondary hover:text-textPrimary'
                  )}
                >
                  Services
                  <svg
                    className={cn('w-3.5 h-3.5 transition-transform duration-200', mobileServicesOpen ? 'rotate-180' : 'rotate-0')}
                    fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M2 4.5L6 8L10 4.5" />
                  </svg>
                </button>
                {mobileServicesOpen && (
                  <div className="ml-4 mt-1 flex flex-col space-y-1 pl-6">
                    {serviceLinks.map((s) => (
                      <Link
                        key={s.path}
                        to={s.path}
                        onClick={() => { scrollIfSameRoute(s.path); closeMobileMenu() }}
                        className={cn(
                          'flex items-center gap-3 py-3 px-4 text-sm font-medium transition-all duration-200 ease-out rounded-lg',
                          isActive(s.path)
                            ? 'text-amber-400 bg-amber-500/12'
                            : 'text-textSecondary hover:text-amber-400 hover:bg-amber-500/8'
                        )}
                      >
                        <span className="text-base">{s.icon}</span>
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {rightNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => { scrollIfSameRoute(link.path); closeMobileMenu() }}
                  className={cn(
                    'font-medium px-2 py-2.5 transition-colors duration-200 rounded-lg',
                    isActive(link.path) ? 'text-amber-500' : 'text-textSecondary hover:text-textPrimary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {/* TWEAK: mobile Contact button label/style below */}
              <button
                onClick={() => { closeMobileMenu(); setIsContactOpen(true) }}
                className="mt-1 w-full text-left px-2 py-2.5 font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200 rounded-lg"
              >
                Contact Us
              </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Contact Modal — portal renders outside nav, no z-index conflict */}
    <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  )
}

export default Navbar
