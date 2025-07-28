'use client'

import { ReactNode } from 'react'
import { RoomNavigation } from '@/components/navigation/RoomNavigation'
import { UserHeader } from '@/components/layout/UserHeader'

interface RoomLayoutProps {
  children: ReactNode
  className?: string
  showNavigation?: boolean
  title?: string
  fullScreen?: boolean
}

export function RoomLayout({ 
  children, 
  className = '',
  showNavigation = true,
  title,
  fullScreen = false
}: RoomLayoutProps) {
  return (
    <div className={`${fullScreen ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'} bg-gray-50 ${className}`}>
      <UserHeader />
      {showNavigation && (
        <div className="bg-white shadow-sm border-b flex-shrink-0">
          <RoomNavigation title={title} />
        </div>
      )}
      <main className={fullScreen ? 'flex-1 overflow-hidden' : 'container mx-auto px-4 py-8'}>
        {children}
      </main>
    </div>
  )
}