'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { RouteUtils } from '@/config/routes'

interface RouteGuardProps {
  children: React.ReactNode
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuthContext()

  // Determinar estados de ruta
  const isPublicRoute = RouteUtils.isPublicRoute(pathname)
  const isAuthRoute = RouteUtils.isAuthRoute(pathname)
  const shouldRedirectFromAuth = isPublicRoute && isAuthRoute && isAuthenticated && !isLoading
  const shouldRedirectToAuth = !isPublicRoute && !isAuthenticated && !isLoading

  // Hook para redirección desde login/register cuando ya está autenticado
  useEffect(() => {
    if (shouldRedirectFromAuth) {
      const timer = setTimeout(() => {
        // Verificar si hay parámetro redirect antes de ir al root
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect')
        const destination = redirectUrl || '/'
        window.location.href = destination
      }, 0) // Próximo tick del event loop para evitar issues de hidratación
      return () => clearTimeout(timer)
    }
  }, [shouldRedirectFromAuth])

  // Hook para redirección a login desde rutas privadas
  useEffect(() => {
    if (shouldRedirectToAuth) {
      const loginUrl = RouteUtils.getLoginUrl(pathname)
      window.location.href = loginUrl
    }
  }, [shouldRedirectToAuth, pathname])

  // Renderizado condicional
  if (shouldRedirectFromAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirigiendo...</div>
      </div>
    )
  }

  if (isPublicRoute) {
    return <>{children}</>
  }

  // Loading state solo para rutas privadas
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    )
  }

  // Redirect state para rutas privadas
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirigiendo al login...</div>
      </div>
    )
  }

  // Show content if authorized
  return <>{children}</>
}