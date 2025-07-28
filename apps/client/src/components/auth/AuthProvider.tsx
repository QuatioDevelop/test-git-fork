'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuth, AuthResponse } from './services'
import { LoadingScreen } from '../ui/Spinner'

// Auth context type
interface AuthContextType {
  user: AuthResponse['user'] | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: ReturnType<typeof useAuth>['login']
  register: ReturnType<typeof useAuth>['register']
  logout: ReturnType<typeof useAuth>['logout']
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth()

  // Redirect to login if not authenticated (optional - can be handled by individual pages)
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Optional: Could redirect to login page here
      // But we'll handle this in individual protected routes
    }
  }, [auth.isLoading, auth.isAuthenticated])

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuthContext()

    if (isLoading) {
      return <LoadingScreen message="Cargando..." variant="client" />
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }

    return <Component {...props} />
  }
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}