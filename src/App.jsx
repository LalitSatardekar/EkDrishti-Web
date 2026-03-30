import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Work = lazy(() => import('./pages/Work'))
const WorkDetail = lazy(() => import('./pages/WorkDetail'))
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FamilyEvents = lazy(() => import('./pages/services/FamilyEvents'))
const DigitalMarketing = lazy(() => import('./pages/services/DigitalMarketing'))
const Production = lazy(() => import('./pages/services/Production'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-primary flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-textSecondary">Loading...</p>
    </div>
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<WorkDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/family-events" element={<FamilyEvents />} />
              <Route path="/services/digital-marketing" element={<DigitalMarketing />} />
              <Route path="/services/production" element={<Production />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </Router>
  )
}

export default App
