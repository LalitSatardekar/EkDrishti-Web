import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <section className="section-container flex min-h-[65vh] flex-col items-center justify-center py-24 text-center">
    <Helmet>
      <title>404 — Page Not Found | Ekdrishti Studios</title>
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <p className="text-8xl md:text-9xl font-heading font-bold text-amber-400 [text-shadow:0_0_32px_rgba(251,191,36,0.2)]">404</p>
    <h1 className="mt-6 text-3xl md:text-5xl font-heading font-bold text-textPrimary">Page not found</h1>
    <p className="mt-4 max-w-lg text-textSecondary">
      The page you’re looking for doesn’t exist or may have moved. Let’s get you back on track.
    </p>
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      <Link to="/" className="btn-primary inline-block px-8 py-4">Back to Home</Link>
      <Link to="/work" className="btn-secondary inline-block px-8 py-4">Explore Our Work</Link>
    </div>
  </section>
)

export default NotFound
