// Central export for all custom hooks

// Global state management hooks
export { useGlobalState, useRoomVisit, useEventProgress, useRoomAccess } from './useGlobalState'

// Context-specific hooks
export { useUser } from '@/context/UserContext'
export { useRooms } from '@/context/RoomsContext'
export { useProgress } from '@/context/ProgressContext'

// Auth hooks
export { useAuthContext } from '@/components/auth/AuthProvider'