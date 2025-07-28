export interface GalleryFrame {
  id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl?: string
  hotspotInfo?: {
    position: { x: number; y: number }
    content: string
    link?: string
  }
}

export interface CylindricalGalleryProps {
  frames: GalleryFrame[]
  radius?: number
  autoRotate?: boolean
  rotationSpeed?: number
  className?: string
  onFrameClick?: (frame: GalleryFrame) => void
  title?: string
  subtitle?: string
  description?: string
  visibleFrames?: number // Number of frames to show (rest are hidden)
}

export interface GalleryNavigation {
  currentIndex: number
  totalFrames: number
  isRotating: boolean
  rotation: number
}

export interface SwipeGesture {
  startX: number
  startY: number
  deltaX: number
  deltaY: number
  velocity: number
}