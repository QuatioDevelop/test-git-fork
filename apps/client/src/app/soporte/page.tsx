'use client'

import { RoomLayout } from '@/components/layouts/room-layout'

export default function SoportePage() {
  return (
    <RoomLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Central de Soporte
          </h1>
          <p className="text-gray-600 text-lg">
            Aquí encontrarás FAQ y formulario de contacto para consultas
          </p>
        </div>
      </div>
    </RoomLayout>
  )
}