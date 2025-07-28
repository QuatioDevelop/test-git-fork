'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuthContext } from '@/components/auth/AuthProvider'

// User context type definition
export interface User {
  email: string
  name: string
  lastname: string
  country: string
  negocio?: string
  role?: string
  position?: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// User provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isLoading: authLoading } = useAuthContext()
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync with auth user
  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        setLocalUser({
          email: authUser.email,
          name: authUser.name,
          lastname: authUser.lastname,
          country: authUser.country,
          negocio: authUser.position, // Map position to negocio
          role: authUser.role,
          position: authUser.position,
        })
      } else {
        setLocalUser(null)
      }
      setIsInitialized(true)
    }
  }, [authUser, authLoading])

  // Update user information
  const updateUser = useCallback((updates: Partial<User>) => {
    setLocalUser(prev => {
      if (!prev) return null
      return { ...prev, ...updates }
    })
  }, [])

  // Clear user data
  const clearUser = useCallback(() => {
    setLocalUser(null)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user: localUser,
      isLoading: !isInitialized || authLoading,
      updateUser,
      clearUser,
    }),
    [localUser, isInitialized, authLoading, updateUser, clearUser]
  )

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}