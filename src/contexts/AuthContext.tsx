import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { Role } from '../constants'
import { ROLES } from '../constants'

// 12 jam dalam milidetik
const SESSION_DURATION = 12 * 60 * 60 * 1000

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Role | null
  logout: () => void
  user: string | null
  role: Role | null
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function isRole(value: string | null): value is Role {
  return value !== null && (ROLES as string[]).includes(value)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_role')
    setIsAuthenticated(false)
    setUser(null)
    setRole(null)
    window.location.href = '/login'
  }, [])

  const login = useCallback((username: string, password: string): Role | null => {
    // Cek kecocokan kredensial ke-2 role. Prioritas: purchasing dulu, lalu spv.
    const purchasers = {
      user: (import.meta.env.VITE_AUTH_PURCHASING_USERNAME || '').trim(),
      pass: (import.meta.env.VITE_AUTH_PURCHASING_PASSWORD || '').trim(),
    }
    const spvs = {
      user: (import.meta.env.VITE_AUTH_SPV_USERNAME || '').trim(),
      pass: (import.meta.env.VITE_AUTH_SPV_PASSWORD || '').trim(),
    }

    let resolvedRole: Role | null = null
    if (username === purchasers.user && password === purchasers.pass) {
      resolvedRole = 'purchasing'
    } else if (username === spvs.user && password === spvs.pass) {
      resolvedRole = 'spv'
    }

    if (!resolvedRole) return null

    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem('auth_token', 'dummy-token-' + Date.now())
    localStorage.setItem('auth_expiry', String(expiry))
    localStorage.setItem('auth_user', username)
    localStorage.setItem('auth_role', resolvedRole)
    setIsAuthenticated(true)
    setUser(username)
    setRole(resolvedRole)

    // Set timer baru
    setTimeout(() => {
      logout()
    }, SESSION_DURATION)

    return resolvedRole
  }, [logout])

  useEffect(() => {
    let timer: number | undefined

    const token = localStorage.getItem('auth_token')
    const expiry = localStorage.getItem('auth_expiry')
    const username = localStorage.getItem('auth_user')
    const storedRole = localStorage.getItem('auth_role')

    if (token && expiry && username) {
      const remainingTime = Number(expiry) - Date.now()
      if (remainingTime > 0) {
        setIsAuthenticated(true)
        setUser(username)
        if (isRole(storedRole)) {
          setRole(storedRole)
        }
        timer = window.setTimeout(() => {
          logout()
        }, remainingTime)
      } else {
        logout()
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setRole(null)
    }

    setIsInitialized(true)

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, role, isInitialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
