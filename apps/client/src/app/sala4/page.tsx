'use client'

import { useEffect, useState } from 'react'
import { RoomLayout } from '@/components/layouts/room-layout'
import { CylindricalGallery } from '@/components/gallery360'
import { GalleryFrameType } from '@/components/gallery360'
import { StateDebugger } from '@/components/debug/StateDebugger'
import { useProgress } from '@/context/ProgressContext'

// Mock data for demonstration - replace with actual API data
const mockGalleryFrames: GalleryFrameType[] = Array.from({ length: 15 }, (_, i) => ({
  id: `proyecto-${i + 1}`,
  title: `Proyecto ${String(i + 1).padStart(2, '0')}`,
  description: `País: ${['Colombia', 'México', 'Chile', 'Perú', 'Argentina', 'Brasil', 'Uruguay', 'Ecuador', 'Venezuela', 'Panamá', 'Costa Rica', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua'][i % 15]}`,
  imageUrl: '', // Will show blue background as per design
  hotspotInfo: {
    position: { x: 0, y: 0 },
    content: `Información detallada del proyecto ${i + 1}`
  }
}))

export default function Sala4Page() {
  const [visibleFrames, setVisibleFrames] = useState(13) // Default 13 frames
  const { markRoomCompleted, isRoomCompleted } = useProgress()

  // Mark room as completed when component mounts - with conditional logic
  useEffect(() => {
    if (!isRoomCompleted('sala4')) {
      markRoomCompleted('sala4')
    }
  }, [markRoomCompleted, isRoomCompleted])
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFrameClick = (frame: GalleryFrameType) => {
    // Handle frame click - could open modal, navigate to detail page, etc.
    // TODO: Implement actual action (e.g., open video modal, navigate to project page)
  }

  return (
    <RoomLayout 
      title="Salón de la Fama"
      fullScreen={true}
      showNavigation={true}
    >
      <div className="h-full w-full">
        {/* Gallery Section - Full Height */}
        <CylindricalGallery
          frames={mockGalleryFrames}
          radius={250}
          autoRotate={false}
          rotationSpeed={0.5}
          onFrameClick={handleFrameClick}
          className="h-full w-full"
          title="La Excelencia también es evidente"
          subtitle="en nuestros grandes proyectos."
          description="Conoce cómo a las mejores prácticas en Latinoamérica las mueve nuestra esencia y son parte fundamental de nuestros resultados."
          visibleFrames={visibleFrames}
        />
      </div>
      
      {/* Debug Panel global con controles específicos de Sala4 */}
      <StateDebugger 
        sala4Config={{
          visibleFrames,
          onVisibleFramesChange: setVisibleFrames,
          maxFrames: mockGalleryFrames.length
        }}
      />
    </RoomLayout>
  )
}