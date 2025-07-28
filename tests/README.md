# Testing Guide - Esencia Fest 2025

## Quick Start

```bash
# Ejecutar todos los tests E2E de autenticación
npx playwright test tests/e2e/user-flows.spec.ts

# Con interfaz gráfica (recomendado para desarrollo)
npx playwright test tests/e2e/user-flows.spec.ts --headed

# Test específico
npx playwright test tests/e2e/user-flows.spec.ts -g "complete user journey"

# Ver resultados detallados
npx playwright show-report
```

## Estructura de Tests

```
tests/
├── e2e/                      # End-to-End tests
│   ├── client.spec.ts        # Tests generales del cliente
│   ├── admin.spec.ts         # Tests del panel admin  
│   └── user-flows.spec.ts    # Tests de autenticación ⭐
├── helpers/                  # Utilidades de testing
│   └── auth-helpers.ts       # Helpers de autenticación ⭐
├── global-setup.ts           # Setup global
└── smoke/                    # Smoke tests
    └── build-validation.test.ts
```

## Tests de Autenticación

### ✅ Tests Implementados

| Test | Descripción | Duración |
|------|-------------|----------|
| **complete user journey** | Login falla → Registro → Logout → Login exitoso | ~15s |
| **direct registration flow** | Registro directo desde /register | ~8s |
| **form validation works** | Validaciones de formulario frontend | ~5s |
| **login with existing user** | Login con usuario ya registrado | ~10s |
| **auto-redirect** | Login falla → Auto-redirect a registro | ~12s |

### 🔧 Helpers Disponibles

#### `generateTestUser()`
Crea un usuario único para cada test:
```typescript
const user = generateTestUser()
// user.email = "test-1642534567890-abc123@example.com"
```

#### `completeRegistration(page, user)`
Completa el formulario de registro:
- Llena todos los campos requeridos
- Selecciona país y negocio de las opciones disponibles
- Submite y espera redirect exitoso

#### `deleteUser(page)`
Elimina el usuario usando el endpoint `DELETE /user/delete`:
- Extrae JWT token del localStorage
- Llama al endpoint de auto-delete
- Limpia estado local

#### `attemptLogin(page, email)`
Intenta login y retorna si fue exitoso:
```typescript
const success = await attemptLogin(page, "user@example.com")
if (!success) {
  // Usuario no existe, continuar con registro
}
```

## Estrategia de Cleanup

### 🧹 Auto-Delete System

**Problema:** Los tests E2E crean usuarios reales en DynamoDB que se acumulan.

**Solución:** Cada test elimina su propio usuario usando el endpoint `DELETE /user/delete`.

```typescript
test('mi test', async ({ page }) => {
  const user = generateTestUser()
  
  // ... realizar acciones de test
  
  // Cleanup automático al final
  await deleteUser(page) // ✅ Usuario eliminado
})
```

### 🔄 Test Isolation

- **beforeEach**: Limpia localStorage/sessionStorage
- **Usuario único**: Email con timestamp + random por test
- **Sin dependencias**: Tests pueden ejecutarse en cualquier orden

## Troubleshooting

### 🚨 Error: "Ref not found, likely because element was removed"

**Causa:** El elemento cambió mientras Playwright intentaba interactuar.

**Solución:**
```typescript
// ❌ Malo: referencia puede cambiar
await page.click('button[ref=e15]')

// ✅ Bueno: selector estable
await page.click('button[type="submit"]')
```

### 🚨 Error: "No auth token found, skipping user deletion"

**Causa:** El token no se guardó correctamente en localStorage.

**Verificación:**
1. ¿El registro fue exitoso? (redirect a home)
2. ¿El token se está guardando con key `auth_token`?
3. ¿Hay errores de CORS en la consola?

### 🚨 Error: "User already exists"

**Causa:** El cleanup no funcionó en el test anterior.

**Solución:**
```bash
# Limpiar manualmente usuarios test en DynamoDB (dev)
# O usar email más único
const user = generateTestUser() // Ya incluye timestamp + random
```

### 🚨 Tests lentos o timeouts

**Causa:** Timeouts por defecto muy bajos para flujos de auth.

**Configuración:** `playwright.config.ts`
```typescript
use: {
  actionTimeout: 15000,      // Acciones individuales
  navigationTimeout: 15000,  // Navegación entre páginas
}
```

## Desarrollo de Nuevos Tests

### 1. Test de Formulario Simple

```typescript
test('nuevo campo funciona', async ({ page }) => {
  await page.goto('http://localhost:3000/register')
  
  // Llenar campo específico
  await page.fill('input[id="nuevo-campo"]', 'valor')
  
  // Verificar que se guarda
  await expect(page.locator('input[id="nuevo-campo"]')).toHaveValue('valor')
})
```

### 2. Test con Cleanup

```typescript
test('flujo completo con cleanup', async ({ page }) => {
  const user = generateTestUser()
  
  // Setup inicial
  await clearAuthState(page)
  
  // Ejecutar test
  await completeRegistration(page, user)
  await expect(page).toHaveURL('http://localhost:3000/')
  
  // Cleanup
  await deleteUser(page)
})
```

### 3. Test de UX Flow

```typescript
test('nuevo flujo UX', async ({ page }) => {
  const user = generateTestUser()
  
  // Paso 1: Estado inicial
  await page.goto('http://localhost:3000/nueva-pagina')
  
  // Paso 2: Acción usuario
  await page.click('button[data-action="nueva-accion"]')
  
  // Paso 3: Verificar resultado
  await expect(page.locator('text=Resultado Esperado')).toBeVisible()
  
  // Cleanup si es necesario
  if (await page.locator('text=Usuario creado').isVisible()) {
    await deleteUser(page)
  }
})
```

## Comandos Útiles

```bash
# Ejecutar solo tests que fallan
npx playwright test tests/e2e/user-flows.spec.ts --last-failed

# Ejecutar con debug mode
npx playwright test tests/e2e/user-flows.spec.ts --debug

# Ejecutar en modo paralelo (más rápido)
npx playwright test tests/e2e/user-flows.spec.ts --workers=4

# Generar reporte con traces
npx playwright test tests/e2e/user-flows.spec.ts --trace=on

# Solo Chrome/Firefox
npx playwright test tests/e2e/user-flows.spec.ts --project=chromium
npx playwright test tests/e2e/user-flows.spec.ts --project=firefox
```

## Prerequisites

1. **Frontend corriendo**: `npm run dev` (puerto 3000)
2. **Backend desplegado**: API en `https://api.dev.esenciafest.com`
3. **Playwright instalado**: `npx playwright install`

---

**💡 Tip:** Para desarrollo rápido, usar `--headed` para ver qué está pasando en el browser en tiempo real.