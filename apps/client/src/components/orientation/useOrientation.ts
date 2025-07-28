'use client'
import { useState, useEffect } from 'react'

type OrientationType = 'portrait' | 'landscape'

interface UseOrientationReturn {
  orientation: OrientationType
  isPortrait: boolean
  isLandscape: boolean
  isMobile: boolean
}

export function useOrientation(): UseOrientationReturn {
  const [orientation, setOrientation] = useState<OrientationType>('landscape')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile first
      const isMobileDevice = window.matchMedia('(max-width: 768px)').matches
      setIsMobile(isMobileDevice)

      // Check orientation using multiple methods for better compatibility
      let currentOrientation: OrientationType = 'landscape'

      // Method 1: Dimensions (most reliable, especially for testing)
      if (window.innerHeight > window.innerWidth) {
        currentOrientation = 'portrait'
      }
      // Method 2: Media query fallback
      else if (window.matchMedia('(orientation: portrait)').matches) {
        currentOrientation = 'portrait'
      }
      // Method 3: Screen Orientation API (can be unreliable in some browsers/tests)
      else if (screen.orientation && screen.orientation.type.includes('portrait')) {
        currentOrientation = 'portrait'
      }

      setOrientation(currentOrientation)
    }

    // Initial check
    checkOrientation()

    // Event listeners for orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(checkOrientation, 100)
    }

    const handleResize = () => {
      checkOrientation()
    }

    // Screen Orientation API listener
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    }

    // Window resize listener (fallback)
    window.addEventListener('resize', handleResize)

    // Media query listener for mobile detection
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const handleMobileChange = () => checkOrientation()
    mobileQuery.addEventListener('change', handleMobileChange)

    // Cleanup
    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange)
      }
      window.removeEventListener('resize', handleResize)
      mobileQuery.removeEventListener('change', handleMobileChange)
    }
  }, [])

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isMobile
  }
}