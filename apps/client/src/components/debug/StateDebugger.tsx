'use client'

import { useState } from 'react'
import { useGlobalState } from '@/hooks/useGlobalState'

// Solo mostrar en development
const isDevelopment = process.env.NODE_ENV === 'development'

interface Sala4Config {
  visibleFrames: number
  onVisibleFramesChange: (count: number) => void
  maxFrames: number
}

interface StateDebuggerProps {
  sala4Config?: Sala4Config
}

export const StateDebugger = ({ sala4Config }: StateDebuggerProps = {}) => {
  const [isOpen, setIsOpen] = useState(false)
  const state = useGlobalState()

  // No renderizar en production
  if (!isDevelopment) return null

  // Función para probar marcar una sala como completada
  const testMarkCompleted = async (roomId: string) => {
    try {
      await state.markRoomCompleted(roomId)
      console.log(`✅ Sala ${roomId} marcada como completada`)
    } catch (error) {
      console.error(`❌ Error marcando sala ${roomId}:`, error)
    }
  }

  // Función para simular visita a sala
  const simulateVisit = (roomId: string) => {
    state.updateRoomLocalState(roomId, {
      visiting: true,
      startedAt: new Date(),
      lastVisitedAt: new Date(),
    })
    console.log(`🚪 Simulando visita a sala: ${roomId}`)
  }

  // Toggle button flotante - directo al estado completo
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50 transition-all"
        title="Abrir Debug State"
      >
        🔍
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-w-sm">
      {/* Header - simplificado */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-900">🔍 Debug State</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Content - siempre visible */}
      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Status general */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Usuario:</span>
              <span className={state.user ? 'text-green-600' : 'text-red-600'}>
                {state.user ? state.user.name : 'No logueado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loading:</span>
              <span className={state.isLoading ? 'text-yellow-600' : 'text-green-600'}>
                {state.isLoading ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ready:</span>
              <span className={state.isReady ? 'text-green-600' : 'text-red-600'}>
                {state.isReady ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progreso:</span>
              <span className="text-blue-600">
                {state.progress.completedRooms.length}/5 ({state.progress.currentProgress}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última Sync:</span>
              <span className="text-purple-600">
                {state.lastSyncTime ? new Date(state.lastSyncTime).toLocaleTimeString('es-CO', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }) : 'Nunca'}
              </span>
            </div>
          </div>

          {/* Sala4 Galería Control */}
          {sala4Config && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">🎡 Galería 3D:</div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-800">Frames visibles:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newValue = Math.max(3, sala4Config.visibleFrames - 1)
                        sala4Config.onVisibleFramesChange(newValue)
                      }}
                      disabled={sala4Config.visibleFrames <= 3}
                      className="w-6 h-6 text-xs bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-800 rounded border-0 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border min-w-[2rem] text-center">
                      {sala4Config.visibleFrames}
                    </span>
                    <button
                      onClick={() => {
                        const newValue = Math.min(Math.min(15, sala4Config.maxFrames), sala4Config.visibleFrames + 1)
                        sala4Config.onVisibleFramesChange(newValue)
                      }}
                      disabled={sala4Config.visibleFrames >= Math.min(15, sala4Config.maxFrames)}
                      className="w-6 h-6 text-xs bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-800 rounded border-0 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  Rango: 3 - {Math.min(15, sala4Config.maxFrames)} frames
                </div>
              </div>
            </div>
          )}

          {/* Error si existe */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-xs text-red-800 font-medium">Error:</div>
              <div className="text-xs text-red-600">{state.error.message}</div>
            </div>
          )}

          {/* Salas */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Salas:</div>
            <div className="space-y-1">
              {Object.entries(state.rooms).map(([roomId, room]) => {
                const isCompleted = state.isRoomCompleted(roomId)
                
                // Si está completada, mostrar estado + completada
                if (isCompleted) {
                  // Determinar el estado actual (similar a la lógica de abajo)
                  let currentStatusText = ''
                  let currentStatusClass = ''
                  
                  // Verificar override manual primero
                  if (room?.manualOverride === 'open') {
                    currentStatusText = 'Abierta'
                    currentStatusClass = 'bg-green-100 text-green-800'
                  } else if (room?.manualOverride === 'closed') {
                    currentStatusText = 'Cerrada'
                    currentStatusClass = 'bg-red-100 text-red-800'
                  } else if (room?.openAt) {
                    // Verificar si ya pasó la fecha de apertura
                    const openDate = new Date(room.openAt)
                    const now = new Date()
                    
                    if (now >= openDate) {
                      // Ya pasó la fecha, está abierta
                      currentStatusText = 'Abierta'
                      currentStatusClass = 'bg-green-100 text-green-800'
                    } else {
                      // Aún no llega la fecha, mostrar cuándo abre
                      const isToday = openDate.toDateString() === now.toDateString()
                      if (isToday) {
                        currentStatusText = `Cerrada hasta ${openDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                      } else {
                        currentStatusText = `Cerrada hasta ${openDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })} ${openDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                      }
                      currentStatusClass = 'bg-yellow-100 text-yellow-800'
                    }
                  } else {
                    // Sin fecha de apertura definida, disponible por defecto
                    currentStatusText = 'Abierta'
                    currentStatusClass = 'bg-green-100 text-green-800'
                  }
                  
                  return (
                    <div key={roomId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{roomId}:</span>
                      <div className="flex items-center gap-1">
                        <span className={`px-1 rounded text-xs ${currentStatusClass}`}>
                          {currentStatusText}
                        </span>
                        <span className="px-1 rounded text-xs bg-green-100 text-green-800">
                          ✓
                        </span>
                        {state.roomsLocalState[roomId]?.visiting && (
                          <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs">
                            Visitando
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
                
                // Determinar el estado para mostrar (solo si no está completada)
                let statusText = ''
                let statusClass = ''
                
                // Verificar override manual primero
                if (room?.manualOverride === 'open') {
                  statusText = 'Abierta'
                  statusClass = 'bg-green-100 text-green-800'
                } else if (room?.manualOverride === 'closed') {
                  statusText = 'Cerrada'
                  statusClass = 'bg-red-100 text-red-800'
                } else if (room?.openAt) {
                  // Verificar si ya pasó la fecha de apertura
                  const openDate = new Date(room.openAt)
                  const now = new Date()
                  
                  if (now >= openDate) {
                    // Ya pasó la fecha, está abierta
                    statusText = 'Abierta'
                    statusClass = 'bg-green-100 text-green-800'
                  } else {
                    // Aún no llega la fecha, mostrar cuándo abre
                    const isToday = openDate.toDateString() === now.toDateString()
                    if (isToday) {
                      statusText = `Cerrada hasta ${openDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                    } else {
                      statusText = `Cerrada hasta ${openDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })} ${openDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                    }
                    statusClass = 'bg-yellow-100 text-yellow-800'
                  }
                } else {
                  // Sin fecha de apertura definida, disponible por defecto
                  statusText = 'Abierta'
                  statusClass = 'bg-green-100 text-green-800'
                }
                
                return (
                  <div key={roomId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{roomId}:</span>
                    <div className="flex items-center gap-1">
                      <span className={`px-1 rounded text-xs ${statusClass}`}>
                        {statusText}
                      </span>
                      {state.roomsLocalState[roomId]?.visiting && (
                        <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs">
                          Visitando
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Acciones de testing */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">🧪 Testing Salas:</div>
            <div className="space-y-1">
              {/* Botones para completar cada sala */}
              {Object.keys(state.rooms).map((roomId) => (
                <div key={roomId} className="flex gap-1">
                  <button
                    onClick={() => testMarkCompleted(roomId)}
                    className={`flex-1 text-xs rounded px-2 py-1 ${
                      state.isRoomCompleted(roomId)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    }`}
                    disabled={state.isRoomCompleted(roomId)}
                  >
                    {state.isRoomCompleted(roomId) ? `${roomId} ✓` : `Completar ${roomId}`}
                  </button>
                  <button
                    onClick={() => simulateVisit(roomId)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded px-2 py-1"
                  >
                    👁️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones de debug */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">🔧 Debug:</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  console.group('🔍 Estado Global Completo')
                  console.log('User:', state.user)
                  console.log('Rooms:', state.rooms)
                  console.log('Progress:', state.progress)
                  console.log('Rooms Local State:', state.roomsLocalState)
                  console.log('Loading:', state.isLoading)
                  console.log('Ready:', state.isReady)
                  console.log('Error:', state.error)
                  console.groupEnd()
                }}
                className="w-full text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded px-2 py-1"
              >
                Log Estado (Console)
              </button>
              <button
                onClick={() => {
                  state.refetchRooms()
                  state.refetchProgress()
                }}
                className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded px-2 py-1"
              >
                Refetch Backend
              </button>
              <button
                onClick={() => {
                  if (state.user?.email) {
                    localStorage.removeItem(`rooms_state_${state.user.email}`)
                    localStorage.removeItem(`user_progress_${state.user.email}`)
                  }
                  window.location.reload()
                }}
                className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded px-2 py-1"
              >
                Reset LocalStorage
              </button>
            </div>
          </div>

          {/* Info adicional */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Abre la consola para más debugging
          </div>
        </div>
    </div>
  )
}