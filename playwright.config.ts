import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

/**
 * E2E Test Configuration
 * 
 * IMPORTANT: Tests must run sequentially (workers=1) to prevent interference.
 * When multiple tests run in parallel, they can conflict due to:
 * - Shared authentication state
 * - API rate limiting
 * - Browser context isolation issues
 * - CORS header interception conflicts
 */

// Determine environment from TEST_ENV, NODE_ENV or default to development
// TEST_ENV takes precedence for testing scenarios
const environment = process.env.TEST_ENV || process.env.NODE_ENV || 'development'

// Load environment variables from app-specific .env files
// This ensures tests use the same configuration as the apps
if (environment === 'production') {
  dotenv.config({ path: path.join(__dirname, 'apps/client/.env.production') })
  dotenv.config({ path: path.join(__dirname, 'apps/admin/.env.production') })
} else if (environment === 'staging') {
  dotenv.config({ path: path.join(__dirname, 'apps/client/.env.staging') })
  dotenv.config({ path: path.join(__dirname, 'apps/admin/.env.staging') })
} else {
  // Development or local
  dotenv.config({ path: path.join(__dirname, 'apps/client/.env.development') })
  dotenv.config({ path: path.join(__dirname, 'apps/admin/.env.development') })
  // Also load .env.local if it exists (for local overrides)
  dotenv.config({ path: path.join(__dirname, 'apps/client/.env.local') })
  dotenv.config({ path: path.join(__dirname, 'apps/admin/.env.local') })
}

console.log(`Running E2E tests for environment: ${environment}`)

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel - but workers=1 forces sequential execution */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,  // No retries to fail fast
  /* Use single worker to avoid test interference */
  workers: 1,  // Force sequential execution to prevent E2E test conflicts
  /* Global test timeout - balanced for CI efficiency */
  timeout: process.env.CI ? 30000 : 60000,  // 30s in CI
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CLIENT_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
    /* Increase timeout for auth flows and complex interactions */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    /* Add E2E test authentication header for backend CORS */
    extraHTTPHeaders: {
      'x-e2e-test-key': process.env.E2E_TEST_SECRET || 'e2e-test-secret-2025'
    },
  },

  /* Configure projects for major browsers */
  projects: process.env.CI 
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
      ],

  /* Run client and admin on different ports to avoid conflicts */
  webServer: [
    {
      // In CI, serve the built static files. In local dev, use npm run dev
      command: process.env.CI 
        ? 'cd apps/client && serve out -p 3000'
        : 'cd apps/client && npm run dev -- --port 3000',
      url: 'http://localhost:3000',
      // In CI with serve, let Playwright manage the server
      // In dev, reuse existing server if running
      reuseExistingServer: !process.env.CI,
      timeout: process.env.CI ? 30 * 1000 : 120 * 1000,  // 30s in CI
    },
    {
      // In CI, serve the built static files. In local dev, use npm run dev
      command: process.env.CI 
        ? 'cd apps/admin && serve out -p 3001'
        : 'cd apps/admin && npm run dev -- --port 3001',
      url: 'http://localhost:3001',
      // In CI with serve, let Playwright manage the server
      // In dev, reuse existing server if running
      reuseExistingServer: !process.env.CI,
      timeout: process.env.CI ? 30 * 1000 : 120 * 1000,  // 30s in CI
    }
  ],

  /* Global setup for any shared preparation */
  globalSetup: require.resolve('./tests/global-setup.ts'),
})