'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Circle, Group, Image as KonvaImage, Path } from 'react-konva'
import { useRouter } from 'next/navigation'
import { useRooms } from '@/context/RoomsContext'
import { useProgress } from '@/context/ProgressContext'
import { getRoomConfigById } from '@/config/rooms'

// Helper function to calculate time remaining
const getTimeRemaining = (targetDate: Date) => {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  
  if (diff <= 0) return null
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, totalHours: Math.floor(diff / (1000 * 60 * 60)) }
}

// Helper function to format countdown
const formatCountdown = (timeRemaining: { days: number, hours: number, minutes: number, seconds: number, totalHours: number }) => {
  if (timeRemaining.totalHours < 24) {
    // Less than 24 hours - show countdown
    if (timeRemaining.totalHours >= 1) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
    } else {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`
    }
  } else {
    // More than 24 hours - show date
    if (timeRemaining.days === 1) {
      return `Mañana ${timeRemaining.hours}h ${timeRemaining.minutes}m`
    } else {
      return `${timeRemaining.days} días ${timeRemaining.hours}h`
    }
  }
}

interface TestCiudadelaCanvasProps {
  className?: string
}

// Esquema de colores claro con bordes que resalten
const BRAND_COLORS = {
  primary: '#FFFFFF',    // Blanco para salas principales
  secondary: '#F8FAFC',  // Gris muy claro para variación
  accent: '#F1F5F9',     // Gris ultra claro para transversales
  border: '#253746',     // Azul oscuro para bordes principales
  borderSecondary: '#00AEC7', // Cian para bordes secundarios
  borderAccent: '#FFE948',    // Amarillo para bordes de énfasis
  text: '#1E293B',       // Texto oscuro para buen contraste
}

// Definición de salas según requerimientos
const SALAS_INTERACTIVAS = [
  { id: 'sala1', name: 'El Poder del\nPatrocinio', color: BRAND_COLORS.primary, border: BRAND_COLORS.border, x: 0.15, y: 0.3, width: 0.18, height: 0.15 },
  { id: 'sala2', name: 'Conocimiento', color: BRAND_COLORS.secondary, border: BRAND_COLORS.borderSecondary, x: 0.4, y: 0.2, width: 0.18, height: 0.15 },
  { id: 'sala3', name: 'Ideas en\nAcción', color: BRAND_COLORS.primary, border: BRAND_COLORS.borderAccent, x: 0.65, y: 0.3, width: 0.18, height: 0.15 },
  { id: 'sala4', name: 'Salón de\nla Fama', color: BRAND_COLORS.secondary, border: BRAND_COLORS.border, x: 0.15, y: 0.55, width: 0.18, height: 0.15 },
  { id: 'sala5', name: 'Inspiración', color: BRAND_COLORS.primary, border: BRAND_COLORS.borderSecondary, x: 0.65, y: 0.55, width: 0.18, height: 0.15 },
]

const SALAS_TRANSVERSALES = [
  { id: 'soporte', name: 'Central de\nSoporte', color: BRAND_COLORS.accent, border: BRAND_COLORS.border, x: 0.05, y: 0.05, width: 0.15, height: 0.12 },
  { id: 'videos', name: 'Central de\nVideos', color: BRAND_COLORS.accent, border: BRAND_COLORS.border, x: 0.8, y: 0.05, width: 0.15, height: 0.12 },
  { id: 'musical', name: 'Encuentro\nMusical', color: BRAND_COLORS.accent, border: BRAND_COLORS.border, x: 0.05, y: 0.83, width: 0.15, height: 0.12 },
  { id: 'literario', name: 'Rincón\nLiterario', color: BRAND_COLORS.accent, border: BRAND_COLORS.border, x: 0.8, y: 0.83, width: 0.15, height: 0.12 },
]

// Hook para cargar imagen SVG
const useImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
    }
    img.src = src
  }, [src])

  return image
}

export default function TestCiudadelaCanvas({ className = '' }: TestCiudadelaCanvasProps) {
  const [stageSize, setStageSize] = useState({ width: 1200, height: 675 }) // 16:9 ratio
  const [currentTime, setCurrentTime] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const logoImage = useImage('/Esenciafest.svg')
  const { isRoomAvailable, getRoomById } = useRooms()
  const { isRoomCompleted } = useProgress()
  const router = useRouter()


  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.offsetWidth
        const containerHeight = container.offsetHeight
        
        // Calcular tamaño manteniendo relación 16:9
        const aspectRatio = 16 / 9
        let newWidth = containerWidth
        let newHeight = containerWidth / aspectRatio
        
        // Si la altura calculada es mayor que el contenedor, limitar por altura
        if (newHeight > containerHeight) {
          newHeight = containerHeight
          newWidth = containerHeight * aspectRatio
        }
        
        setStageSize({ width: newWidth, height: newHeight })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Timer para actualizar contador regresivo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Force re-render dependency on currentTime to update countdown
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = currentTime

  const handleSalaClick = (salaId: string, salaName: string) => {
    const roomConfig = getRoomConfigById(salaId)
    
    if (!roomConfig) {
      console.error(`No room config found for ${salaId}`)
      return
    }
    
    // Salas interactivas: verificar disponibilidad
    if (roomConfig.type === 'interactive') {
      if (isRoomAvailable(salaId)) {
        // Navegar a la sala
        router.push(roomConfig.route)
      } else {
        const room = getRoomById(salaId)
        if (room) {
          if (room.manualOverride === 'closed') {
            alert(`${salaName} está cerrada temporalmente`)
          } else if (room.openAt) {
            const openDate = new Date(room.openAt)
            const formattedDate = openDate.toLocaleString('es-CO', {
              timeZone: 'America/Bogota',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            alert(`${salaName} abrirá el ${formattedDate}`)
          } else {
            alert(`${salaName} no está disponible`)
          }
        } else {
          alert(`${salaName} no está disponible`)
        }
      }
    } else {
      // Salas transversales: siempre disponibles, navegar directamente
      router.push(roomConfig.route)
    }
  }

  // Función para obtener el estado completo de una sala
  const getRoomState = (salaId: string) => {
    // Solo las salas interactivas tienen lógica de estado
    if (!SALAS_INTERACTIVAS.some(sala => sala.id === salaId)) {
      return {
        status: 'abierta',
        color: '#10b981',
        text: null,
        showTime: false
      }
    }

    const room = getRoomById(salaId)
    if (!room) {
      console.log(`getRoomState: No room found for ${salaId}`)
      return {
        status: 'cerrada',
        color: '#ef4444',
        text: null,
        showTime: false
      }
    }

    console.log(`getRoomState: ${salaId}`, room)

    // Verificar override manual primero
    if (room.manualOverride === 'open') {
      return {
        status: 'abierta',
        color: '#10b981',
        text: null,
        showTime: false
      }
    }
    if (room.manualOverride === 'closed') {
      return {
        status: 'cerrada',
        color: '#ef4444',
        text: null,
        showTime: false
      }
    }

    // Si no hay override manual, verificar fecha de apertura o estar disponible por defecto
    if (room.openAt) {
      const openDate = new Date(room.openAt)
      const now = new Date()
      console.log(`${salaId} - openDate: ${openDate}, now: ${now}, isOpen: ${now >= openDate}`)
      if (now >= openDate) {
        return {
          status: 'abierta',
          color: '#10b981',
          text: null,
          showTime: false
        }
      }
      // Si no ha llegado la fecha, continuar al código que maneja fechas futuras
    } else {
      // Si no tiene fecha de apertura ni override, está disponible por defecto
      console.log(`${salaId} disponible por defecto (sin fecha ni override)`)
      return {
        status: 'abierta',
        color: '#10b981',
        text: null,
        showTime: false
      }
    }

    // Verificar si tiene fecha de apertura
    if (room.openAt) {
      const openDate = new Date(room.openAt)
      const now = new Date()
      
      if (now >= openDate) {
        return {
          status: 'abierta',
          color: '#10b981',
          text: null,
          showTime: false
        }
      } else {
        // Calcular tiempo restante y formato
        const timeRemaining = getTimeRemaining(openDate)
        
        if (timeRemaining) {
          const timeText = formatCountdown(timeRemaining)
          
          return {
            status: 'cerrada_hasta',
            color: '#f59e0b',
            text: timeText,
            showTime: true
          }
        } else {
          // Si no hay tiempo restante, la sala debería estar abierta
          return {
            status: 'abierta',
            color: '#10b981',
            text: null,
            showTime: false
          }
        }
      }
    }

    return {
      status: 'cerrada',
      color: '#ef4444',
      text: null,
      showTime: false
    }
  }

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center ${className}`}>
      <div 
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
        style={{ 
          width: stageSize.width, 
          height: stageSize.height,
          backgroundColor: '#f8fafc' // Fondo claro que se extiende
        }}
      >
        <Stage width={stageSize.width} height={stageSize.height}>
          <Layer>
            {/* Fondo de la ciudadela */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fill="#FFFFFF"
            />

            {/* Salas Interactivas */}
            {SALAS_INTERACTIVAS.map((sala) => {
              const salaX = stageSize.width * sala.x
              const salaY = stageSize.height * sala.y
              const salaWidth = stageSize.width * sala.width
              const salaHeight = stageSize.height * sala.height
              const roomState = getRoomState(sala.id)
              
              return (
                <Group key={sala.id}>
                  <Rect
                    x={salaX}
                    y={salaY}
                    width={salaWidth}
                    height={salaHeight}
                    fill={sala.color}
                    stroke={sala.border}
                    strokeWidth={3}
                    cornerRadius={8}
                    shadowBlur={8}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowOffset={{ x: 2, y: 2 }}
                    onClick={() => handleSalaClick(sala.id, sala.name)}
                    onTap={() => handleSalaClick(sala.id, sala.name)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Nombre de la sala */}
                  <Text
                    x={salaX}
                    y={salaY + salaHeight * (roomState.showTime ? 0.25 : 0.3)}
                    width={salaWidth}
                    text={sala.name}
                    fontSize={Math.min(stageSize.width, stageSize.height) * 0.016}
                    fontFamily="Arial"
                    fill={BRAND_COLORS.text}
                    align="center"
                    fontStyle="bold"
                    onClick={() => handleSalaClick(sala.id, sala.name)}
                    onTap={() => handleSalaClick(sala.id, sala.name)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Texto de tiempo de apertura si está cerrada por horario */}
                  {roomState.showTime && roomState.text && (
                    <Text
                      x={salaX}
                      y={salaY + salaHeight * 0.55}
                      width={salaWidth}
                      text={`Abre: ${roomState.text}`}
                      fontSize={Math.min(stageSize.width, stageSize.height) * 0.012}
                      fontFamily="Arial"
                      fill={BRAND_COLORS.text}
                      align="center"
                      fontStyle="normal"
                      onClick={() => handleSalaClick(sala.id, sala.name)}
                      onTap={() => handleSalaClick(sala.id, sala.name)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  
                  {/* Indicador de estado dinámico */}
                  <Circle
                    x={salaX + salaWidth - 15}
                    y={salaY + 15}
                    radius={6}
                    fill={roomState.color}
                    stroke={BRAND_COLORS.text}
                    strokeWidth={1}
                  />
                  
                  {/* Checkmark de completado - solo para salas interactivas */}
                  {isRoomCompleted(sala.id) && (
                    <Group>
                      {/* Círculo de fondo para el checkmark */}
                      <Circle
                        x={salaX + salaWidth - 35}
                        y={salaY + 15}
                        radius={12}
                        fill="#10b981"
                        stroke={BRAND_COLORS.text}
                        strokeWidth={2}
                      />
                      {/* Checkmark path */}
                      <Path
                        x={salaX + salaWidth - 35}
                        y={salaY + 15}
                        data="M-5,-2 L-2,2 L5,-4"
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                        fill=""
                        lineCap="round"
                        lineJoin="round"
                      />
                    </Group>
                  )}
                </Group>
              )
            })}

            {/* Salas Transversales */}
            {SALAS_TRANSVERSALES.map((sala) => {
              const salaX = stageSize.width * sala.x
              const salaY = stageSize.height * sala.y
              const salaWidth = stageSize.width * sala.width
              const salaHeight = stageSize.height * sala.height
              const roomState = getRoomState(sala.id)
              
              return (
                <Group key={sala.id}>
                  <Rect
                    x={salaX}
                    y={salaY}
                    width={salaWidth}
                    height={salaHeight}
                    fill={sala.color}
                    stroke={sala.border}
                    strokeWidth={2}
                    cornerRadius={6}
                    shadowBlur={4}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowOffset={{ x: 1, y: 1 }}
                    opacity={0.95}
                    onClick={() => handleSalaClick(sala.id, sala.name)}
                    onTap={() => handleSalaClick(sala.id, sala.name)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Text
                    x={salaX}
                    y={salaY + salaHeight * 0.35}
                    width={salaWidth}
                    text={sala.name}
                    fontSize={Math.min(stageSize.width, stageSize.height) * 0.012}
                    fontFamily="Arial"
                    fill={BRAND_COLORS.text}
                    align="center"
                    fontStyle="normal"
                    onClick={() => handleSalaClick(sala.id, sala.name)}
                    onTap={() => handleSalaClick(sala.id, sala.name)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Indicador de estado para salas transversales */}
                  <Circle
                    x={salaX + salaWidth - 12}
                    y={salaY + 12}
                    radius={4}
                    fill={roomState.color}
                    stroke={BRAND_COLORS.text}
                    strokeWidth={1}
                  />
                </Group>
              )
            })}

            {/* Logo EsenciaFest */}
            {logoImage && (
              (() => {
                // Calcular dimensiones del logo manteniendo aspecto ratio
                const logoRatio = 278 / 111 // width / height del SVG original
                const maxLogoWidth = stageSize.width * 0.25 // Máximo 25% del ancho
                const maxLogoHeight = stageSize.height * 0.08 // Máximo 8% del alto
                
                // Determinar tamaño final basado en las restricciones
                let logoWidth = maxLogoWidth
                let logoHeight = logoWidth / logoRatio
                
                // Si la altura excede el máximo, ajustar por altura
                if (logoHeight > maxLogoHeight) {
                  logoHeight = maxLogoHeight
                  logoWidth = logoHeight * logoRatio
                }
                
                return (
                  <KonvaImage
                    image={logoImage}
                    x={stageSize.width * 0.5 - logoWidth / 2} // Centrado horizontalmente
                    y={stageSize.height * 0.9 - logoHeight / 2} // Centrado en la parte inferior
                    width={logoWidth}
                    height={logoHeight}
                    opacity={0.9}
                  />
                )
              })()
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}