'use client'
import React from 'react'
import { useOrientation } from './useOrientation'

interface OrientationGuardProps {
  children: React.ReactNode
}

export function OrientationGuard({ children }: OrientationGuardProps) {
  const { isPortrait, isMobile } = useOrientation()

  // Only show orientation guard on mobile devices in portrait mode
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center px-6 max-w-sm mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Phone icon */}
              <svg 
                className="w-20 h-20 text-white animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              
              {/* Rotation indicator */}
              <div className="absolute -top-2 -right-2">
                <svg 
                  className="w-8 h-8 text-blue-400 animate-spin" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-4">
            Voltea tu dispositivo
          </h2>
          
          <p className="text-gray-300 text-lg mb-6">
            Para vivir la experiencia completa, por favor rota tu dispositivo a modo horizontal
          </p>
          
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Normal experience for landscape or desktop
  return <>{children}</>
}