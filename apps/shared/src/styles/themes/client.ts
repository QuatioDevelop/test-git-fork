/**
 * SURA Esencia Fest 2025 - Client Theme
 * Blue theme for user-facing application
 */

import { colors } from '../tokens/colors'

export const clientTheme = {
  colors: {
    primary: colors.client.primary,
    secondary: colors.client.secondary,
    accent: colors.client.accent,
    light: colors.client.light,
    dark: colors.client.dark,
    
    // Semantic colors
    background: colors.background.primary,
    backgroundSecondary: colors.background.secondary,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.muted,
    border: colors.border.primary,
    
    // Interactive states
    hover: colors.client.secondary,
    focus: colors.client.accent,
    active: colors.client.dark,
    disabled: colors.gray[400],
    
    // Status colors
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info
  },
  
  // CSS variables for runtime theming
  cssVariables: {
    '--theme-primary': colors.client.primary,
    '--theme-secondary': colors.client.secondary,
    '--theme-accent': colors.client.accent,
    '--theme-light': colors.client.light,
    '--theme-dark': colors.client.dark,
    '--theme-hover': colors.client.secondary,
    '--theme-focus': colors.client.accent,
    '--theme-active': colors.client.dark
  }
} as const

export type ClientTheme = typeof clientTheme