'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home, LucideIcon, TestTube } from 'lucide-react'
import { getRoomConfigById } from '@/config/rooms'
import { useEffect, useState } from 'react'

type BreadcrumbItem = {
  label: string
  href: string
  icon: LucideIcon | null
}

export function Breadcrumb() {
  const pathname = usePathname()
  const [testPageOrigin, setTestPageOrigin] = useState<string>('/ciudadela-test')
  
  // Obtener el origen de navegación desde sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = sessionStorage.getItem('testPageOrigin')
      if (origin === '/test' || origin === '/ciudadela-test') {
        setTestPageOrigin(origin)
      }
    }
  }, [])
  
  // Parse the current path
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Handle different path structures
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = []
    
    // Determinar el breadcrumb home basado en el origen
    if (testPageOrigin === '/test') {
      items.push({ label: 'Test Multi-País', href: '/test', icon: TestTube })
    } else {
      items.push({ label: 'Ciudadela', href: '/ciudadela-test', icon: Home })
    }
    
    if (pathSegments.length === 0) return items
    
    // Handle /salas/[id] pattern
    if (pathSegments[0] === 'salas' && pathSegments[1]) {
      const roomId = pathSegments[1]
      const roomConfig = getRoomConfigById(roomId)
      
      if (roomConfig) {
        items.push({
          label: roomConfig.name,
          href: pathname,
          icon: null
        })
      }
    }
    // Handle direct room routes like /sala1, /sala2, etc.
    else if (pathSegments[0].startsWith('sala') && pathSegments[0].length === 5) {
      const roomId = pathSegments[0]
      const roomConfig = getRoomConfigById(roomId)
      
      if (roomConfig) {
        items.push({
          label: roomConfig.name,
          href: pathname,
          icon: null
        })
      }
    }
    
    return items
  }
  
  const breadcrumbItems = getBreadcrumbItems()
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1
        const Icon = item.icon
        
        return (
          <div key={item.href} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            
            {isLast ? (
              <span className="font-medium text-gray-900 flex items-center space-x-1">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-blue-600 flex items-center space-x-1"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}