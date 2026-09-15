import { createContext, useEffect, useState } from 'react'
import authService from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Initialize and verify user on mount or token change
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const data = await authService.getMe()
          if (data?.data?.user) {
            setUser(data.data.user)
            setToken(storedToken)
          } else {
            throw new Error('Invalid user payload')
          }
        } catch (error) {
          console.error('Session expired or invalid:', error.message)
          localStorage.removeItem('token')
          setUser(null)
          setToken(null)
        }
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    if (data?.data?.token && data?.data?.user) {
      localStorage.setItem('token', data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
      return data.data.user
    }
    throw new Error(data?.message || 'Login failed')
  }

  const register = async (userData) => {
    const data = await authService.register(userData)
    if (data?.data?.token && data?.data?.user) {
      localStorage.setItem('token', data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
      return data.data.user
    }
    throw new Error(data?.message || 'Registration failed')
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
export default AuthContext

