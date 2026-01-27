'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/lib/api'
import type { LoginCredentials, User } from '@/lib/types'

export const AUTH_ENABLED = true

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Se AUTH_ENABLED = false, considera sempre autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(!AUTH_ENABLED)
  const [isLoading, setIsLoading] = useState(AUTH_ENABLED)
  const [user, setUser] = useState<User | null>(
    AUTH_ENABLED ? null : { id: 0, usuario: 'dev', nome: 'Desenvolvedor' }
  )

  const checkAuth = useCallback(() => {
    if (!AUTH_ENABLED) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }
    const token = api.getToken()
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshInterval = setInterval(async () => {
      try {
        await api.refreshToken()
      } catch (error) {
        console.error('Failed to refresh token:', error)
        logout()
      }
    }, 4 * 60 * 1000) // Refresh every 4 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      await api.login(credentials)
      setIsAuthenticated(true)
      setUser({ id: 1, usuario: credentials.usuario, nome: credentials.usuario })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    api.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  const refreshAuth = async () => {
    try {
      await api.refreshToken()
    } catch (error) {
      logout()
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
