# Plan para Issue #76: Refactor CI/CD: Add build job to testing workflow

**Fecha de Análisis**: 2025-07-18 19:27
**Estado del Issue**: OPEN
**Labels**: enhancement, priority: P2

## Clasificación: SIMPLE

**Criterios de Clasificación Aplicados:**
- **Tipo de cambio**: Refactorización de workflow existente, no nueva funcionalidad
- **Complejidad técnica**: Modificación de un solo archivo YAML con steps conocidos
- **Scope**: Cambios aislados en `.github/workflows/testing.yml`
- **Riesgo**: Bajo - cambio de optimización de workflow, no afecta funcionalidad core
- **Resultado**: SIMPLE porque es una reorganización de steps existentes en un workflow

## Análisis del Issue

**Descripción del Problema:**
Refactorizar el workflow de testing para incluir un job de **build** separado que:
1. Reporte el status check 'build' en PRs
2. Genere artifacts reutilizables para E2E tests
3. Permita configurar branch protection con checks completos

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 + React 19 + TypeScript (monorepo con Turborepo)
- Infraestructura: GitHub Actions CI/CD
- Package Manager: npm
- Arquitectura: Multi-app estructura (client, admin, shared)

**Estado Actual:**
- Trabajo en progreso: No
- Archivos afectados: `.github/workflows/testing.yml`
- Issues similares: Ninguno encontrado

**Impacto:**
- Frontend: No (solo CI/CD)
- Backend: No (solo CI/CD)
- Infraestructura: Sí (GitHub Actions workflow)

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla por DEFAULT
- **Justificación**: Es un cambio de un solo archivo con scope bien definido, no requiere trabajo paralelo

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-76-build-job-testing-workflow`

### Sub-Issues Necesarios
No aplica - scope suficientemente pequeño para una sola rama.

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar comprensión del problema**: Revisar estructura actual del workflow de testing
- [ ] **Analizar dependencies entre jobs**: Entender cómo E2E tests usa el build actual

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-76-build-job-testing-workflow`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 0.3.11 → 0.3.12 para desarrollo)

### Implementación Core

- [ ] **Analizar estructura actual del workflow**: Identificar dónde se hace el build en el job `e2e-tests`
- [ ] **Crear nuevo job `build`**: 
  - [ ] Definir job con `runs-on: ubuntu-latest`
  - [ ] Checkout code con `actions/checkout@v4`
  - [ ] Setup Node.js con misma versión que otros jobs
  - [ ] Install dependencies con `npm ci`
  - [ ] Run build con `npm run build`
  - [ ] Upload artifacts con `actions/upload-artifact@v4`
- [ ] **Modificar job `e2e-tests`**:
  - [ ] Agregar `needs: [build]` para dependency
  - [ ] Download artifacts con `actions/download-artifact@v4`
  - [ ] Remover step "Build applications for E2E testing"
- [ ] **Actualizar job `test-summary`**:
  - [ ] Agregar `build` a la lista de `needs: [unit-tests, smoke-tests, build, e2e-tests]`
  - [ ] Agregar reporte de status del job build en el summary

### Integración y Finalización

- [ ] **Testing del workflow modificado**: 
  - [ ] Hacer commit inicial con cambios
  - [ ] Trigger workflow manual: `gh workflow run "🧪 Testing Pipeline" --ref feature/issue-76-build-job-testing-workflow`
  - [ ] Revisar ejecución en GitHub Actions UI
- [ ] **Validación de artifacts**: Verificar que se generan y descargan correctamente en la run manual
- [ ] **Validación de status checks**: Confirmar que el job 'build' ejecuta independientemente 
- [ ] **Iteración si necesario**: Ajustar configuración y re-ejecutar workflow manual
- [ ] **Commit final**: Solo después de que workflow manual pasa completamente

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Build local**: `npm run build` - verificar que funciona localmente
- [ ] **Lint**: `npm run lint` - verificar que el YAML está bien formateado
- [ ] **Type Check**: `npm run type-check` - verificar tipos del proyecto
- [ ] **Tests workflow**: Push a rama feature para probar el workflow completo
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con workflow fallido

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (ej: 0.3.11 → 0.3.12 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

## Criterios de Aceptación
- [ ] Job `build` separado existe en testing workflow
- [ ] Status check 'build' se reporta en PRs
- [ ] E2E tests usa artifacts del build (no hace build propio)
- [ ] Job `test-summary` incluye resultado de `build`
- [ ] Tiempo total de CI no aumenta significativamente
- [ ] Branch protection se puede configurar con 'build' check
- [ ] Workflow funciona en todas las ramas (main, staging, production, feature/*)

## Riesgos Identificados
1. **Artifacts demasiado grandes**: Build artifacts podrían ser grandes para transferir - Mitigación: usar artifacts compression y retention adecuada
2. **Timing de dependencies**: Dependency entre build y e2e-tests podría generar waiting time - Mitigación: optimizar paralelización donde sea posible
3. **Branch protection conflicts**: Cambio podría romper reglas existentes - Mitigación: coordinar con configuración de branch protection

## Estimación
- **Complejidad**: 2/5 - Simple refactorización de workflow
- **Dependencias Bloqueantes**: Ninguna

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #76 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-76.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-76.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/76
- Documentación Consultada: 
  - `doc/10-github-workflow.md` - GitHub workflow patterns
  - `.github/workflows/testing.yml` - Current testing workflow
  - `package.json` - Project scripts and structure
- Patterns de GitHub Actions: Upload/Download artifacts, job dependencies