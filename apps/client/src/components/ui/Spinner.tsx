'use client'

import React from 'react'
import { cn } from '@sura-esenciafest/shared'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'client' | 'admin'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'client',
  className 
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const variantStyles = {
    client: 'border-blue-600',
    admin: 'border-red-600'
  }

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200',
        'border-t-2', // Solo el top border tendrá el color
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Cargando..."
    />
  )
}

// Componente de Loading Screen completo
interface LoadingScreenProps {
  message?: string
  variant?: 'client' | 'admin'
  className?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Cargando...',
  variant = 'client',
  className 
}) => {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4',
      className
    )}>
      <Spinner size="lg" variant={variant} />
      <div className="text-lg text-gray-600">{message}</div>
    </div>
  )
}