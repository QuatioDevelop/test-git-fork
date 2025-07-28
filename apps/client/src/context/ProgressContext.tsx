'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useRooms } from './RoomsContext'

// Progress context type definition
export interface UserProgress {
  completedRooms: string[]
  currentProgress: number // Percentage 0-100
  lastUpdated: Date
}

interface ProgressContextType {
  progress: UserProgress
  isLoading: boolean
  error: Error | null
  markRoomCompleted: (roomId: string) => Promise<void>
  isRoomCompleted: (roomId: string) => boolean
  refetchProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dev.esenciafest.com'

// Progress provider component
export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthContext()
  const { rooms } = useRooms()
  const queryClient = useQueryClient()
  const [localProgress, setLocalProgress] = useState<string[]>([])
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null)
  const [debouncedRoomId] = useDebounce(pendingRoomId, 500)
  const processedRooms = useRef<Set<string>>(new Set())

  // Fetch user progress from backend
  const {
    data: progressData,
    isLoading,
    error,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['user', 'progress'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_access_token')
      if (!token) {
        console.log('ProgressContext: No authentication token found')
        throw new Error('No authentication token')
      }

      console.log('ProgressContext: Fetching progress with token:', token.substring(0, 20) + '...')

      const response = await fetch(`${API_BASE_URL}/user/progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        console.error('ProgressContext: Progress fetch failed:', response.status, response.statusText)
        throw new Error(`Failed to fetch user progress: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('ProgressContext: Progress data received:', data)
      // Backend returns {progress: string[]}
      return data.progress as string[]
    },
    enabled: isAuthenticated && !!user,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  })

  // Mark room as completed mutation
  const markRoomCompletedMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const token = localStorage.getItem('auth_access_token')
      if (!token) {
        console.error('ProgressContext: No authentication token for marking progress')
        throw new Error('No authentication token')
      }

      console.log(`ProgressContext: Marking room ${roomId} as completed with token:`, token.substring(0, 20) + '...')

      const response = await fetch(`${API_BASE_URL}/user/progress/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        console.error(`ProgressContext: Failed to mark room ${roomId} as completed:`, response.status, response.statusText)
        const errorText = await response.text()
        console.error('ProgressContext: Error response:', errorText)
        throw new Error(`Failed to update progress: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`ProgressContext: Room ${roomId} marked as completed successfully:`, data)
      return data
    },
    onSuccess: (_, roomId) => {
      console.log(`ProgressContext: Successfully marked room ${roomId} as completed, updating local state`)
      // Update local state immediately
      setLocalProgress(prev => {
        const updated = [...new Set([...prev, roomId])]
        console.log('ProgressContext: Updated local progress:', updated)
        return updated
      })
      // Invalidate and refetch progress
      queryClient.invalidateQueries({ queryKey: ['user', 'progress'] })
    },
    onError: (error, roomId) => {
      console.error(`ProgressContext: Error marking room ${roomId} as completed:`, error)
    },
  })

  // Sync progress data with local state - handle empty arrays properly
  useEffect(() => {
    if (progressData !== undefined) {
      // Handle both empty arrays and populated arrays
      const validProgress = Array.isArray(progressData) ? progressData : []
      console.log('ProgressContext: Syncing progress data:', validProgress)
      setLocalProgress(validProgress)
    }
  }, [progressData])

  // Mark room as completed with validation and deduplication - stabilized version
  const markRoomCompleted = useCallback(async (roomId: string) => {
    // Validation: Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.warn(`ProgressContext: User not authenticated, cannot mark room ${roomId} as completed`)
      return
    }

    // Validation: Check if progressData has been loaded (avoid acting on undefined state)
    if (progressData === undefined) {
      console.warn(`ProgressContext: Progress data not loaded yet, deferring room ${roomId} completion`)
      setPendingRoomId(roomId) // Will be processed via debounce when data loads
      return
    }

    // Check if already processed to avoid duplicates
    if (processedRooms.current.has(roomId)) {
      console.log(`ProgressContext: Room ${roomId} already processed in this session`)
      return
    }

    // Handle empty progress array (Array(0)) case specifically
    const currentProgress = Array.isArray(localProgressRef.current) ? localProgressRef.current : []
    
    // Check if already completed in current state
    if (currentProgress.includes(roomId)) {
      console.log(`ProgressContext: Room ${roomId} already marked as completed`)
      processedRooms.current.add(roomId) // Mark as processed to avoid future calls
      return
    }

    console.log(`ProgressContext: Marking room ${roomId} as completed (current progress: [${currentProgress.join(', ')}])`)
    
    try {
      // Mark as processed before API call to prevent duplicates
      processedRooms.current.add(roomId)
      await markRoomCompletedMutation.mutateAsync(roomId)
    } catch (error) {
      // Remove from processed set if API call failed
      processedRooms.current.delete(roomId)
      console.error(`ProgressContext: Failed to mark room ${roomId} as completed:`, error)
      throw error
    }
  }, [isAuthenticated, user, progressData, markRoomCompletedMutation]) // Removed localProgress to break dependency loop
  
  // Keep localProgress ref for the markRoomCompleted function
  const localProgressRef = useRef<string[]>(localProgress)
  useEffect(() => {
    localProgressRef.current = localProgress
  }, [localProgress])

  // Process debounced room completion when data becomes available
  useEffect(() => {
    if (debouncedRoomId && progressData !== undefined && isAuthenticated) {
      console.log('ProgressContext: Processing debounced room completion:', debouncedRoomId)
      markRoomCompleted(debouncedRoomId)
      setPendingRoomId(null) // Clear after processing
    }
  }, [debouncedRoomId, progressData, isAuthenticated, markRoomCompleted])

  // Check if room is completed - handle empty arrays safely
  const isRoomCompleted = useCallback((roomId: string): boolean => {
    const currentProgress = Array.isArray(localProgress) ? localProgress : []
    return currentProgress.includes(roomId)
  }, [localProgress])

  // Calculate current progress percentage - handle empty arrays safely
  const currentProgress = useMemo(() => {
    const totalRooms = Object.keys(rooms).length || 5 // Default to 5 rooms
    const currentProgressArray = Array.isArray(localProgress) ? localProgress : []
    const completedCount = currentProgressArray.length
    return totalRooms > 0 ? Math.round((completedCount / totalRooms) * 100) : 0
  }, [localProgress, rooms])

  // Persist progress to localStorage for offline support
  useEffect(() => {
    if (user?.email && localProgress.length > 0) {
      localStorage.setItem(`user_progress_${user.email}`, JSON.stringify({
        completedRooms: localProgress,
        lastUpdated: new Date().toISOString(),
      }))
    }
  }, [localProgress, user?.email])

  // Load progress from localStorage on mount - ensure array safety
  useEffect(() => {
    if (user?.email && progressData === undefined) {
      const savedProgress = localStorage.getItem(`user_progress_${user.email}`)
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress)
          const savedRooms = Array.isArray(parsed.completedRooms) ? parsed.completedRooms : []
          console.log('ProgressContext: Loading saved progress from localStorage:', savedRooms)
          setLocalProgress(savedRooms)
          // Mark saved rooms as processed
          savedRooms.forEach((roomId: string) => processedRooms.current.add(roomId))
        } catch (error) {
          console.error('ProgressContext: Error parsing saved progress:', error)
          setLocalProgress([]) // Fallback to empty array
        }
      }
    }
  }, [user?.email, progressData])

  // Memoize context value - ensure arrays are always valid
  const contextValue = useMemo(
    () => {
      const safeLocalProgress = Array.isArray(localProgress) ? localProgress : []
      return {
        progress: {
          completedRooms: safeLocalProgress,
          currentProgress,
          lastUpdated: new Date(),
        },
        isLoading,
        error: error as Error | null,
        markRoomCompleted,
        isRoomCompleted,
        refetchProgress,
      }
    },
    [localProgress, currentProgress, isLoading, error, markRoomCompleted, isRoomCompleted, refetchProgress]
  )

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  )
}

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}