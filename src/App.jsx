import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef, lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { initAnalytics, trackPageView, trackScrollDepth } from './lib/analytics'
import { AuthContextProvider } from './context/AuthContext'
import { CasesContextProvider } from './context/CasesContext'
import AdminRoute from './components/layout/AdminRoute'
import AdminLayout from './components/layout/AdminLayout'

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

// Admin lazy components
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminCasesListing = lazy(() => import('./pages/admin/AdminCasesListing'))
const AdminCaseEditor = lazy(() => import('./pages/admin/AdminCaseEditor'))
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))
const AdminMemory = lazy(() => import('./pages/admin/AdminMemory'))
const AdminHealth = lazy(() => import('./pages/admin/AdminHealth'))

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
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname])
  return null
}

function AnalyticsTracker() {
  const location = useLocation()
  const trackedDepths = useRef(new Set())

  useEffect(() => {
    const isPreview = new URLSearchParams(location.search).get('preview') === '1'
    if (isPreview) return
    const pagePath = `${location.pathname}${location.search}${location.hash}`
    initAnalytics()
    trackPageView(pagePath)
    trackedDepths.current = new Set()

    const thresholds = [25, 50, 75, 90, 100]

    const handleScroll = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop || 0
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      const percent = scrollHeight > 0
        ? Math.round((scrollTop / scrollHeight) * 100)
        : 100

      thresholds.forEach((threshold) => {
        if (percent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold)
          trackScrollDepth(threshold, pagePath)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname, location.search, location.hash])

  return null
}

function App() {
  return (
    <AuthContextProvider>
      <CasesContextProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AnalyticsTracker />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Admin standalone endpoints */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                <Route path="/admin/cases" element={<AdminRoute><AdminLayout><AdminCasesListing /></AdminLayout></AdminRoute>} />
                <Route path="/admin/cases/:id" element={<AdminRoute><AdminLayout><AdminCaseEditor /></AdminLayout></AdminRoute>} />
                <Route path="/admin/media" element={<AdminRoute><AdminLayout><AdminMedia /></AdminLayout></AdminRoute>} />
                <Route path="/admin/contacts" element={<AdminRoute><AdminLayout><AdminContacts /></AdminLayout></AdminRoute>} />
                <Route path="/admin/logs" element={<AdminRoute><AdminLayout><AdminLogs /></AdminLayout></AdminRoute>} />
                <Route path="/admin/memory" element={<AdminRoute><AdminLayout><AdminMemory /></AdminLayout></AdminRoute>} />
                <Route path="/admin/health" element={<AdminRoute><AdminLayout><AdminHealth /></AdminLayout></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />

                {/* Public frontend endpoints wrapped in default Layout */}
                <Route path="/*" element={
                  <Layout>
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
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </CasesContextProvider>
    </AuthContextProvider>
  )
}

export default App
