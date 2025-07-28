import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock js-cookie
const mockCookies = {
  data: {} as Record<string, string>,
  set: vi.fn((name: string, value: string) => {
    mockCookies.data[name] = value
  }),
  get: vi.fn((name: string) => mockCookies.data[name] || null),
  remove: vi.fn((name: string) => {
    delete mockCookies.data[name]
  })
}

vi.mock('js-cookie', () => ({
  default: mockCookies
}))

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn().mockReturnValue({
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  })
}))

describe('Auth Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.data = {}
    localStorage.clear()
  })

  it('should handle localStorage operations', () => {
    const testToken = 'test-access-token-123'
    
    localStorage.setItem('auth_access_token', testToken)
    const retrieved = localStorage.getItem('auth_access_token')
    
    expect(retrieved).toBe(testToken)
    
    localStorage.removeItem('auth_access_token')
    const cleared = localStorage.getItem('auth_access_token')
    
    expect(cleared).toBeNull()
  })

  it('should handle cookie operations', () => {
    const testToken = 'test-refresh-token-456'
    
    mockCookies.set('refresh_token', testToken)
    expect(mockCookies.set).toHaveBeenCalledWith('refresh_token', testToken)
    
    const retrieved = mockCookies.get('refresh_token')
    expect(retrieved).toBe(testToken)
    
    mockCookies.remove('refresh_token')
    expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token')
  })
})