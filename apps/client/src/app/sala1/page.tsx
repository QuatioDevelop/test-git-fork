'use client'

import { useEffect, useState } from 'react'
import { RoomLayout } from '@/components/layouts/room-layout'
import { useProgress } from '@/context/ProgressContext'
import VimeoPlayer from '@/components/poc/VimeoPlayer'

export default function Sala1Page() {
  const { markRoomCompleted, isRoomCompleted } = useProgress()
  const [videoCompleted, setVideoCompleted] = useState(false)

  // Video configuration - using a different public Vimeo video for Sala 1
  const vimeoVideoId = "34741214" // Different video for president/corporate content (TED Talk style)

  // Mark room as completed when user enters (consistent with other rooms)
  useEffect(() => {
    if (!isRoomCompleted('sala1')) {
      markRoomCompleted('sala1')
    }
  }, [markRoomCompleted, isRoomCompleted])

  const handleVideoEnd = () => {
    setVideoCompleted(true)
  }

  return (
    <RoomLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            El Poder del Patrocinio
          </h1>
          <p className="text-gray-600 text-lg">
            Video del presidente desde Vimeo
          </p>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 relative overflow-hidden">
          <div className="aspect-video max-w-4xl mx-auto relative">
            <VimeoPlayer
              videoId={vimeoVideoId}
              width="100%"
              height="100%"
              autoplay={false}
              className="w-full h-full rounded"
              onVideoEnd={handleVideoEnd}
            />
          </div>
        </div>

        {/* Video Status */}
        {videoCompleted && (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="mr-2">✅</span>
              Video completado - Sala marcada como visitada
            </div>
          </div>
        )}
      </div>
    </RoomLayout>
  )
}