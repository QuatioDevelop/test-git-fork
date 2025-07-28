// Centralized type definitions for global state management

// User types
export interface User {
  email: string
  name: string
  lastname: string
  country: string
  negocio?: string
  role?: string
  position?: string
}

// Room types
export interface Room {
  id: string
  title: string
  status: 'available' | 'locked' | 'coming_soon'
  openAt?: string
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

// Progress types
export interface UserProgress {
  completedRooms: string[]
  currentProgress: number // Percentage 0-100
  lastUpdated: Date
}

// Global state type combining all contexts
export interface GlobalState {
  user: {
    data: User | null
    isLoading: boolean
    updateUser: (updates: Partial<User>) => void
    clearUser: () => void
  }
  rooms: {
    data: RoomsState
    localState: Record<string, RoomLocalState>
    isLoading: boolean
    error: Error | null
    refetch: () => void
    updateLocalState: (roomId: string, state: Partial<RoomLocalState>) => void
    isRoomAvailable: (roomId: string) => boolean
    getRoomById: (roomId: string) => Room | undefined
  }
  progress: {
    data: UserProgress
    isLoading: boolean
    error: Error | null
    markRoomCompleted: (roomId: string) => Promise<void>
    isRoomCompleted: (roomId: string) => boolean
    refetch: () => void
  }
}

// API error types
export type APIErrorType = 'network' | 'auth' | 'validation' | 'server' | 'unknown'

// Event types for analytics
export interface AnalyticsEvent {
  type: 'room_visit' | 'room_complete' | 'progress_update' | 'user_update'
  data: Record<string, unknown>
  timestamp: Date
  userId?: string
}