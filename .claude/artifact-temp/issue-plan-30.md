# Plan para Issue #30: Protected Route System

**Fecha de Análisis**: 2025-07-16 20:28
**Estado del Issue**: OPEN
**Labels**: frontend, priority: P1

## Clasificación: SIMPLE

**Criterios de Clasificación Aplicados:**
- **Complejidad de Código**: El middleware ya existe (deshabilitado) - solo requiere activación y ajustes menores
- **Scope de Cambios**: Activar middleware existente, crear directorio de componentes protegidos, actualizar algunas rutas
- **Arquitectura**: Sin cambios arquitectónicos - solo configuración y activación de funcionalidad existente
- **Resultado**: **SIMPLE** porque se trata principalmente de activar funcionalidad ya implementada con ajustes mínimos

## Análisis del Issue

**Descripción del Problema:**
Implementar middleware de autenticación para rutas protegidas con redirección automática. **Modelo temporal**: Root `/` pública, demás rutas privadas por defecto.

**Checklist Detallado**:
- [ ] Crear middleware de autenticación en rutas protegidas
- [ ] Implementar redirección a login si usuario no autenticado
- [ ] Preservar ruta destino para redirección post-login
- [ ] Manejar estados de carga durante verificación
- [ ] Asegurar compatibilidad con Next.js App Router
- [ ] Validar que no bloquea rutas públicas (landing, login)

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 + React 19 + TypeScript
- Infraestructura: AWS Serverless (CloudFormation + S3 + CloudFront)
- Package Manager: npm
- Arquitectura: Monorepo con static export (NO SSR)

**Estado Actual:**
- Trabajo en progreso: No (no se encontraron ramas o PRs relacionados)
- Archivos afectados: 
  - `apps/client/src/middleware.ts.disabled` (ya existe, solo activar)
  - `apps/client/src/components/auth/` (sistema de auth ya implementado)
- Issues similares: No se encontraron

**Impacto:**
- Frontend: Sí (activación de middleware, creación de componentes protegidos)
- Backend: No (usa JWT existente)
- Infraestructura: No (static export no cambia)

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla (DEFAULT)
- **Estrategia recomendada**: Rama sencilla secuencial (es un issue SIMPLE sin trabajo paralelo)
- **Justificación**: Issue directo con pasos secuenciales que no requiere trabajo paralelo de múltiples desarrolladores

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-30-protected-route-middleware`

### Sub-Issues Necesarios
Ninguno - El issue es suficientemente específico y directo para implementar en una sola rama.

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar sistema de autenticación actual**: Confirmar que JWT auth está funcionando correctamente
- [ ] **Analizar middleware deshabilitado**: Revisar `middleware.ts.disabled` para entender implementación actual

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-30-protected-route-middleware`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 0.3.7 → 0.3.8 para desarrollo)

### Implementación Core

- [ ] **Activar middleware de autenticación**: 
  - [ ] Renombrar `middleware.ts.disabled` a `middleware.ts`
  - [ ] Actualizar lógica de verificación JWT usando el sistema auth existente
  - [ ] **Configurar modelo de protección temporal**:
    - [ ] Rutas PÚBLICAS temporalmente: `/` (root), `/login`, `/register`
    - [ ] Rutas PRIVADAS: `/sala1-5`, `/soporte`, `/videos`, `/musica`, `/test`
    - [ ] **Regla por defecto**: Cualquier ruta no especificada → PRIVADA
    - [ ] **Documentar en código**: Comentario TODO para convertir root en privada después

- [ ] **Crear directorio de componentes protegidos**:
  - [ ] Crear `apps/client/src/components/protected/` directory
  - [ ] Implementar HOC (Higher-Order Component) para proteger rutas
  - [ ] Crear componentes wrapper para manejo de estados de carga

- [ ] **Mejorar preservación de ruta destino**:
  - [ ] Actualizar middleware para manejar parámetro `redirect` en URL
  - [ ] Asegurar compatibilidad con Next.js App Router
  - [ ] Implementar redirección post-login con query parameters

- [ ] **Validar rutas públicas temporales**:
  - [ ] Confirmar que `/` (root), `/login`, `/register` no son bloqueadas
  - [ ] Verificar que rutas futuras (`/sala1-5`) serán protegidas cuando existan
  - [ ] Documentar configuración para transición futura de root a privada

### Integración y Finalización

- [ ] **Testing de integración**: Ejecutar suite de pruebas del proyecto
- [ ] **Validación end-to-end**: Confirmar flujo completo login → ruta protegida → logout
- [ ] **PR final**: Hacer PR de rama principal → main
- [ ] **Cerrar issue principal**: Una vez mergeado el PR final

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Lint**: `npm run lint` 
- [ ] **Type Check**: `npm run type-check`
- [ ] **Tests unitarios**: `npm run test:unit`
- [ ] **Build**: `npm run build` 
- [ ] **E2E Tests**: `npm run test:e2e` (validar flujo de autenticación)
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (ej: 0.3.7 → 0.3.8 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

## Criterios de Aceptación
- [ ] Middleware de autenticación activo en rutas protegidas
- [ ] **Modelo de protección temporal implementado**:
  - [ ] Root `/` temporalmente pública (documentado para cambio futuro)
  - [ ] `/login`, `/register` permanecen públicas
  - [ ] Rutas no especificadas son privadas por defecto
- [ ] Redirección automática a login si usuario no autenticado (en rutas privadas)
- [ ] Preservación correcta de ruta destino para redirección post-login
- [ ] Manejo de estados de carga durante verificación
- [ ] Compatibilidad completa con Next.js App Router
- [ ] Tests E2E pasan con flujo de autenticación completo

## Riesgos Identificados
1. **Middleware con static export**: Verificar que el middleware funciona correctamente con Next.js static export - Mitigación: Probar exhaustivamente el build y export
2. **Compatibilidad JWT existente**: Asegurar que el middleware usa correctamente el sistema JWT actual - Mitigación: Revisar implementación en AuthProvider.tsx
3. **Performance con verificación JWT**: El middleware puede impactar performance en cada ruta - Mitigación: Implementar verificación eficiente y cachear cuando sea posible

## Estimación
- **Complejidad**: 2/5 - Simple
- **Dependencias Bloqueantes**: Ninguna (JWT Token Management ya completado)

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #30 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-30.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-30.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/30
- RouteGuard Implementado: apps/client/src/components/layout/RouteGuard.tsx
- Sistema Auth: apps/client/src/components/auth/
- Documentación Consultada: doc/10-github-workflow.md, CLAUDE.md