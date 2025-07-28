import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    globals: true,
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sura-esenciafest/shared': path.resolve(__dirname, '../shared/src'),
      '@sura-esenciafest/shared/utils': path.resolve(__dirname, '../shared/src/lib/utils.ts')
    }
  }
})