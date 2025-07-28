'use client'

import { useEffect } from 'react'
import { useRooms } from '@/context/RoomsContext'
import { useProgress } from '@/context/ProgressContext'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { RoomNavigation } from '@/components/navigation/RoomNavigation'
import { UserHeader } from '@/components/layout/UserHeader'
import { RoomConfig } from '@/config/rooms'

interface RoomPageClientProps {
  roomId: string
  roomConfig: RoomConfig
}


export function RoomPageClient({ roomId, roomConfig }: RoomPageClientProps) {
  const { isRoomAvailable } = useRooms()
  const { markRoomCompleted } = useProgress()
  
  // Mark room as visited when component mounts
  useEffect(() => {
    console.log(`🔍 RoomPageClient mounted for roomId: ${roomId}`)
    if (roomConfig) {
      console.log(`🔍 Marking room ${roomId} as completed...`)
      markRoomCompleted(roomId)
    } else {
      console.log(`🔍 No roomConfig found for ${roomId}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, roomConfig]) // Removed markRoomCompleted and isRoomAvailable from dependencies to prevent infinite loop
  
  // Check if room is available
  if (!isRoomAvailable(roomId)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb />
          <div className="text-center py-12">
            <div className="text-red-600 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Sala no disponible
            </h1>
            <p className="text-red-700 mb-6">
              Esta sala no está disponible en este momento.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <RoomNavigation />
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {roomConfig.name}
          </h1>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {roomConfig.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}