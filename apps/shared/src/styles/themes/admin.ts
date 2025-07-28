/**
 * SURA Esencia Fest 2025 - Admin Theme
 * Red theme for administrative application
 */

import { colors } from '../tokens/colors'

export const adminTheme = {
  colors: {
    primary: colors.admin.primary,
    secondary: colors.admin.secondary,
    accent: colors.admin.accent,
    light: colors.admin.light,
    dark: colors.admin.dark,
    
    // Semantic colors
    background: colors.background.primary,
    backgroundSecondary: colors.background.secondary,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.muted,
    border: colors.border.primary,
    
    // Interactive states
    hover: colors.admin.secondary,
    focus: colors.admin.accent,
    active: colors.admin.dark,
    disabled: colors.gray[400],
    
    // Status colors
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info
  },
  
  // CSS variables for runtime theming
  cssVariables: {
    '--theme-primary': colors.admin.primary,
    '--theme-secondary': colors.admin.secondary,
    '--theme-accent': colors.admin.accent,
    '--theme-light': colors.admin.light,
    '--theme-dark': colors.admin.dark,
    '--theme-hover': colors.admin.secondary,
    '--theme-focus': colors.admin.accent,
    '--theme-active': colors.admin.dark
  }
} as const

export type AdminTheme = typeof adminTheme