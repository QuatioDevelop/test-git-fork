'use client'

import { useEffect } from 'react'
import { RoomLayout } from '@/components/layouts/room-layout'
import { useProgress } from '@/context/ProgressContext'
import VimeoPlayer from '@/components/poc/VimeoPlayer'
import ChatIframe from '@/components/poc/ChatIframe'

export default function Sala5Page() {
  const { markRoomCompleted, isRoomCompleted } = useProgress()

  // POC configuration values
  const vimeoVideoId = "76979871" // Example public Vimeo video
  const chatConfig = {
    // roomID now comes from environment variables
    nombre: "Usuario POC", 
    userID: "poc-user-001"
  }

  // Mark room as completed when component mounts - with conditional logic
  useEffect(() => {
    if (!isRoomCompleted('sala5')) {
      markRoomCompleted('sala5')
    }
  }, [markRoomCompleted, isRoomCompleted])

  return (
    <RoomLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inspiración
          </h1>
          <p className="text-gray-600 text-lg">
            Streaming en vivo desde Vimeo con chat en tiempo real
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          
          {/* Video Column - Takes 2/3 of space on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Video Principal
              </h2>
              <VimeoPlayer
                videoId={vimeoVideoId}
                width="100%"
                height={500}
                autoplay={false}
                className="w-full"
              />
            </div>
          </div>

          {/* Chat Column - Takes 1/3 of space on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Chat en Vivo
              </h2>
              <ChatIframe
                nombre={chatConfig.nombre}
                userID={chatConfig.userID}
                width="100%"
                height={500}
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>
    </RoomLayout>
  )
}