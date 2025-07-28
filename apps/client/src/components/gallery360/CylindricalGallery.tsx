'use client'

import { useState, useRef, useCallback } from 'react'
import { CylindricalGalleryProps } from './types/gallery'
import { GalleryFrame } from './GalleryFrame'
import styles from './CylindricalGallery.module.css'

export function CylindricalGallery({
  frames,
  className = '',
  onFrameClick,
  title,
  subtitle,
  description,
  visibleFrames = frames.length
}: CylindricalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // State - following DeSandro pattern
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [currentRotation, setCurrentRotation] = useState(0)
  
  const cellCount = Math.min(visibleFrames, frames.length)
  const theta = 360 / cellCount // angle between cells
  
  // Calculate dimensions - DeSandro approach (fixed values with larger radius)
  const cellWidth = 160 // fixed frame width 
  const cellHeight = 220 // fixed frame height
  const isHorizontal = true
  const cellSize = isHorizontal ? cellWidth : cellHeight
  const baseRadius = Math.round((cellSize / 2) / Math.tan(Math.PI / cellCount))
  const calculatedRadius = baseRadius + 100 // Add 100px for less compact cylinder
  
  // Rotation function - DeSandro approach  
  const rotateCarousel = useCallback((index: number) => {
    if (!carouselRef.current) return
    
    const angle = theta * index * -1 // negative for correct direction
    const rotateFn = isHorizontal ? 'rotateY' : 'rotateX'
    
    // Update current rotation state
    setCurrentRotation(Math.abs(angle))
    
    // User in center approach: maintain camera position + rotation
    carouselRef.current.style.transform = 
      `translateZ(${calculatedRadius + 50}px) ${rotateFn}(${angle}deg)`
  }, [theta, calculatedRadius, isHorizontal])

  // Navigation functions
  const goToPrevious = useCallback(() => {
    const newIndex = selectedIndex - 1
    setSelectedIndex(newIndex)
    rotateCarousel(newIndex)
  }, [selectedIndex, rotateCarousel])

  const goToNext = useCallback(() => {
    const newIndex = selectedIndex + 1
    setSelectedIndex(newIndex)
    rotateCarousel(newIndex)
  }, [selectedIndex, rotateCarousel])

  // Handle frame click
  const handleFrameClick = useCallback((frameIndex: number) => {
    const frame = frames[frameIndex]
    // Always trigger action on any frame click (no rotation)
    onFrameClick?.(frame)
  }, [frames, onFrameClick])

  // Drag and drop handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart
    const rotationDelta = deltaX * 0.1 // Reduced sensitivity
    const newRotation = currentRotation + rotationDelta
    
    if (carouselRef.current) {
      carouselRef.current.style.transform = 
        `translateZ(${calculatedRadius + 50}px) rotateY(${-newRotation}deg)`
    }
  }, [isDragging, dragStart, currentRotation, calculatedRadius])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart
    const rotationDelta = deltaX * 0.1 // Reduced sensitivity
    const newRotation = currentRotation + rotationDelta
    
    // Find closest frame without wrapping around
    const stepsFromStart = newRotation / theta
    const newIndex = Math.round(stepsFromStart) % frames.length
    const finalIndex = newIndex < 0 ? frames.length + newIndex : newIndex
    const snappedRotation = Math.round(stepsFromStart) * theta
    
    setCurrentRotation(snappedRotation)
    setSelectedIndex(finalIndex)
    setIsDragging(false)
    
    // Apply final snapped rotation
    if (carouselRef.current) {
      carouselRef.current.style.transform = 
        `translateZ(${calculatedRadius + 50}px) rotateY(${-snappedRotation}deg)`
    }
  }, [isDragging, dragStart, currentRotation, theta, frames.length, calculatedRadius])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    
    const deltaX = e.touches[0].clientX - dragStart
    const rotationDelta = deltaX * 0.1 // Reduced sensitivity 
    const newRotation = currentRotation + rotationDelta
    
    if (carouselRef.current) {
      carouselRef.current.style.transform = 
        `translateZ(${calculatedRadius + 50}px) rotateY(${-newRotation}deg)`
    }
  }, [isDragging, dragStart, currentRotation, calculatedRadius])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    
    const deltaX = e.changedTouches[0].clientX - dragStart
    const rotationDelta = deltaX * 0.1 // Reduced sensitivity
    const newRotation = currentRotation + rotationDelta
    
    // Find closest frame without wrapping around
    const stepsFromStart = newRotation / theta
    const newIndex = Math.round(stepsFromStart) % frames.length
    const finalIndex = newIndex < 0 ? frames.length + newIndex : newIndex
    const snappedRotation = Math.round(stepsFromStart) * theta
    
    setCurrentRotation(snappedRotation)
    setSelectedIndex(finalIndex)
    setIsDragging(false)
    
    // Apply final snapped rotation
    if (carouselRef.current) {
      carouselRef.current.style.transform = 
        `translateZ(${calculatedRadius + 50}px) rotateY(${-snappedRotation}deg)`
    }
  }, [isDragging, dragStart, currentRotation, theta, frames.length, calculatedRadius])

  return (
    <div 
      className={`${styles.cylindricalGallery} ${className}`}
      ref={containerRef}
      role="region"
      aria-label="Galería de proyectos interactiva"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Scene container - equivalent to DeSandro's .scene */}
      <div className={styles.scene}>
        <div 
          className={`${styles.galleryContainer} ${isDragging ? styles.dragging : ''}`}
          ref={carouselRef}
          style={{
            transform: `translateZ(${calculatedRadius + 50}px)`
          }}
        >
          {frames.map((frame, index) => {
            // DeSandro approach: show/hide frames based on cellCount
            const isVisible = index < cellCount
            
            if (!isVisible) {
              // Hidden frame
              return (
                <GalleryFrame
                  key={frame.id}
                  frame={frame}
                  style={{ opacity: 0, transform: 'none' }}
                  isActive={false}
                  onClick={() => handleFrameClick(index)}
                  className={styles.galleryFrame}
                />
              )
            }

            // Calculate position for visible frame - DeSandro approach
            const cellAngle = theta * index
            const rotateFn = isHorizontal ? 'rotateY' : 'rotateX'
            const frameStyle = {
              transform: `${rotateFn}(${cellAngle}deg) translateZ(${-calculatedRadius}px)`,
              opacity: 1
            }

            return (
              <GalleryFrame
                key={frame.id}
                frame={frame}
                style={frameStyle}
                isActive={index === (selectedIndex % cellCount)}
                onClick={() => handleFrameClick(index)}
                className={styles.galleryFrame}
              />
            )
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={styles.navigationControls}>
        <button
          className={styles.navButton}
          onClick={goToPrevious}
          aria-label="Proyecto anterior"
        >
          ← Anterior
        </button>
        
        <span className={styles.frameCounter}>
          {(selectedIndex % cellCount) + 1} de {cellCount}
        </span>
        
        <button
          className={styles.navButton}
          onClick={goToNext}
          aria-label="Proyecto siguiente"
        >
          Siguiente →
        </button>
      </div>


      {/* Loading state */}
      {frames.length === 0 && (
        <div className={styles.loadingSpinner} aria-label="Cargando proyectos..." />
      )}

      {/* Descriptive Text Section - Outside scene to avoid scaling */}
      {(title || subtitle || description) && (
        <div className={styles.descriptiveText}>
          {title && (
            <h1 className={styles.title}>
              {title}
            </h1>
          )}
          {subtitle && (
            <h2 className={styles.subtitle}>
              {subtitle}
            </h2>
          )}
          {description && (
            <p className={styles.description}>
              {description}
            </p>
          )}
        </div>
      )}


      {/* Loading state */}
      {frames.length === 0 && (
        <div className={styles.loadingSpinner} aria-label="Cargando proyectos..." />
      )}
    </div>
  )
}