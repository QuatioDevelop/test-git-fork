'use client'

import { useUser } from '@/context/UserContext'
import { useRooms } from '@/context/RoomsContext'
import { useProgress } from '@/context/ProgressContext'
import { useCallback, useMemo } from 'react'

// Main global state hook that combines all contexts
export const useGlobalState = () => {
  const user = useUser()
  const rooms = useRooms()
  const progress = useProgress()

  // Combined loading state
  const isLoading = user.isLoading || rooms.isLoading || progress.isLoading

  // Combined error state
  const error = user.isLoading ? null : rooms.error || progress.error

  // Check if all data is ready
  const isReady = !isLoading && !error && !!user.user

  return {
    // User state
    user: user.user,
    updateUser: user.updateUser,
    clearUser: user.clearUser,

    // Rooms state
    rooms: rooms.rooms,
    roomsLocalState: rooms.roomsLocalState,
    updateRoomLocalState: rooms.updateRoomLocalState,
    isRoomAvailable: rooms.isRoomAvailable,
    getRoomById: rooms.getRoomById,
    refetchRooms: rooms.refetchRooms,
    lastSyncTime: rooms.lastSyncTime,

    // Progress state
    progress: progress.progress,
    markRoomCompleted: progress.markRoomCompleted,
    isRoomCompleted: progress.isRoomCompleted,
    refetchProgress: progress.refetchProgress,

    // Combined states
    isLoading,
    error,
    isReady,
  }
}

// Hook to track room visit status
export const useRoomVisit = (roomId: string) => {
  const { roomsLocalState, updateRoomLocalState, markRoomCompleted, isRoomCompleted } = useGlobalState()

  const roomState = roomsLocalState[roomId]
  const isCompleted = isRoomCompleted(roomId)

  const startVisit = useCallback(() => {
    updateRoomLocalState(roomId, {
      visiting: true,
      startedAt: new Date(),
      lastVisitedAt: new Date(),
    })
  }, [roomId, updateRoomLocalState])

  const endVisit = useCallback(async (completed: boolean = false) => {
    updateRoomLocalState(roomId, {
      visiting: false,
      lastVisitedAt: new Date(),
    })

    if (completed && !isCompleted) {
      await markRoomCompleted(roomId)
    }
  }, [roomId, updateRoomLocalState, markRoomCompleted, isCompleted])

  return {
    isVisiting: roomState?.visiting || false,
    startedAt: roomState?.startedAt,
    lastVisitedAt: roomState?.lastVisitedAt,
    isCompleted,
    startVisit,
    endVisit,
  }
}

// Hook for overall event progress
export const useEventProgress = () => {
  const { progress, rooms } = useGlobalState()

  const totalRooms = useMemo(() => Object.keys(rooms).length || 5, [rooms])
  const completedRooms = progress.completedRooms.length
  const progressPercentage = progress.currentProgress

  const remainingRooms = useMemo(() => {
    const allRoomIds = Object.keys(rooms)
    return allRoomIds.filter(roomId => !progress.completedRooms.includes(roomId))
  }, [rooms, progress.completedRooms])

  const nextRoom = useMemo(() => {
    // Find the first available uncompleted room
    const availableRooms = remainingRooms.filter(roomId => {
      const room = rooms[roomId as keyof typeof rooms]
      if (!room) return false
      
      // Check manual override first
      if (room.manualOverride === 'open') return true
      if (room.manualOverride === 'closed') return false
      
      // Check if room has openAt date and if it's in the past
      if (room.openAt) {
        const openDate = new Date(room.openAt)
        return new Date() >= openDate
      }
      
      // If no openAt date and no manual override, room is available by default
      return true
    })
    return availableRooms[0] || null
  }, [remainingRooms, rooms])

  return {
    totalRooms,
    completedRooms,
    remainingRooms: remainingRooms.length,
    progressPercentage,
    remainingRoomIds: remainingRooms,
    nextRoom,
    isEventCompleted: completedRooms >= totalRooms,
  }
}

// Hook for room status with authentication check
export const useRoomAccess = (roomId: string) => {
  const { user, getRoomById, isRoomAvailable, isRoomCompleted } = useGlobalState()

  const room = getRoomById(roomId)
  const isAvailable = isRoomAvailable(roomId)
  const isCompleted = isRoomCompleted(roomId)
  const isAuthenticated = !!user

  const canAccess = isAuthenticated && isAvailable
  const status = useMemo(() => {
    if (!room) return 'not_found'
    if (!isAuthenticated) return 'requires_auth'
    if (!isAvailable) return 'locked'
    if (isCompleted) return 'completed'
    return 'available'
  }, [room, isAuthenticated, isAvailable, isCompleted])

  return {
    room,
    canAccess,
    status,
    isAuthenticated,
    isAvailable,
    isCompleted,
  }
}