/**
 * SURA Esencia Fest 2025 - Design Tokens
 * Centralized export of all design tokens
 */

import { colors, type Colors } from './colors'
import { typography, type Typography } from './typography'
import { spacing, semanticSpacing, type Spacing, type SemanticSpacing } from './spacing'

export { colors, type Colors, typography, type Typography, spacing, semanticSpacing, type Spacing, type SemanticSpacing }

// Combined tokens export
export const tokens = {
  colors,
  typography,
  spacing,
  semanticSpacing
} as const

export type Tokens = typeof tokens