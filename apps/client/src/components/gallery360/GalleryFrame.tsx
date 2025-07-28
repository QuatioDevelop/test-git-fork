'use client'

import { CSSProperties } from 'react'
import Image from 'next/image'
import { GalleryFrame as GalleryFrameType } from './types/gallery'
import { GalleryHotspot } from './GalleryHotspot'
import styles from './CylindricalGallery.module.css'

interface GalleryFrameProps {
  frame: GalleryFrameType
  style: CSSProperties
  isActive: boolean
  onClick: () => void
  className?: string
}

export function GalleryFrame({
  frame,
  style,
  isActive,
  onClick,
  className = ''
}: GalleryFrameProps) {
  return (
    <div
      className={`${styles.galleryFrame} ${className} ${isActive ? styles.activeFrame : ''}`}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Proyecto ${frame.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Project Image */}
      <div className={styles.frameImage}>
        {frame.imageUrl && (
          <Image
            src={frame.imageUrl}
            alt={frame.title}
            fill
            style={{
              objectFit: 'cover'
            }}
          />
        )}
      </div>

      {/* Project Info */}
      <div className={styles.frameContent}>
        <h3 className={styles.frameTitle}>
          {frame.title}
        </h3>
        {frame.description && (
          <p className={styles.frameDescription}>
            {frame.description}
          </p>
        )}
      </div>

      {/* Information Hotspot */}
      <GalleryHotspot
        frame={frame}
        className={styles.galleryHotspot}
      />
    </div>
  )
}