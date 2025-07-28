import { notFound } from 'next/navigation'
import { getRoomConfigById, ROOMS_CONFIG } from '@/config/rooms'
import { RoomPageClient } from './room-page-client'

// Generate static params for all interactive rooms
export function generateStaticParams() {
  return ROOMS_CONFIG.INTERACTIVE_ROOMS.map((room) => ({
    id: room.id,
  }))
}

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const roomConfig = getRoomConfigById(id)
  
  // Check if room exists
  if (!roomConfig) {
    notFound()
  }
  
  return <RoomPageClient roomId={id} roomConfig={roomConfig} />
}