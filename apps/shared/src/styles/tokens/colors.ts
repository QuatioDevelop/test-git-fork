/**
 * SURA Esencia Fest 2025 - Color System
 * Centralized color tokens for consistent theming
 */

export const colors = {
  // Base colors
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },
  
  /**
   * Temporary colors for development purposes.
   * These will be replaced with the official SURA palette
   * once final designs are available.
   */
  // SURA Brand - Client Theme (Blue)
  client: {
    primary: '#0066cc',
    secondary: '#004499',
    accent: '#3399ff',
    light: '#cce7ff',
    dark: '#003366'
  },
  
  // SURA Brand - Admin Theme (Red)
  admin: {
    primary: '#dc2626',
    secondary: '#991b1b',
    accent: '#f87171',
    light: '#fee2e2',
    dark: '#7f1d1d'
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Background variations
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    inverse: '#111827'
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    muted: '#d1d5db'
  },
  
  // Border colors
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    focus: '#3b82f6',
    error: '#ef4444'
  }
} as const

export type Colors = typeof colors