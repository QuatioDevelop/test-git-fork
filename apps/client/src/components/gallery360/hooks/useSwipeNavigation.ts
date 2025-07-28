import { useRef, useEffect, useState, RefObject } from 'react'

interface UseSwipeNavigationProps {
  containerRef: RefObject<HTMLElement | null>
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  threshold?: number
  preventScroll?: boolean
}

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  isDragging: boolean
}

export function useSwipeNavigation({
  containerRef,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDragStart,
  onDragEnd,
  threshold = 50,
  preventScroll = true
}: UseSwipeNavigationProps) {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isDragging: false
  })

  const [isDragging, setIsDragging] = useState(false)

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isDragging: true
    }

    setIsDragging(true)
    onDragStart?.()

    if (preventScroll) {
      e.preventDefault()
    }
  }

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState.current.isDragging) return

    const touch = e.touches[0]
    if (!touch) return

    touchState.current.currentX = touch.clientX
    touchState.current.currentY = touch.clientY

    if (preventScroll) {
      e.preventDefault()
    }
  }

  // Handle touch end
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchState.current.isDragging) return

    const { startX, startY, currentX, currentY, startTime } = touchState.current
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const deltaTime = Date.now() - startTime
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Calculate velocity (pixels per ms)
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime

    // Determine if it's a swipe (minimum threshold and reasonable velocity)
    const isSwipe = (absDeltaX > threshold || absDeltaY > threshold) && 
                   velocity > 0.3 && 
                   deltaTime < 500

    if (isSwipe) {
      // Determine swipe direction (prioritize the larger movement)
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    // Reset state
    touchState.current.isDragging = false
    setIsDragging(false)
    onDragEnd?.()

    if (preventScroll) {
      e.preventDefault()
    }
  }

  // Handle mouse events for desktop
  const handleMouseDown = (e: MouseEvent) => {
    touchState.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startTime: Date.now(),
      isDragging: true
    }

    setIsDragging(true)
    onDragStart?.()

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    if (preventScroll) {
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!touchState.current.isDragging) return

    touchState.current.currentX = e.clientX
    touchState.current.currentY = e.clientY

    if (preventScroll) {
      e.preventDefault()
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!touchState.current.isDragging) return

    const { startX, startY, currentX, currentY, startTime } = touchState.current
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const deltaTime = Date.now() - startTime
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Calculate velocity
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime

    // Determine if it's a swipe
    const isSwipe = (absDeltaX > threshold || absDeltaY > threshold) && 
                   velocity > 0.3 && 
                   deltaTime < 500

    if (isSwipe) {
      if (absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    // Cleanup
    touchState.current.isDragging = false
    setIsDragging(false)
    onDragEnd?.()

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    if (preventScroll) {
      e.preventDefault()
    }
  }

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    container.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    container.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll })

    // Mouse events
    container.addEventListener('mousedown', handleMouseDown)

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      
      // Clean up global mouse listeners
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDragStart, onDragEnd, threshold, preventScroll])

  return {
    isDragging,
    touchState: touchState.current
  }
}