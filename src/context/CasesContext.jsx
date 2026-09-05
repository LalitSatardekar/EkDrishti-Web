import { createContext, useContext, useState, useEffect } from 'react'
import { allCases as rawFallbackCases } from '../data/cases'
import { encodeAssetUrl } from '../lib/config'

const normalizeCase = (item) => {
  if (!item) return item
  const id = item.id || item._id
  const _id = item._id || String(item.id)
  const image = encodeAssetUrl(item.image)
  const thumbnail = encodeAssetUrl(item.thumbnail || item.image)
  const thumbnail169 = encodeAssetUrl(item.thumbnail169 || thumbnail)
  const thumbnail32 = encodeAssetUrl(item.thumbnail32 || thumbnail)
  const album = Array.isArray(item.album) ? item.album.map(encodeAssetUrl) : []
  const hero = Array.isArray(item.hero) ? item.hero.map(encodeAssetUrl) : []

  return {
    ...item,
    id,
    _id,
    image,
    hero,
    thumbnail,
    thumbnail169,
    thumbnail32,
    album,
  }
}

const fallbackCases = rawFallbackCases.map(normalizeCase)

const CasesContext = createContext(null)

export const useCases = () => useContext(CasesContext)

export const CasesContextProvider = ({ children }) => {
  const [allCases, setAllCases] = useState(fallbackCases)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshCases = async () => {
    try {
      const response = await fetch('/api/v1/cases')
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
