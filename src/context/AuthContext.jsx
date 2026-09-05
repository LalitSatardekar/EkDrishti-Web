import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (_) {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Session expired')
          }
          console.warn('Backend verification returned non-401 status:', response.status)
          return
        }

        const data = await response.json()
        if (data && data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      } catch (err) {
        if (err.message === 'Session expired') {
          console.warn('Session expired, logging out.')
          logout()
        } else {
          console.warn('Session verification non-fatal error:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [token])

  const login = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
