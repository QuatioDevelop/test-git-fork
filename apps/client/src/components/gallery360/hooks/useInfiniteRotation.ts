import { useState, useCallback } from 'react'

interface UseInfiniteRotationProps {
  totalFrames: number
  autoRotate?: boolean
  rotationSpeed?: number
  angleStep: number
  onRotationChange?: (rotation: number, currentIndex: number) => void
}

export function useInfiniteRotation({
  totalFrames,
  angleStep,
  onRotationChange
}: UseInfiniteRotationProps) {
  const [rotation, setRotation] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simple rotation functions - DeSandro approach
  const startRotation = useCallback(() => {
    // Auto-rotation can be implemented later if needed
  }, [])

  const stopRotation = useCallback(() => {
    // Auto-rotation stop can be implemented later if needed
  }, [])

  // Rotate to specific index - DeSandro approach
  const rotateToIndex = useCallback((index: number) => {
    const clampedIndex = ((index % totalFrames) + totalFrames) % totalFrames
    // DeSandro uses negative rotation to show the target frame
    const targetRotation = -clampedIndex * angleStep
    
    setRotation(targetRotation)
    setCurrentIndex(clampedIndex)
    
    // Call onChange callback immediately
    onRotationChange?.(targetRotation, clampedIndex)
  }, [totalFrames, angleStep, onRotationChange])

  return {
    rotation,
    currentIndex,
    isRotating: false, // Simplified for now
    startRotation,
    stopRotation,
    rotateToIndex
  }
}