/**
 * SURA Esencia Fest 2025 - Styles System
 * Main export for all styling utilities, tokens, and themes
 */

// Export all tokens
export * from './tokens'

// Export all themes
export * from './themes'

// Export font utilities
export const fontUtils = {
  loadFonts: () => {
    // This function can be used to preload fonts if needed
    if (typeof document !== 'undefined') {
      const fontLink = document.createElement('link')
      fontLink.rel = 'preload'
      fontLink.href = '/fonts/SuraSans-Regular.otf'
      fontLink.as = 'font'
      fontLink.type = 'font/otf'
      fontLink.crossOrigin = 'anonymous'
      document.head.appendChild(fontLink)
    } else {
      console.warn('loadFonts called in a non-browser environment. No action taken.')
    }
  }
}

// CSS class utilities for easy integration
export const cssClasses = {
  // Font family classes
  fontSura: 'font-sura',
  fontMono: 'font-mono',
  
  // Theme classes
  themeClient: 'theme-client',
  themeAdmin: 'theme-admin',
  
  // Common utility classes
  textPrimary: 'text-primary',
  textSecondary: 'text-secondary',
  bgPrimary: 'bg-primary',
  bgSecondary: 'bg-secondary'
} as const