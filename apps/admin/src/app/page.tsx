'use client'

import { useState, useEffect } from 'react'
import { EsenciaFestLogo } from '@sura-esenciafest/shared'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { fetchAuthSession } from 'aws-amplify/auth'

interface Room {
  id: string
  title: string
  status: 'available' | 'locked' | 'coming_soon'
  openAt?: string
  manualOverride?: 'open' | 'closed' | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://du5aspnoji.execute-api.us-east-1.amazonaws.com/dev'

function AdminDashboardContent() {
  const [rooms, setRooms] = useState<Record<string, Room>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { } = useAdminAuth()

  // Get authentication headers
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.accessToken?.toString()
      
      if (token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      } else {
        return {
          'Content-Type': 'application/json',
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
      return {
        'Content-Type': 'application/json',
      }
    }
  }

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/status`)
      const data = await response.json()
      setRooms(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update room override
  const updateRoomOverride = async (roomId: string, override: 'open' | 'closed' | null) => {
    setUpdating(roomId)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}/override`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ override }),
      })
      
      if (response.ok) {
        await fetchRooms() // Refresh data
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error updating room override:', error)
    } finally {
      setUpdating(null)
    }
  }

  // Update room schedule
  const updateRoomSchedule = async (roomId: string, openAt: string) => {
    setUpdating(roomId)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}/schedule`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ openAt }),
      })
      
      if (response.ok) {
        await fetchRooms() // Refresh data
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error updating room schedule:', error)
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No definido'
    return new Date(dateString).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Helper function to convert UTC date to Colombia timezone for datetime-local input
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return ''
    
    // Create date in Colombia timezone
    const date = new Date(dateString)
    const colombiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = colombiaDate.getFullYear()
    const month = String(colombiaDate.getMonth() + 1).padStart(2, '0')
    const day = String(colombiaDate.getDate()).padStart(2, '0')
    const hours = String(colombiaDate.getHours()).padStart(2, '0')
    const minutes = String(colombiaDate.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const getOverrideStatus = (override?: 'open' | 'closed' | null) => {
    if (override === 'open') return { text: 'Forzado ABIERTO', color: 'bg-green-100 text-green-800' }
    if (override === 'closed') return { text: 'Forzado CERRADO', color: 'bg-red-100 text-red-800' }
    return { text: 'Por horario', color: 'bg-gray-100 text-gray-800' }
  }

  const mainRooms = ['sala1', 'sala2', 'sala3', 'sala4', 'sala5']

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <EsenciaFestLogo size="lg" variant="admin" />
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      
      {/* Status and Controls Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EsenciaFestLogo size="sm" variant="admin" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Control de Salas
              </h1>
              <p className="text-sm text-gray-600">
                SURA Esencia Fest 2025
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Última actualización: {lastUpdate ? formatDateTime(lastUpdate.toISOString()) : 'Nunca'}
            </p>
            <button
              onClick={fetchRooms}
              className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mainRooms.map((roomId) => {
            const room = rooms[roomId]
            if (!room) return null

            const overrideStatus = getOverrideStatus(room.manualOverride)
            const isUpdating = updating === roomId

            return (
              <div key={roomId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {room.title}
                    </h3>
                    <p className="text-xs text-gray-500">{roomId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${overrideStatus.color}`}>
                    {overrideStatus.text}
                  </span>
                </div>

                {/* Schedule */}
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">⏰ Horario</h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {formatDateTime(room.openAt)}
                  </div>
                  <input
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(room.openAt)}
                    onChange={(e) => {
                      if (e.target.value) {
                        // Convert local datetime to UTC for backend
                        const localDate = new Date(e.target.value)
                        // Adjust for Colombia timezone offset (-5 hours from UTC)
                        const utcDate = new Date(localDate.getTime() + (5 * 60 * 60 * 1000))
                        updateRoomSchedule(roomId, utcDate.toISOString())
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    disabled={isUpdating}
                  />
                </div>

                {/* Override Controls */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">🎛️ Control</h4>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => updateRoomOverride(roomId, 'open')}
                      disabled={isUpdating}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        room.manualOverride === 'open'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                      }`}
                    >
                      {isUpdating ? '...' : 'Abrir'}
                    </button>
                    <button
                      onClick={() => updateRoomOverride(roomId, 'closed')}
                      disabled={isUpdating}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        room.manualOverride === 'closed'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {isUpdating ? '...' : 'Cerrar'}
                    </button>
                    <button
                      onClick={() => updateRoomOverride(roomId, null)}
                      disabled={isUpdating}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        room.manualOverride === null
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {isUpdating ? '...' : 'Auto'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}