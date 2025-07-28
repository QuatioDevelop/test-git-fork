# Plan para Issue #50: Optimize CI/CD Performance: Fix Next.js Warnings and Add Intelligent Caching

**Fecha de Análisis**: 2025-07-15 23:25
**Estado del Issue**: OPEN
**Labels**: enhancement, infrastructure, testing

## Clasificación: SIMPLE

**Criterios de Clasificación Aplicados:**
- **Configuración Simple**: Migración de configuración deprecada (`experimental.turbo` → `turbopack`)
- **Optimización de Cache**: Implementar caching estándar de GitHub Actions (node_modules, Playwright)
- **Sin Cambios de Arquitectura**: No afecta funcionalidad core, solo optimización de pipeline
- **Impacto Localizado**: Cambios en 2 archivos de configuración + 1 workflow file
- **Resultado**: SIMPLE porque son cambios de configuración y caching sin lógica compleja

## Análisis del Issue

**Descripción del Problema:**
Current CI/CD workflows show deprecation warnings and lack optimization:

```
⚠ The config property `experimental.turbo` is deprecated. Move this setting to `config.turbopack` as Turbopack is now stable.
⚠ Webpack is configured while Turbopack is not, which may cause problems.
```

E2E tests reinstall Playwright browsers (~500MB) and dependencies on every run, causing unnecessary delays.

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 + TypeScript
- Infraestructura: GitHub Actions + AWS (CloudFormation/SAM)
- Package Manager: npm
- Arquitectura: Monorepo con Turborepo + Static Export Strategy

**Estado Actual:**
- Trabajo en progreso: No
- Archivos afectados: 
  - `apps/client/next.config.ts:24-33` (configuración deprecated)
  - `apps/admin/next.config.ts:9-18` (configuración deprecated)
  - `.github/workflows/testing.yml:149-153` (sin cache de Playwright)
- Issues similares: Ninguno

**Impacto:**
- Frontend: Sí (configuración Next.js)
- Backend: No
- Infraestructura: Sí (optimización CI/CD)

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla por DEFAULT
- **Justificación**: Issue simple de configuración que no requiere trabajo paralelo

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-50-nextjs-turbopack-cicd-optimization`

### Sub-Issues Necesarios
No aplica - Issue simple que se resuelve en una sola rama secuencial

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar estado actual**: Confirmar warnings en desarrollo local
- [ ] **Documentar configuración actual**: Tomar snapshot de archivos afectados

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual (v0.3.6)
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-50-nextjs-turbopack-cicd-optimization`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente (0.3.6 → 0.3.7)

### Implementación Core

#### Fase 1: Fix Next.js Configuration

- [ ] **Migrar configuración en apps/client/next.config.ts**:
  - [ ] Cambiar `experimental.turbo` → `turbopack` en líneas 24-33
  - [ ] Mantener configuración webpack existente para canvas fallbacks
  - [ ] Validar compatibilidad con static export strategy

- [ ] **Migrar configuración en apps/admin/next.config.ts**:
  - [ ] Cambiar `experimental.turbo` → `turbopack` en líneas 9-18
  - [ ] Mantener consistencia con configuración de client

- [ ] **Verificar funcionamiento local**:
  - [ ] `npm run dev` - verificar que no hay warnings deprecation
  - [ ] `npm run build` - confirmar que static export funciona
  - [ ] `npm run export` - validar output estático

#### Fase 2: Implement Intelligent Caching

- [ ] **Optimizar .github/workflows/testing.yml**:
  - [ ] Agregar cache de Playwright browsers en línea 152-153:
    ```yaml
    - name: Cache Playwright browsers
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
        restore-keys: playwright-${{ runner.os }}-
    ```
  - [ ] Modificar step "Install Playwright browsers" para usar cache:
    ```yaml
    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium
    ```
  - [ ] Ya existe cache de node_modules en línea 60 - verificar efectividad

- [ ] **Validar optimización de dependencies**:
  - [ ] Revisar si npm ci puede optimizarse con existing cache
  - [ ] Considerar cache específico para E2E vs unit tests

### Integración y Finalización

- [ ] **Testing local comprehensive**:
  - [ ] `npm run dev` - sin warnings en ambas apps
  - [ ] `npm run build` - builds exitosos
  - [ ] `npm run test:unit` - tests unitarios pasan
  - [ ] Verificar que static export strategy funciona correctamente

- [ ] **Testing de workflow CI/CD**:
  - [ ] Push a rama feature para trigger testing workflow
  - [ ] Monitorear tiempo de ejecución vs baseline anterior
  - [ ] Confirmar que cache hits funcionan en subsequent runs

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Lint**: `npm run lint` (definido en package.json:14)
- [ ] **Type Check**: `npm run type-check` (definido en package.json:15) 
- [ ] **Tests unitarios**: `npm run test:unit` (definido en package.json:17)
- [ ] **Build**: `npm run build` (definido en package.json:12)
- [ ] **Export**: `npm run export` (definido en package.json:13)
- [ ] **E2E Tests**: `npm run test:e2e` (con optimización aplicada)
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Validación Final de Performance

- [ ] **Medir tiempo baseline**: Capturar tiempo actual de E2E workflow
- [ ] **Comparar post-optimización**: Confirmar reducción de 2+ minutos
- [ ] **Verificar cache effectiveness**: 
  - [ ] Primera run: cache miss, instalación completa
  - [ ] Segunda run: cache hit, skip instalación
- [ ] **Validar costo**: Confirmar que caching no incrementa costo de runner

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente (0.3.6 → 0.3.7)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa local + CI
- [ ] **Commit final**: Solo después de que todas las validaciones pasan
- [ ] **PR creation**: Crear PR con evidencia de mejora de performance

## Criterios de Aceptación
- [ ] **Funcional**: No deprecation warnings en development console
- [ ] **Performance**: E2E workflows completan 2+ minutos más rápido
- [ ] **Compatibilidad**: Todas las funcionalidades existentes preservadas
- [ ] **Static Export**: Build process estático no afectado
- [ ] **Cache Effectiveness**: Playwright browsers cached entre runs
- [ ] **CI/CD**: Pipeline time reduction documentado

## Riesgos Identificados
1. **Incompatibilidad Turbopack**: Nueva configuración puede causar builds failures - Mitigación: Testing exhaustivo local antes de commit
2. **Cache Corruption**: Cache malformado puede causar failures - Mitigación: Cache keys específicos con fallback restore-keys
3. **Static Export Breaking**: Cambios de Turbopack pueden afectar export - Mitigación: Validar export completo en cada step

## Estimación
- **Complejidad**: 2 - Simple (configuración + caching)
- **Dependencias Bloqueantes**: Ninguna

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #50 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-50.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-50.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/50
- Next.js Turbopack Documentation: https://nextjs.org/docs/app/api-reference/next-config-js/turbopack
- GitHub Actions Cache Documentation: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
- Playwright Installation Guide: https://playwright.dev/docs/ci#caching-browsers