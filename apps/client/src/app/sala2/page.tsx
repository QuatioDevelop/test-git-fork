'use client'

import { useEffect } from 'react'
import { RoomLayout } from '@/components/layouts/room-layout'
import { GeniallyEmbed } from '@/components/genially'
import { useProgress } from '@/context/ProgressContext'

export default function Sala2Page() {
  const { markRoomCompleted, isRoomCompleted } = useProgress()

  // Mark room as completed when component mounts - with conditional logic
  useEffect(() => {
    if (!isRoomCompleted('sala2')) {
      markRoomCompleted('sala2')
    }
  }, [markRoomCompleted, isRoomCompleted])
  return (
    <RoomLayout title="Conocimiento" fullScreen={true}>
      {/* Contenido Genially en pantalla completa */}
      <GeniallyEmbed
        src="/genially/sura-content/index.html"
        title="SURA Esencia Fest 2025 - Contenido Genially"
        fullScreen={true}
        onLoad={() => {
          // Genially content loaded successfully
        }}
        onError={() => {
          console.error('❌ Failed to load Genially content from CDN')
        }}
        showLoader={true}
      />
    </RoomLayout>
  )
}