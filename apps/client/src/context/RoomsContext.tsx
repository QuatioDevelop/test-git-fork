'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/components/auth/AuthProvider'

// Room types definition
export interface Room {
  id: string
  openAt?: string
  manualOverride?: 'open' | 'closed' | null
  description?: string
}

export interface RoomsState {
  sala1?: Room
  sala2?: Room
  sala3?: Room
  sala4?: Room
  sala5?: Room
}

export interface RoomLocalState {
  visiting: boolean
  startedAt?: Date
  lastVisitedAt?: Date
}

interface RoomsContextType {
  rooms: RoomsState
  roomsLocalState: Record<string, RoomLocalState>
  isLoading: boolean
  error: Error | null
  refetchRooms: () => void
  updateRoomLocalState: (roomId: string, state: Partial<RoomLocalState>) => void
  isRoomAvailable: (roomId: string) => boolean
  getRoomById: (roomId: string) => Room | undefined
  lastSyncTime: Date | null
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined)

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dev.esenciafest.com'

// Rooms provider component
export const RoomsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()
  const [roomsLocalState, setRoomsLocalState] = useState<Record<string, RoomLocalState>>({})
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Fetch rooms status from backend
  const {
    data: roomsData,
    isLoading,
    error,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['rooms', 'status'],
    queryFn: async () => {
      // console.log('RoomsContext: Fetching rooms status from:', `${API_BASE_URL}/rooms/status`)

      const response = await fetch(`${API_BASE_URL}/rooms/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        console.error('RoomsContext: Failed to fetch rooms status:', response.status, response.statusText)
        throw new Error(`Failed to fetch rooms status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // console.log('RoomsContext: Rooms data received:', data)
      
      // Update last sync time
      setLastSyncTime(new Date())
      
      return data as RoomsState
    },
    enabled: true, // No requiere autenticación
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds - sync every 30 seconds
    retry: 2,
  })

  // Update local room state
  const updateRoomLocalState = useCallback((roomId: string, state: Partial<RoomLocalState>) => {
    setRoomsLocalState(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        ...state,
      },
    }))
  }, [])

  // Check if room is available
  const isRoomAvailable = useCallback((roomId: string): boolean => {
    const room = roomsData?.[roomId as keyof RoomsState]
    if (!room) return false

    // Check manual override first
    if (room.manualOverride === 'open') return true
    if (room.manualOverride === 'closed') return false
    
    // If no manual override, check if room has openAt date and if it's in the past
    if (room.openAt) {
      const openDate = new Date(room.openAt)
      return new Date() >= openDate
    }

    // If no openAt date and no manual override, room is available by default
    return true
  }, [roomsData])

  // Get room by ID
  const getRoomById = useCallback((roomId: string): Room | undefined => {
    return roomsData?.[roomId as keyof RoomsState]
  }, [roomsData])

  // Persist local state to localStorage
  useEffect(() => {
    if (user?.email) {
      const savedState = localStorage.getItem(`rooms_state_${user.email}`)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          setRoomsLocalState(parsed)
        } catch (error) {
          console.error('Error parsing saved rooms state:', error)
        }
      }
    }
  }, [user?.email])

  // Save local state when it changes
  useEffect(() => {
    if (user?.email && Object.keys(roomsLocalState).length > 0) {
      localStorage.setItem(`rooms_state_${user.email}`, JSON.stringify(roomsLocalState))
    }
  }, [roomsLocalState, user?.email])

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      rooms: roomsData || {},
      roomsLocalState,
      isLoading,
      error: error as Error | null,
      refetchRooms,
      updateRoomLocalState,
      isRoomAvailable,
      getRoomById,
      lastSyncTime,
    }),
    [roomsData, roomsLocalState, isLoading, error, refetchRooms, updateRoomLocalState, isRoomAvailable, getRoomById, lastSyncTime]
  )

  return (
    <RoomsContext.Provider value={contextValue}>
      {children}
    </RoomsContext.Provider>
  )
}

// Custom hook to use rooms context
export const useRooms = () => {
  const context = useContext(RoomsContext)
  if (context === undefined) {
    throw new Error('useRooms must be used within a RoomsProvider')
  }
  return context
}