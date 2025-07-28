import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const startTime = Date.now()
  console.log('🚀 Starting global setup for E2E tests...')
  console.log(`📊 Test directory: ${config.testDir || './tests/e2e'}`)
  console.log(`🔧 Workers: ${config.workers || 'undefined (will use default)'}`)
  console.log(`⏱️  Timeout: ${config.timeout || 'undefined (will use default)'}ms`)
  console.log(`🔄 Retries: ${config.retries || 0}`)
  console.log(`🌐 Projects: ${config.projects?.map(p => p.name).join(', ') || 'none'}`)
  
  if (process.env.CI) {
    console.log('🤖 Running in CI environment')
  } else {
    console.log('💻 Running in local development environment')
  }
  
  // Basic setup - let webServer handle the server startup
  // This setup can be used for any shared preparation if needed
  
  const endTime = Date.now()
  console.log(`✅ Global setup completed successfully in ${endTime - startTime}ms`)
}

export default globalSetup