import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { LoginFormData, RegisterFormData } from './schemas'

// API Base URL - configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dev.esenciafest.com'
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'

// Log environment info in development
if (ENVIRONMENT === 'development') {
  console.log('🌍 Auth Service Environment:', ENVIRONMENT)
  console.log('🔗 API Base URL:', API_BASE_URL)
}

// Types for API responses
export interface AuthResponse {
  token: string
  refreshToken?: string
  user: {
    email: string
    name: string
    lastname: string
    role: string
    position: string
    country: string
    progress: string[]
  }
}

// Token payload interface for decoded JWT
interface TokenPayload {
  email: string
  name: string
  lastname?: string
  role?: string
  position?: string
  country: string
  progress?: string[]
  exp: number
  iat: number
}

export interface AuthErrorResponse {
  error: string
  message: string
}

// Custom error types for better error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public type: 'registration_required' | 'invalid_credentials' | 'network_error' | 'validation_error' | 'unknown'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// Error handler utility
export const handleAuthError = (error: unknown): AuthError => {
  console.error('Authentication error:', error)
  
  // Handle fetch error response
  if (error instanceof Error) {
    const errorMessage = error.message
    
    // Check if the error message contains the backend error type
    if (errorMessage.includes('registration_required') || 
        errorMessage.includes('User not found, please provide')) {
      return new AuthError('Usuario no encontrado, por favor regístrate', 'registration_required')
    }
    
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return new AuthError('Error de conexión. Verifica tu conexión a internet', 'network_error')
    }
    
    if (errorMessage.includes('validation')) {
      return new AuthError('Datos inválidos. Por favor verifica la información', 'validation_error')
    }
    
    return new AuthError(errorMessage, 'unknown')
  }
  
  return new AuthError('Error desconocido', 'unknown')
}

// Token storage utilities - Hybrid approach for security
const TOKEN_STORAGE = {
  // Access token in localStorage (multi-tab support + persistence)
  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', token)
      // Also set in cookie for middleware access (non-httpOnly for client-side access)
      Cookies.set('auth_access_token', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1, // 1 day (shorter than refresh token)
        path: '/'
      })
    }
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_access_token')
  },

  clearAccessToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_access_token')
      // Also clear the cookie
      Cookies.remove('auth_access_token', { path: '/' })
    }
  },

  // Refresh token in httpOnly cookie (security against XSS)
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      Cookies.set('refresh_token', token, {
        httpOnly: false, // Note: js-cookie can't set httpOnly, this would be set by server
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 30, // 30 days
        path: '/'
      })
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get('refresh_token') || null
  },

  clearRefreshToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('refresh_token', { path: '/' })
    }
  },

  // Token validation and expiration checking
  isTokenValid(token: string): boolean {
    try {
      const decoded: TokenPayload = jwtDecode(token)
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch {
      return false
    }
  },

  getTokenExpiration(token: string): number | null {
    try {
      const decoded: TokenPayload = jwtDecode(token)
      return decoded.exp * 1000 // Convert to milliseconds
    } catch {
      return null
    }
  },

  // Check if token expires within the next 5 minutes
  shouldRefreshToken(token: string): boolean {
    try {
      const decoded: TokenPayload = jwtDecode(token)
      const currentTime = Date.now() / 1000
      const fiveMinutesFromNow = currentTime + (5 * 60) // 5 minutes
      return decoded.exp < fiveMinutesFromNow
    } catch {
      return true // If we can't decode, assume we should refresh
    }
  }
}

// Authentication API functions
export const authService = {
  // Login/Register unified endpoint
  async authenticate(data: LoginFormData | RegisterFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error: AuthErrorResponse = await response.json()
      // Include error type in the thrown error for proper handling
      const errorMessage = error.error === 'registration_required' 
        ? 'registration_required: ' + error.message
        : error.message || 'Error de autenticación'
      throw new Error(errorMessage)
    }

    return response.json()
  },

  // Get current user from token using hybrid storage
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    const token = TOKEN_STORAGE.getAccessToken()
    if (!token) return null

    try {
      // Check if token is valid and not expired
      if (!TOKEN_STORAGE.isTokenValid(token)) {
        TOKEN_STORAGE.clearAccessToken()
        return null
      }

      // Decode JWT payload using jwt-decode library
      const payload: TokenPayload = jwtDecode(token)

      // Return user info from decoded token
      return {
        email: payload.email,
        name: payload.name,
        lastname: payload.lastname || '',
        role: payload.role || '',
        position: payload.position || '',
        country: payload.country,
        progress: payload.progress || []
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      TOKEN_STORAGE.clearAccessToken()
      return null
    }
  },

  // Logout - Clear both access token and refresh token
  logout(): void {
    TOKEN_STORAGE.clearAccessToken()
    TOKEN_STORAGE.clearRefreshToken()
    
    // Multi-tab logout trigger
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_logout_trigger', Date.now().toString())
      localStorage.removeItem('auth_logout_trigger')
      // Legacy cleanup - remove old localStorage token if it exists
      localStorage.removeItem('auth_token')
    }
  },

  // Refresh access token using refresh token
  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = TOKEN_STORAGE.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        // If refresh fails, clear tokens
        TOKEN_STORAGE.clearRefreshToken()
        TOKEN_STORAGE.clearAccessToken()
        return null
      }

      return response.json()
    } catch (error) {
      console.error('Token refresh failed:', error)
      TOKEN_STORAGE.clearRefreshToken()
      TOKEN_STORAGE.clearAccessToken()
      return null
    }
  },

  // Get redirect URL from query params
  getRedirectUrl(): string {
    if (typeof window === 'undefined') return '/'
    
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('redirect') || '/'
  },

  // Redirect after successful authentication
  redirectAfterAuth(): void {
    if (typeof window === 'undefined') return
    
    const redirectUrl = this.getRedirectUrl()
    window.location.href = redirectUrl
  }
}

// Custom hooks for authentication
export const useAuth = () => {
  const queryClient = useQueryClient()

  // Get current user query with auto-refresh and expiration handling
  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = TOKEN_STORAGE.getAccessToken()
      
      // OPTIMIZACIÓN: Si no hay token, retorna inmediatamente
      if (!token) {
        return null
      }
      
      // OPTIMIZACIÓN: Solo verificar validez del token (operación rápida)
      if (!TOKEN_STORAGE.isTokenValid(token)) {
        // Token expirado, limpiar y retornar null inmediatamente
        TOKEN_STORAGE.clearAccessToken()
        TOKEN_STORAGE.clearRefreshToken()
        return null
      }
      
      // Token válido, obtener user data directamente del JWT (rápido)
      return authService.getCurrentUser()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    // OPTIMIZACIÓN: Sin refetch automático para mejorar performance
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.authenticate(data),
    onSuccess: (response) => {
      // Store tokens using hybrid approach
      TOKEN_STORAGE.setAccessToken(response.token)
      if (response.refreshToken) {
        TOKEN_STORAGE.setRefreshToken(response.refreshToken)
      }
      // Legacy cleanup
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      queryClient.setQueryData(['auth', 'user'], response.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      const authError = handleAuthError(error)
      console.error('Login error:', authError)
      // Error will be handled by components
    }
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authService.authenticate(data),
    onSuccess: (response) => {
      // Store tokens using hybrid approach
      TOKEN_STORAGE.setAccessToken(response.token)
      if (response.refreshToken) {
        TOKEN_STORAGE.setRefreshToken(response.refreshToken)
      }
      // Legacy cleanup
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      queryClient.setQueryData(['auth', 'user'], response.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      const authError = handleAuthError(error)
      console.error('Register error:', authError)
      // Error will be handled by components
    }
  })

  // Logout mutation with enhanced cleanup
  const logoutMutation = useMutation({
    mutationFn: async (redirectToLogin: boolean = true) => {
      // Clear all authentication data
      authService.logout()
      
      // Clear all auth-related queries from cache
      queryClient.removeQueries({ queryKey: ['auth'] })
      queryClient.clear()
      
      // Redirect to login if requested
      if (redirectToLogin && typeof window !== 'undefined') {
        window.location.href = '/login?logout=true'
      }
      
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })

  // Multi-tab support - listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_logout_trigger') {
        // Another tab logged out, clear current tab
        queryClient.setQueryData(['auth', 'user'], null)
        queryClient.clear()
      } else if (event.key === 'auth_access_token') {
        // Token changed in another tab, refresh user data
        if (event.newValue) {
          // Token added/updated, refresh user data
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
        } else {
          // Token removed, clear user data
          queryClient.setQueryData(['auth', 'user'], null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [queryClient])

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  }
}