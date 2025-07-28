/**
 * SURA Esencia Fest 2025 - Typography System
 * Centralized typography tokens using SuraSans font family
 */

export const typography = {
  // Font families
  fontFamily: {
    sura: ['SuraSans', 'Geist Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    bold: 700,
    black: 900
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px
    '5xl': { size: '3rem', lineHeight: '1' },         // 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },      // 60px
    '7xl': { size: '4.5rem', lineHeight: '1' },       // 72px
    '8xl': { size: '6rem', lineHeight: '1' },         // 96px
    '9xl': { size: '8rem', lineHeight: '1' }          // 128px
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },
  
  // Text transform presets
  textTransform: {
    none: 'none',
    capitalize: 'capitalize',
    uppercase: 'uppercase',
    lowercase: 'lowercase'
  }
} as const

export type Typography = typeof typography