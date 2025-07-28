'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@sura-esenciafest/shared'
import { useEffect, useState } from 'react'

interface RoomNavigationProps {
  title?: string
}

export function RoomNavigation({ title }: RoomNavigationProps) {
  const router = useRouter()
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
  
  const handleBackToCiudadela = () => {
    router.push(testPageOrigin)
  }
  
  return (
    <div className="flex items-center py-4 relative">
      {/* Back to origin page */}
      <Button 
        variant="outline" 
        onClick={handleBackToCiudadela}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{testPageOrigin === '/test' ? 'Volver a Test' : 'Volver a Ciudadela'}</span>
      </Button>
      
      {/* Room Title - Centrado */}
      {title && (
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-900">
          {title}
        </h1>
      )}
    </div>
  )
}