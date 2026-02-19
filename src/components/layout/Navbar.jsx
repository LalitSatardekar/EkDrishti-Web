import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { cn } from '../../lib/utils'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const scrollPosition = useScrollPosition()
  const location = useLocation()

  const isScrolled = scrollPosition > 50

  const leftNavLinks = [
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
  ]

  const rightNavLinks = [
    { name: 'Work', path: '/work' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-lg border-b border-borderSubtle"
      style={{ backgroundColor: '#151627cc' }}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-full">
        <div className="flex items-center justify-center h-full relative">
          {/* Left Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-16 mr-16">
            {leftNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'font-medium text-base transition-colors duration-200 whitespace-nowrap',
                  isActive(link.path)
                    ? 'text-amber-500'
                    : 'text-textPrimary hover:text-amber-500'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src={!isScrolled ? "/logo.png" : "/logo2.svg"}
              alt="Ekdrishti" 
              className={cn(
                'w-auto transition-all duration-300',
                !isScrolled ? 'h-14' : 'h-12'
              )}
            />
          </Link>

          {/* Right Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-16 ml-16">
            {rightNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'font-medium text-base transition-colors duration-200 whitespace-nowrap',
                  isActive(link.path)
                    ? 'text-amber-500'
                    : 'text-textPrimary hover:text-amber-500'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden focus:outline-none absolute right-0 text-textPrimary"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-borderSubtle">
            <div className="flex flex-col space-y-4">
              {[...leftNavLinks, ...rightNavLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'font-medium transition-colors duration-200',
                    isActive(link.path)
                      ? 'text-amber-500'
                      : 'text-textSecondary hover:text-textPrimary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
