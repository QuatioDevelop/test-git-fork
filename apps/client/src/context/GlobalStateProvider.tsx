'use client'

import React from 'react'
import { UserProvider } from './UserContext'
import { RoomsProvider } from './RoomsContext'
import { ProgressProvider } from './ProgressContext'

// Global state provider that composes all context providers
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <RoomsProvider>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </RoomsProvider>
    </UserProvider>
  )
}