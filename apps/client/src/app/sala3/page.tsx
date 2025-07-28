'use client'

import { useEffect } from 'react'
import { RoomLayout } from '@/components/layouts/room-layout'
import { useProgress } from '@/context/ProgressContext'

export default function Sala3Page() {
  const { markRoomCompleted, isRoomCompleted } = useProgress()

  // Mark room as completed when component mounts - with conditional logic
  useEffect(() => {
    if (!isRoomCompleted('sala3')) {
      markRoomCompleted('sala3')
    }
  }, [markRoomCompleted, isRoomCompleted])
  return (
    <RoomLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Ideas en Acción
          </h1>
          <p className="text-gray-600 text-lg">
            Aquí encontrarás un sistema de foro para publicar ideas con texto e imágenes
          </p>
        </div>
      </div>
    </RoomLayout>
  )
}