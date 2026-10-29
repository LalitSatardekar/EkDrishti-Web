import { createContext, useContext, useState, useEffect } from 'react'
import { allCases as rawFallbackCases } from '../data/cases'
import { normalizeCase } from '../lib/config'

const fallbackCases = rawFallbackCases.map(normalizeCase)

const CasesContext = createContext(null)

export const useCases = () => useContext(CasesContext)

export const CasesContextProvider = ({ children }) => {
  const [allCases, setAllCases] = useState(fallbackCases)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshCases = async () => {
    try {
      const response = await fetch('/v1/cases', { signal: AbortSignal.timeout(15000), cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          const dbCases = data.data.map(normalizeCase)
          setAllCases(dbCases)
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
    const refresh = () => refreshCases()
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 60000)
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer) }
  }, [])

  return (
    <CasesContext.Provider value={{ allCases, loading, error, refreshCases }}>
      {children}
    </CasesContext.Provider>
  )
}

