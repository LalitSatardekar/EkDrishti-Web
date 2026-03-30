import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      
      <Navbar />
      <div className="pt-20">
        {/* TEMP: Remove this under-development banner block after full launch */}
        <div className="sticky top-20 z-40 border-b border-amber-500/30 bg-amber-500/10" role="alert" aria-live="polite">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center">
            <p className="text-xs sm:text-sm text-amber-300 font-medium tracking-wide">
              Under Development: Some features and content may change as we continue improving your experience.
            </p>
          </div>
        </div>
        {/* END TEMP banner */}
      </div>
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
