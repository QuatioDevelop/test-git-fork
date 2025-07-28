'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stage, Layer, Rect, Text } from 'react-konva'
import { ROOMS_CONFIG } from '@/config/rooms'
import { useRooms } from '@/context/RoomsContext'
import { useProgress } from '@/context/ProgressContext'

interface CiudadelaCanvasProps {
  width?: number
  height?: number
}

export default function CiudadelaCanvas({ 
  width = 800, 
  height = 600 
}: CiudadelaCanvasProps) {
  const [stageSize, setStageSize] = useState({ width, height })
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isRoomAvailable } = useRooms()
  const { isRoomCompleted } = useProgress()

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight || 600
        setStageSize({
          width: containerWidth,
          height: containerHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Room positions and colors
  const roomPositions = [
    { x: 50, y: 50, color: '#4ade80', strokeColor: '#16a34a' },
    { x: 250, y: 50, color: '#f59e0b', strokeColor: '#d97706' },
    { x: 450, y: 50, color: '#8b5cf6', strokeColor: '#7c3aed' },
    { x: 150, y: 200, color: '#ef4444', strokeColor: '#dc2626' },
    { x: 350, y: 200, color: '#06b6d4', strokeColor: '#0891b2' },
  ]

  const handleRoomClick = (roomId: string) => {
    if (isRoomAvailable(roomId)) {
      router.push(`/salas/${roomId}`)
    }
  }

  const getRoomColor = (roomId: string, baseColor: string) => {
    if (!isRoomAvailable(roomId)) {
      return '#9ca3af' // Gray for unavailable rooms
    }
    if (isRoomCompleted(roomId)) {
      return '#10b981' // Green for completed rooms
    }
    return baseColor
  }

  const getRoomStrokeColor = (roomId: string, baseStrokeColor: string) => {
    if (!isRoomAvailable(roomId)) {
      return '#6b7280' // Gray stroke for unavailable rooms
    }
    if (isRoomCompleted(roomId)) {
      return '#059669' // Green stroke for completed rooms
    }
    return baseStrokeColor
  }

  return (
    <div ref={containerRef} className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={stageSize.width}
            height={stageSize.height}
            fill="linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
          />
          
          {/* Interactive Rooms */}
          {ROOMS_CONFIG.INTERACTIVE_ROOMS.map((room, index) => {
            const position = roomPositions[index]
            if (!position) return null
            
            return (
              <React.Fragment key={room.id}>
                <Rect
                  x={position.x}
                  y={position.y}
                  width={150}
                  height={100}
                  fill={getRoomColor(room.id, position.color)}
                  stroke={getRoomStrokeColor(room.id, position.strokeColor)}
                  strokeWidth={2}
                  cornerRadius={8}
                  shadowBlur={10}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowOffset={{ x: 3, y: 3 }}
                  onClick={() => handleRoomClick(room.id)}
                  onTap={() => handleRoomClick(room.id)}
                  listening={true}
                  perfectDrawEnabled={false}
                />
                <Text
                  x={position.x}
                  y={position.y + 35}
                  width={150}
                  text={room.shortName}
                  fontSize={14}
                  fontFamily="Arial"
                  fill="white"
                  align="center"
                  fontStyle="bold"
                  onClick={() => handleRoomClick(room.id)}
                  onTap={() => handleRoomClick(room.id)}
                  listening={true}
                  perfectDrawEnabled={false}
                />
                {/* Room status indicator */}
                {isRoomCompleted(room.id) && (
                  <Text
                    x={position.x}
                    y={position.y + 60}
                    width={150}
                    text="✓ Completada"
                    fontSize={12}
                    fontFamily="Arial"
                    fill="white"
                    align="center"
                    fontStyle="bold"
                  />
                )}
                {!isRoomAvailable(room.id) && (
                  <Text
                    x={position.x}
                    y={position.y + 60}
                    width={150}
                    text="🔒 Cerrada"
                    fontSize={12}
                    fontFamily="Arial"
                    fill="white"
                    align="center"
                    fontStyle="bold"
                  />
                )}
              </React.Fragment>
            )
          })}

          {/* Welcome text */}
          <Text
            x={50}
            y={stageSize.height - 80}
            width={stageSize.width - 100}
            text="¡Bienvenido a la Ciudadela Virtual de SURA Esencia Fest 2025!"
            fontSize={18}
            fontFamily="Arial"
            fill="#1f2937"
            align="center"
            fontStyle="bold"
          />
          
          {/* Instructions */}
          <Text
            x={50}
            y={stageSize.height - 50}
            width={stageSize.width - 100}
            text="Haz clic en las salas para acceder a ellas"
            fontSize={14}
            fontFamily="Arial"
            fill="#4b5563"
            align="center"
          />
        </Layer>
      </Stage>
    </div>
  )
}