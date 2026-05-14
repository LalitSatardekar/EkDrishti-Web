whatsapp , scroll to top btn 
transform the contact btn to a pop up contact form 
services preview - gutter space inc -20px 
space between the btns and the content -20-24px
  home screen - remove from min-vh
  







to implement:(proiority:high)**


**Issue #5:** Missing error boundaries
- **Why it's a problem:** App crashes completely on component errors
- **Suggested Fix:** Add error boundaries
- **Example:**
```javascript
// Create src/components/ErrorBoundary.jsx:
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// In App.jsx:
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```
**Issue #2:** Local state that should be URL state
- **Why it's a problem:** [`Work.jsx`](src/pages/Work.jsx:19-20) filters don't persist on refresh
- **Suggested Fix:** Use URL search params
- **Example:**
```javascript
// ❌ BAD - Lost on refresh:
const [activeCategory, setActiveCategory] = useState('EVENTS')

// ✅ GOOD - Persisted in URL:
const [searchParams, setSearchParams] = useSearchParams()
const activeCategory = searchParams.get('category') || 'EVENTS'

const handleCategoryChange = (name) => {
  setSearchParams({ category: name })
}
```

--------------------------------------------------------------------------------------------------------------------
PRIORITY: MID

**Issue #3:** Unnecessary state updates
- **Why it's a problem:** Can cause performance issues
- **Suggested Fix:** Use derived state instead
- **Example:**
```javascript
// ❌ BAD - Unnecessary state:
const [isScrolled, setIsScrolled] = useState(false)
useEffect(() => {
  const handler = () => setIsScrolled(window.scrollY > 50)
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])

// ✅ GOOD - Derived from existing state:
const scrollPosition = useScrollPosition()
const isScrolled = scrollPosition > 50
```

**Issue #1:** Hardcoded image URLs
- **Why it's a problem:** [`About.jsx`](src/pages/About.jsx:65) uses external Unsplash URLs directly
- **Suggested Fix:** Download and optimize images locally or use proper CDN
- **Example:**
```javascript
// ❌ BAD:
<img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" />

// ✅ GOOD:
import heroImage from '../assets/images/team-hero.webp'
<img src={heroImage} alt="Team" />
```


**Issue #2:** Inline style objects mixed with Tailwind
- **Why it's a problem:** [`About.jsx`](src/pages/About.jsx:142-160) has complex inline styles
- **Suggested Fix:** Use Tailwind classes or CSS modules
- **Example:**
```javascript
// ❌ BAD - Inline styles:
<div style={{
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  width: "65%",
  height: "90px",
  background: "rgba(255,255,255,0.10)",
  borderRadius: "0 0 120px 120px",
}} />

// ✅ GOOD - Tailwind classes:
<div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[65%] h-[90px] bg-white/10 rounded-b-[120px]" />
```


**Issue #3:** Magic color values not in theme
- **Why it's a problem:** Colors like `#F2A020 `, `#151627` used directly instead of theme variables
- **Suggested Fix:** Add to Tailwind config
- **Example:**
```javascript
// tailwind.config.js:
theme: {
  extend: {
    colors: {
      primary: '#0B1120',
      secondary: '#111827',
      accent: '#2563EB',
      amber: {
        400: '#FBBF24',
        500: '#F59E0B',  // Add #F2A020 here
      },
      // Add custom colors:
      brand: {
        orange: '#F2A020',
        navy: '#151627',
      }
    }
  }
}

// Usage:
className="bg-brand-orange text-brand-navy"
```





setActiveService(next)
    if (next !== -1) {
      setTimeout(() => {
        accordionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }



  line 185 
  <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="text-base font-normal italic text-white/75 mt-2 mb-2"
          >
            To achieve your dream.
          </motion.p>