import { describe, it, expect } from 'vitest'
import { cn, createApiUrl, isValidEmail, formatDate, formatTime } from './utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-blue-500', 'text-white', 'hover:bg-blue-600')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
      expect(result).toContain('hover:bg-blue-600')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'not-included')
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('not-included')
    })
  })

  describe('createApiUrl function', () => {
    it('should create API URL with endpoint starting with slash', () => {
      const url = createApiUrl('/users')
      expect(url).toBe('https://api.esenciafest.com/users')
    })

    it('should create API URL with endpoint not starting with slash', () => {
      const url = createApiUrl('users')
      expect(url).toBe('https://api.esenciafest.com/users')
    })

    it('should handle complex endpoints', () => {
      const url = createApiUrl('/api/v1/users/123')
      expect(url).toBe('https://api.esenciafest.com/api/v1/users/123')
    })
  })

  describe('isValidEmail function', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co')).toBe(true)
      expect(isValidEmail('test+label@example.org')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test.domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('formatDate function', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-08-18T10:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toBe('18 de agosto de 2025')
    })

    it('should handle string date input', () => {
      const formatted = formatDate('2025-08-18')
      expect(formatted).toContain('agosto')
      expect(formatted).toContain('2025')
    })
  })

  describe('formatTime function', () => {
    it('should format time correctly', () => {
      const date = new Date('2025-08-18T14:30:00Z')
      const formatted = formatTime(date)
      // The exact format may vary by timezone, but should contain hours and minutes
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should handle string date input', () => {
      const formatted = formatTime('2025-08-18T14:30:00Z')
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })
})