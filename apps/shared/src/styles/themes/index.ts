/**
 * SURA Esencia Fest 2025 - Theme System
 * Centralized theme management for client and admin applications
 */

import { clientTheme, type ClientTheme } from './client'
import { adminTheme, type AdminTheme } from './admin'

export { clientTheme, type ClientTheme, adminTheme, type AdminTheme }

export const themes = {
  client: clientTheme,
  admin: adminTheme
} as const

export type ThemeType = keyof typeof themes
export type Theme = typeof themes[ThemeType]