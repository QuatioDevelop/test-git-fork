# Testing Strategy & Developer Guide

## Tabla de Contenidos

1. [Resumen](#resumen)
2. [Arquitectura de Testing](#arquitectura-de-testing)
3. [Tipos de Tests](#tipos-de-tests)
4. [Guía para Desarrolladores](#guía-para-desarrolladores)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

## Resumen

El proyecto implementa una estrategia de testing completa con **3 niveles de validación**:

- **Unit Tests** (37 tests): Validación de componentes y funciones individuales
- **Smoke Tests** (3 tests): Validación de builds y funcionalidades críticas
- **E2E Tests** (32 tests): Validación de user journeys completos + authentication flows

### Stack Tecnológico

| Tipo | Framework | Propósito |
|------|-----------|-----------|
| Unit Tests | Vitest + React Testing Library | Testing rápido de componentes/funciones |
| E2E Tests | Playwright | User journeys en browsers reales |
| Coverage | V8 Provider | Reports de cobertura HTML + JSON |
| Mocking | MSW (futuro) | API mocking para tests de integración |

## Arquitectura de Testing

### Estructura de Archivos

```
sura-esenciafest-2025/
├── vitest.config.ts           # Configuración global de Vitest
├── vitest.setup.ts            # Setup global (mocks, utilities)
├── playwright.config.ts       # Configuración de E2E tests
├── scripts/
│   └── view-e2e-results.sh   # Utilidad para ver resultados
├── tests/
│   ├── e2e/                   # E2E tests
│   │   ├── client.spec.ts     # Tests de app cliente
│   │   ├── admin.spec.ts      # Tests de app admin
│   │   └── user-flows.spec.ts # Authentication flow tests
│   ├── helpers/               # Test utilities
│   │   └── auth-helpers.ts    # Authentication test helpers
│   ├── global-setup.ts        # Setup global para E2E
│   └── smoke/                 # Smoke tests
│       └── build-validation.test.ts
└── apps/
    ├── shared/
    │   ├── vitest.config.ts   # Config específica
    │   └── src/
    │       ├── lib/utils.test.ts           # Tests de utilities
    │       └── components/ui/*.test.tsx    # Tests de componentes
    ├── client/
    │   ├── vitest.config.ts
    │   └── src/components/**/*.test.tsx
    └── admin/
        ├── vitest.config.ts
        └── src/components/**/*.test.tsx
```

### Configuración Multi-App

Cada app tiene su propia configuración que extiende la global:

```typescript
// apps/client/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    globals: true,
    css: true,
  },
})
```

## Tipos de Tests

### 1. Unit Tests

**Propósito**: Validar componentes y funciones de forma aislada.

**Cuándo usar**:
- ✅ Nuevos componentes React
- ✅ Funciones utility/helpers
- ✅ Hooks personalizados
- ✅ Lógica de negocio compleja

**Cuándo NO usar**:
- ❌ Integración entre múltiples componentes
- ❌ Navegación entre páginas
- ❌ APIs reales
- ❌ User journeys completos

### 2. Smoke Tests

**Propósito**: Validar que el build es exitoso y funcionalidades críticas funcionan.

**Cuándo usar**:
- ✅ Validar que las apps buildan correctamente
- ✅ Verificar que archivos críticos existen
- ✅ Tests de configuración

### 3. E2E Tests

**Propósito**: Validar user journeys completos en browsers reales.

**Cuándo usar**:
- ✅ Flujos de usuario críticos
- ✅ Navegación entre páginas
- ✅ Formularios complejos
- ✅ Integración entre apps

**Cuándo NO usar**:
- ❌ Validar lógica específica de componentes (usa unit tests)
- ❌ Tests de muchas variaciones de un componente
- ❌ Testing de utilidades/helpers

## Guía para Desarrolladores

### Workflow de Desarrollo con Tests

```bash
# 1. Desarrollo inicial
npm run dev                    # Inicia apps

# 2. Testing durante desarrollo
npm run test:unit              # Ejecuta unit tests (modo watch automático)
# Desarrolla tu componente/función

# 3. Testing específico
cd apps/client && npm run test:run  # Solo tests de client
npm run test:coverage         # Ver cobertura

# 4. Testing completo antes de commit
npm run test:all              # Todos los tests
```

### Reglas para Escribir Tests

#### Unit Tests - Reglas de Oro

1. **Un test por función/comportamiento**
2. **AAA Pattern**: Arrange, Act, Assert
3. **Nombres descriptivos**: `should return formatted date when given valid date`
4. **Tests independientes**: No dependencias entre tests
5. **Mock dependencies**: No llamadas a APIs reales

#### E2E Tests - Reglas de Oro

1. **User-focused**: Escribe desde la perspectiva del usuario
2. **Resilientes**: Usa `data-testid` para elementos críticos
3. **Esperas apropiadas**: `waitForLoadState`, `expect().toBeVisible()`
4. **Manejo de duplicados**: Usa `.first()` cuando hay elementos duplicados

### Cuándo Escribir Cada Tipo de Test

#### Para una Nueva Feature

```
Nueva Feature: "Sistema de Notificaciones"

📋 Plan de Testing:

1. Unit Tests (OBLIGATORIO):
   ├── NotificationService.test.ts
   ├── NotificationComponent.test.tsx
   ├── useNotifications.test.ts
   └── notification-utils.test.ts

2. E2E Tests (OBLIGATORIO para UI):
   ├── notifications-display.spec.ts
   └── notifications-interaction.spec.ts

3. Smoke Tests (OPCIONAL):
   └── Solo si afecta build process
```

#### Para un Bug Fix

```
Bug Fix: "Login form no valida email"

📋 Plan de Testing:

1. Unit Test (OBLIGATORIO):
   └── email-validation.test.ts    # Test que reproduce el bug

2. E2E Test (SI AFECTA UX):
   └── login-validation.spec.ts    # User journey completo

3. Smoke Test (NO):
   └── No necesario para bug fixes
```

## Ejemplos Prácticos

### Ejemplo Frontend - Unit Test

```typescript
// apps/shared/src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, cn, isValidEmail } from './utils'

describe('formatDate', () => {
  it('should format date correctly in DD/MM/YYYY format', () => {
    const date = new Date('2025-01-15')
    expect(formatDate(date)).toBe('15/01/2025')
  })

  it('should handle invalid dates gracefully', () => {
    const invalidDate = new Date('invalid')
    expect(formatDate(invalidDate)).toBe('Invalid Date')
  })
})

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('base', 'modifier')).toBe('base modifier')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'disabled')).toBe('base active')
  })
})
```

### Ejemplo Frontend - Component Test

```typescript
// apps/shared/src/components/ui/brand-button.test.tsx
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandButton } from './brand-button'

describe('BrandButton', () => {
  it('should render with correct variant styling', () => {
    render(<BrandButton variant="client">Click me</BrandButton>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600') // Client theme
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<BrandButton onClick={handleClick}>Click me</BrandButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<BrandButton disabled>Disabled</BrandButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })
})
```

### Ejemplo Backend - Function Test

```javascript
// iac/backend/src/auth.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock del AWS SDK
vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({})),
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
}))

// Función a testear
const authenticateUser = async (email, password) => {
  // Validación básica
  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing credentials' }) }
  }
  
  // Validar formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) }
  }
  
  // Simulación de autenticación
  if (email === 'admin@sura.com' && password === 'test123') {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        token: 'jwt-token-123',
        user: { email, role: 'admin' }
      })
    }
  }
  
  return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) }
}

describe('authenticateUser', () => {
  it('should return 400 when email is missing', async () => {
    const result = await authenticateUser('', 'password')
    
    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).error).toBe('Missing credentials')
  })

  it('should return 400 for invalid email format', async () => {
    const result = await authenticateUser('invalid-email', 'password')
    
    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).error).toBe('Invalid email format')
  })

  it('should return 200 with token for valid credentials', async () => {
    const result = await authenticateUser('admin@sura.com', 'test123')
    
    expect(result.statusCode).toBe(200)
    
    const body = JSON.parse(result.body)
    expect(body.token).toBe('jwt-token-123')
    expect(body.user.email).toBe('admin@sura.com')
    expect(body.user.role).toBe('admin')
  })

  it('should return 401 for invalid credentials', async () => {
    const result = await authenticateUser('user@test.com', 'wrongpassword')
    
    expect(result.statusCode).toBe(401)
    expect(JSON.parse(result.body).error).toBe('Invalid credentials')
  })
})
```

### Ejemplo E2E Test

```typescript
// tests/e2e/client.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Client App E2E Tests', () => {
  test('should complete user registration flow', async ({ page }) => {
    // Arrange: Navigate to registration
    await page.goto('/')
    await page.click('[data-testid="register-button"]')
    
    // Act: Fill registration form
    await page.fill('[data-testid="email-input"]', 'user@test.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!')
    
    // Act: Submit form
    await page.click('[data-testid="submit-button"]')
    
    // Assert: Check success state
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should navigate between rooms in ciudadela', async ({ page }) => {
    // Arrange: Start at homepage
    await page.goto('/')
    
    // Act: Click on Galería 360° room (use .first() for duplicates)
    await page.getByText('Galería 360°').first().click()
    
    // Assert: Should navigate to gallery
    await expect(page).toHaveURL('/gallery')
    await expect(page.getByText('Galería Virtual')).toBeVisible()
    
    // Act: Return to ciudadela
    await page.click('[data-testid="back-to-ciudadela"]')
    
    // Assert: Back to main page
    await expect(page).toHaveURL('/')
    await expect(page.getByText('¡Bienvenido a la Ciudadela Virtual')).toBeVisible()
  })
})
```

## Authentication Flow Testing

### Estrategia de Testing de Autenticación

El sistema implementa **tests E2E específicos** para validar flujos de autenticación con estrategia de cleanup automático:

#### Tests Implementados

| Test | Propósito | Cleanup |
|------|-----------|---------|
| `complete user journey` | Login → Registro → Logout → Login | ✅ Auto-delete |
| `direct registration flow` | Registro directo sin auto-redirect | ✅ Auto-delete |
| `form validation works` | Validaciones frontend | N/A |
| `login with existing user` | Login con usuario pre-existente | ✅ Auto-delete |
| `auto-redirect from login to registration` | UX flow login→registro | ✅ Auto-delete |

#### Helpers de Autenticación

**Archivo:** `tests/helpers/auth-helpers.ts`

```typescript
// Generar usuario único por test
const user = generateTestUser() // Email con timestamp único

// Flujos de usuario
await attemptLogin(page, email)        // Intenta login
await completeRegistration(page, user) // Completa registro
await logout(page)                     // Cierra sesión
await deleteUser(page)                 // Auto-delete con JWT
```

#### Estrategia de Cleanup

1. **Usuario único por test**: Email con timestamp + random
2. **Auto-delete endpoint**: `DELETE /user/delete` con JWT token
3. **Test isolation**: `beforeEach` limpia localStorage
4. **No acumulación**: Usuarios eliminados automáticamente

### Comandos de Testing

```bash
# Ejecutar tests de autenticación
npx playwright test tests/e2e/user-flows.spec.ts

# Con interfaz gráfica
npx playwright test tests/e2e/user-flows.spec.ts --headed

# Test específico
npx playwright test tests/e2e/user-flows.spec.ts -g "complete user journey"

# Ver resultados detallados
npx playwright show-report
```

## CI/CD Integration

### Estrategia de Ejecución

```yaml
# Feature Branches (feature/*)
✓ Unit Tests     (~40s)
✓ Smoke Tests    (~20s)
✗ E2E Tests      (skipped)
Total: ~1 minuto

# Pull Requests & Main Branches
✓ Unit Tests     (~40s)
✓ Smoke Tests    (~20s)
✓ E2E Tests      (~4m)
Total: ~5 minutos
```

### Artifacts Generados

1. **Coverage Reports**: `coverage-reports-{hash}.zip`
2. **Playwright Report**: `playwright-report-{hash}.zip`
3. **Test Results**: `test-results-{hash}.zip`

### Viewing Results

```bash
# Método 1: Script automático
./scripts/view-e2e-results.sh

# Método 2: Manual download
gh run download <run-id> -n "playwright-report-*"
cd playwright-report && python3 -m http.server 8080
```

## Troubleshooting

### Problemas Comunes

#### Unit Tests

```bash
# Error: "Cannot find module"
Error: Cannot find module '@sura-esenciafest/shared'

# Solución:
npm install  # Rebuild workspace dependencies
```

```bash
# Error: "ReferenceError: window is not defined"
# Solución: Verificar jsdom environment en vitest.config.ts
test: {
  environment: 'jsdom'  // ← Debe estar presente
}
```

#### E2E Tests

```bash
# Error: "Playwright browsers not installed"
# Solución:
npx playwright install
```

```bash
# Error: "Port already in use"
# Solución: Matar procesos existentes
pkill -f "next dev"
npm run test:e2e
```

#### Coverage

```bash
# Error: Coverage no se genera
# Solución: Verificar configuración v8
coverage: {
  provider: 'v8',  // ← v8, no c8
  reporter: ['text', 'json', 'html']
}
```

### Performance Tips

```bash
# Tests más rápidos durante desarrollo
cd apps/client && npm run test:run  # Solo una app

# E2E tests en modo headed (debugging)
npx playwright test --headed

# E2E tests específicos
npx playwright test client.spec.ts -g "should show room buttons"
```

### Debugging

```bash
# Debug unit tests
npm run test:unit -- --reporter=verbose

# Debug E2E con browser visible
npx playwright test --headed --debug

# Ver trace de E2E fallidos
npx playwright show-trace test-results/*/trace.zip
```

## Métricas y KPIs

### Coverage Targets

| App | Statements | Branches | Functions | Lines |
|-----|------------|----------|-----------|-------|
| Shared | >80% | >80% | >80% | >80% |
| Client | >70% | >70% | >70% | >70% |
| Admin | >70% | >70% | >70% | >70% |

### Test Performance

- **Unit Tests**: <2 minutos total
- **E2E Tests**: <5 minutos total
- **CI Pipeline**: <6 minutos end-to-end

---

## Próximos Pasos

1. **API Integration Tests**: MSW para mock de APIs
2. **Visual Regression**: Playwright screenshots
3. **Performance Tests**: Core Web Vitals validation
4. **Accessibility Tests**: axe-core integration