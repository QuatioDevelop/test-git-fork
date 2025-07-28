'use client'

import { useState } from 'react'
import { GalleryFrame } from './types/gallery'

interface GalleryHotspotProps {
  frame: GalleryFrame
  className?: string
}

export function GalleryHotspot({ frame, className = '' }: GalleryHotspotProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent frame click
    setShowTooltip(!showTooltip)
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        aria-label={`Información sobre ${frame.title}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          background: 'inherit',
          border: 'inherit',
          borderRadius: 'inherit',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit'
        }}
      >
        i
      </button>

      {/* Tooltip */}
      {showTooltip && frame.hotspotInfo && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 20,
            marginBottom: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {frame.hotspotInfo.content}
          
          {/* Tooltip arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(0, 0, 0, 0.9)'
            }}
          />
        </div>
      )}
    </div>
  )
}