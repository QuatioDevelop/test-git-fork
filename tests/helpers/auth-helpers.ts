import { Page, expect } from '@playwright/test'

export interface TestUser {
  email: string
  name: string
  lastname: string
  country: string
  negocio: string
}

export const generateTestUser = (): TestUser => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  name: 'Juan',
  lastname: 'Pérez',
  country: 'Colombia',
  negocio: 'Negocio 1'
})

export const clearAuthState = async (page: Page) => {
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch (error) {
    // If localStorage is not available, navigate to a page first
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
    await page.goto(baseUrl)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }
}

export const setupE2EApiInterception = async (page: Page) => {
  // Intercept all API requests and add E2E test header
  await page.route('**/api.*.esenciafest.com/**', async (route) => {
    const request = route.request()
    const headers = {
      ...request.headers(),
      'x-e2e-test-key': process.env.E2E_TEST_SECRET || 'e2e-test-secret-2025'
    }
    
    await route.continue({
      headers
    })
  })
}

export const extractAuthToken = async (page: Page): Promise<string | null> => {
  return await page.evaluate(() => {
    return localStorage.getItem('auth_access_token') || 
           localStorage.getItem('auth_token') || 
           localStorage.getItem('auth-token') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('auth_access_token') ||
           sessionStorage.getItem('auth_token') ||
           sessionStorage.getItem('auth-token') ||
           sessionStorage.getItem('token')
  })
}

export const attemptLogin = async (page: Page, email: string): Promise<boolean> => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  await page.goto(`${baseUrl}/login`, { timeout: 30000 })
  
  await page.fill('input[type="email"]', email)
  await page.click('button[type="submit"]')
  
  // Wait for either success (redirect to home) or error
  await page.waitForTimeout(5000)
  
  const currentUrl = page.url()
  
  // If redirected to home, login was successful
  if (currentUrl.includes('/') && !currentUrl.includes('/login')) {
    return true
  }
  
  // If stayed on login or went to register, login failed
  return false
}

export const completeRegistration = async (page: Page, user: TestUser): Promise<void> => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  // Check if we're already on registration page, if not navigate
  if (!page.url().includes('/register')) {
    await page.goto(`${baseUrl}/register`, { timeout: 30000 })
  }
  
  // Fill registration form
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[id="name"]', user.name)
  await page.fill('input[id="lastname"]', user.lastname)
  await page.selectOption('select[id="country"]', user.country)
  await page.selectOption('select[id="negocio"]', user.negocio)
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for success (redirect to home) - increased timeout for Firefox
  await expect(page).toHaveURL(`${baseUrl}/`, { timeout: 30000 })
}

export const logout = async (page: Page): Promise<void> => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  // Navigate to home page first (where logout button is)
  await page.goto(`${baseUrl}/`, { timeout: 30000 })
  
  // Look for logout button and click it
  const logoutButton = page.getByRole('button', { name: /cerrar sesión/i })
  if (await logoutButton.isVisible()) {
    // Use Promise.all to handle the navigation that happens via window.location.href
    await Promise.all([
      // Wait for navigation to login page (flexible with trailing slash)
      page.waitForURL(/.*\/login\/?\?logout=true/, { 
        timeout: 30000,
        waitUntil: 'domcontentloaded' 
      }),
      // Click the logout button
      logoutButton.click()
    ])
  } else {
    // Fallback: Clear auth state manually if button not found
    await clearAuthState(page)
    await page.goto(`${baseUrl}/login`, { timeout: 30000 })
  }
  
  // Should be able to see login form (not redirected)
  await expect(page.locator('form')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 10000 })
}

export const login = async (page: Page, email: string): Promise<void> => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  await page.goto(`${baseUrl}/login`, { timeout: 30000 })
  
  await page.fill('input[type="email"]', email)
  
  // Wait for button to be enabled and clickable before clicking
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible', timeout: 15000 })
  await submitButton.click({ timeout: 30000 })
  
  // Should redirect to home on successful login
  await expect(page).toHaveURL(`${baseUrl}/`, { timeout: 30000 })
}

export const deleteUser = async (page: Page): Promise<void> => {
  const token = await extractAuthToken(page)
  
  if (!token) {
    console.warn('No auth token found, skipping user deletion')
    return
  }
  
  // Use the same API URL that the client app uses
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dev.esenciafest.com'
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  
  // Call delete endpoint
  await page.evaluate(async ({ authToken, apiEndpoint, origin }) => {
    const response = await fetch(`${apiEndpoint}/user/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Origin': origin
      }
    })
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`)
    }
    
    return response.json()
  }, { authToken: token, apiEndpoint: apiUrl, origin: clientUrl })
  
  // Clear local state after deletion
  await clearAuthState(page)
}