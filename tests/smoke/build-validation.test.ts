import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

describe('Build Validation Smoke Tests', () => {
  const rootDir = path.resolve(__dirname, '../..')
  
  it('should have all required package.json files', () => {
    const requiredPackages = [
      'package.json',
      'apps/client/package.json',
      'apps/admin/package.json',
      'apps/shared/package.json'
    ]
    
    requiredPackages.forEach(pkg => {
      const fullPath = path.join(rootDir, pkg)
      expect(fs.existsSync(fullPath), `Missing package.json: ${pkg}`).toBe(true)
    })
  })

  it('should have turbo.json configuration', () => {
    const turboConfigPath = path.join(rootDir, 'turbo.json')
    expect(fs.existsSync(turboConfigPath)).toBe(true)
    
    const turboConfig = JSON.parse(fs.readFileSync(turboConfigPath, 'utf-8'))
    expect(turboConfig.tasks).toBeDefined()
    expect(turboConfig.tasks.build).toBeDefined()
    expect(turboConfig.tasks.test).toBeDefined()
  })

  it('should have testing configuration files', () => {
    const testingFiles = [
      'vitest.config.ts',
      'vitest.setup.ts',
      'playwright.config.ts',
      'tests/global-setup.ts'
    ]
    
    testingFiles.forEach(file => {
      const fullPath = path.join(rootDir, file)
      expect(fs.existsSync(fullPath), `Missing testing file: ${file}`).toBe(true)
    })
  })

  it('should have vitest configs for each app', () => {
    const vitestConfigs = [
      'apps/client/vitest.config.ts',
      'apps/admin/vitest.config.ts',
      'apps/shared/vitest.config.ts'
    ]
    
    vitestConfigs.forEach(config => {
      const fullPath = path.join(rootDir, config)
      expect(fs.existsSync(fullPath), `Missing vitest config: ${config}`).toBe(true)
    })
  })

  it('should validate package.json scripts are properly configured', () => {
    const rootPackage = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    
    // Check for required scripts
    expect(rootPackage.scripts.test).toBeDefined()
    expect(rootPackage.scripts['test:unit']).toBeDefined()
    expect(rootPackage.scripts['test:coverage']).toBeDefined()
    expect(rootPackage.scripts['test:e2e']).toBeDefined()
    expect(rootPackage.scripts['test:all']).toBeDefined()
  })

  it('should have required testing dependencies', () => {
    const rootPackage = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    
    const requiredDevDeps = [
      'vitest',
      '@vitejs/plugin-react',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      '@playwright/test',
      'jsdom'
    ]
    
    requiredDevDeps.forEach(dep => {
      expect(rootPackage.devDependencies[dep], `Missing dependency: ${dep}`).toBeDefined()
    })
  })

  it('should validate E2E test structure', () => {
    const e2eTestsDir = path.join(rootDir, 'tests/e2e')
    expect(fs.existsSync(e2eTestsDir)).toBe(true)
    
    const e2eTests = [
      'tests/e2e/client.spec.ts',
      'tests/e2e/admin.spec.ts'
    ]
    
    e2eTests.forEach(test => {
      const fullPath = path.join(rootDir, test)
      expect(fs.existsSync(fullPath), `Missing E2E test: ${test}`).toBe(true)
    })
  })
})