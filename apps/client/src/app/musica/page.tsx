'use client'

import { RoomLayout } from '@/components/layouts/room-layout'

export default function MusicaPage() {
  return (
    <RoomLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Encuentro Musical
          </h1>
          <p className="text-gray-600 text-lg">
            Aquí encontrarás enlaces directos a listas de Spotify
          </p>
        </div>
      </div>
    </RoomLayout>
  )
}