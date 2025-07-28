// API service utilities for global state management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dev.esenciafest.com'

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_access_token')
}

// Helper for authenticated requests
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token available')
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
  })

  return response
}

// Rooms API
export const roomsAPI = {
  async getRoomsStatus() {
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
      throw new Error(`Failed to fetch rooms status: ${response.statusText}`)
    }

    return response.json()
  },
}

// Progress API
export const progressAPI = {
  async getUserProgress() {
    const response = await authenticatedFetch(`${API_BASE_URL}/user/progress`)

    if (!response.ok) {
      throw new Error(`Failed to fetch user progress: ${response.statusText}`)
    }

    return response.json()
  },

  async markRoomCompleted(roomId: string) {
    const response = await authenticatedFetch(`${API_BASE_URL}/user/progress/${roomId}`, {
      method: 'PUT',
    })

    if (!response.ok) {
      throw new Error(`Failed to mark room as completed: ${response.statusText}`)
    }

    return response.json()
  },
}

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type: 'network' | 'auth' | 'validation' | 'server' | 'unknown' = 'unknown'
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    if (error.message.includes('authentication') || error.message.includes('token')) {
      return new APIError('Authentication error', 401, 'auth')
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new APIError('Network error', undefined, 'network')
    }
    return new APIError(error.message, undefined, 'unknown')
  }

  return new APIError('Unknown error occurred', undefined, 'unknown')
}

// Retry logic for critical operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}