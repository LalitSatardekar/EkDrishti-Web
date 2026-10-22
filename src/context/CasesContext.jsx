import { createContext, useContext, useState, useEffect } from 'react'
import { allCases as rawFallbackCases } from '../data/cases'
import { normalizeCase } from '../lib/config'

const fallbackCases = rawFallbackCases.map(normalizeCase)

const CasesContext = createContext(null)

export const useCases = () => useContext(CasesContext)

export const CasesContextProvider = ({ children }) => {
  const [allCases, setAllCases] = useState(fallbackCases)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshCases = async () => {
    try {
      const response = await fetch('/v1/cases')
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const dbCases = data.data.map(normalizeCase)
          const dbSlugs = new Set(dbCases.map((c) => c.slug))
          const dbIds = new Set(dbCases.map((c) => String(c.id || c._id)))

          const uniqueFallback = fallbackCases.filter(
            (c) => !dbSlugs.has(c.slug) && !dbIds.has(String(c.id))
          )

          setAllCases([...dbCases, ...uniqueFallback])
          return
        }
      }
    } catch (_err) {
      // Silent fallback when backend is offline
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCases()
  }, [])

  return (
    <CasesContext.Provider value={{ allCases, loading, error, refreshCases }}>
      {children}
    </CasesContext.Provider>
  )
}
