// Common types shared across apps

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
  lastActive?: string
}

export interface Room {
  id: string
  name: string
  type: 'video' | 'gallery360' | 'chat' | 'forum' | 'external'
  description: string
  isActive: boolean
  maxCapacity?: number
  currentUsers?: number
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  roomId: string
  type: 'text' | 'image' | 'system'
  isDeleted?: boolean
}

export interface ForumPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
  likes: number
  replies: ForumReply[]
  tags?: string[]
}

export interface ForumReply {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
}

export interface EventConfig {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  timezone: string
  isActive: boolean
  maxUsers: number
  rooms: Room[]
  theme: {
    primaryColor: string
    secondaryColor: string
    logo?: string
  }
}

export interface UserProgress {
  userId: string
  roomsVisited: string[]
  timeSpent: Record<string, number> // roomId -> minutes
  achievementsUnlocked: string[]
  lastActivity: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'chat' | 'user_joined' | 'user_left' | 'room_update' | 'system'
  payload: any
  timestamp: string
  roomId?: string
}