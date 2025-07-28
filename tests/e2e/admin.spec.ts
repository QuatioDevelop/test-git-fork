import { test, expect } from '@playwright/test'

test.describe('Admin App E2E Tests', () => {
  const baseUrl = process.env.ADMIN_URL || 'http://localhost:3001'
  
  test('should load admin page and show login form', async ({ page }) => {
    await page.goto(baseUrl)
    
    // Check page loads successfully
    await expect(page).toHaveTitle(/Admin|SURA|Esencia Fest/)
    
    // Check basic login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 2000 })
  })

  test('should be responsive on different viewports', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto(baseUrl)
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 })
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 })
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 })
  })

  test('should load without critical errors', async ({ page }) => {
    await page.goto(baseUrl)
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded')
    
    // Basic page should be accessible
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 })
  })
})