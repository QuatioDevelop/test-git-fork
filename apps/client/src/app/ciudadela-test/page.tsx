'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { StateDebugger } from '@/components/debug/StateDebugger'
import { UserHeader } from '@/components/layout/UserHeader'

// Import dinámico para evitar errores SSR con react-konva
const TestCiudadelaCanvas = dynamic(
  () => import('@/components/ciudadela/test-ciudadela-canvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-slate-700 text-lg">Cargando Ciudadela Virtual...</div>
      </div>
    )
  }
)

export default function CiudadelaTestPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Guardar que el usuario viene de /ciudadela-test para navegación de regreso
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('testPageOrigin', '/ciudadela-test')
    }
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
        <div className="text-slate-700 text-lg">Cargando Ciudadela Virtual...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 relative">
      {/* User Header overlay flotante para la ciudadela */}
      <UserHeader />
      
      {/* 
        Ciudadela Virtual fullscreen sin header/footer
        - Escalado inteligente 16:9 maximizando espacio disponible
        - Fondo consistente que extiende el color de la ciudadela
        - Borde visual para delimitar el área interactiva
      */}
      <div className="w-full h-[calc(100vh-2rem)] max-w-none">
        <TestCiudadelaCanvas className="w-full h-full" />
      </div>
      
      {/* Debug State Component - Solo en development */}
      <StateDebugger />
    </div>
  )
}