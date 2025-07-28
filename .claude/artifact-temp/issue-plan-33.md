# Plan para Issue #33: Room Navigation & Routing System

**Fecha de Análisis**: 2025-07-16 16:15
**Estado del Issue**: OPEN
**Labels**: frontend, critical, priority: P1

## Clasificación: COMPLEJO

**Criterios de Clasificación Aplicados:**
- Requiere creación de múltiples rutas dinámicas en Next.js 15
- Navegación bidireccional con integración de canvas
- Validación de estados con Context API existente
- Sistema de breadcrumbs y URLs compartibles
- Integración con múltiples componentes existentes
- **Resultado**: COMPLEJO porque involucra routing dinámico, integración de estado global, navegación bidireccional y múltiples componentes nuevos

## Análisis del Issue

**Descripción del Problema:**
Implementar sistema de navegación y routing dinámico para salas con validación de estados.

**Checklist del Issue:**
- Crear rutas dinámicas para cada sala individual
- Implementar navegación bidireccional: ciudadela ↔ salas
- Validar estado de sala antes de acceso
- Configurar redirección a ciudadela si sala cerrada
- Mantener estado durante navegación
- Implementar URLs amigables y compartibles
- Agregar breadcrumb/navegación visual clara

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 (Static Export) + TypeScript + React 19
- Infraestructura: AWS SAM + Lambda + DynamoDB
- Package Manager: npm@10.0.0
- Arquitectura: Monorepo con Turborepo, Static Export (NO SSR)

**Estado Actual:**
- Trabajo en progreso: No
- Archivos afectados: apps/client/src/app/salas/ (NO existe), apps/client/src/components/navigation/ (NO existe)
- Issues similares: Canvas Interactivity & Room States (dependencia completada)

**Impacto:**
- Frontend: Sí (rutas dinámicas, navegación, breadcrumbs)
- Backend: No (usa APIs existentes)
- Infraestructura: No

## Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| Next.js 15 Dynamic Routes + Context API | 4/5 | 5/5 | 5/5 | 5/5 | 2/5 | 21/25 |
| React Router + Manual State | 3/5 | 3/5 | 3/5 | 2/5 | 4/5 | 15/25 |
| Next.js App Router + Server Components | 5/5 | 4/5 | 4/5 | 3/5 | 3/5 | 19/25 |
| Client-side Routing + Zustand | 3/5 | 4/5 | 4/5 | 3/5 | 3/5 | 17/25 |

**Approach Seleccionado:** Next.js 15 Dynamic Routes + Context API (Score: 21/25)

**Justificación:**
Este enfoque aprovecha al máximo la arquitectura existente de Next.js 15 con Static Export y se integra perfectamente con el Context API ya implementado para gestión de estado global. La navegación dinámica con `[id]` routes es nativa de Next.js 15 y permite URLs compartibles. La validación de estados se puede hacer con el RoomsContext existente, manteniendo consistencia arquitectónica.

**Tecnologías/Paquetes Recomendados:**
- Next.js 15 Dynamic Routes: [id] folders - routing dinámico nativo
- usePathname & useRouter: next/navigation - navegación programática
- React Context API: Estado global existente - validación de sala
- TypeScript: Tipos para rutas y navegación - type safety

**Consideraciones Especiales:**
- **Arquitectura**: Usar [id] dynamic routes en app/salas/[id]/page.tsx para URLs limpias
- **Performance**: Prefetch automático de Next.js para navegación instantánea
- **Static Export**: Asegurar que generateStaticParams cubra todas las salas
- **Compatibility**: Usar usePathname (app router) compatible con Static Export
- **Dependencias**: Integrar con RoomsContext, ProgressContext y canvas ciudadela

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla por DEFAULT
- **Justificación**: Issue asignado a un developer, sin trabajo paralelo explícito mencionado

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-33-room-navigation-routing-system`

### Sub-Issues Necesarios
No se requieren sub-issues - implementación secuencial en una rama

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar dependencias del issue**: Canvas Interactivity & Room States completado
- [ ] **Analizar Context API existente**: RoomsContext, ProgressContext, UserContext
- [ ] **Revisar estructura de salas**: Definir rooms disponibles y sus IDs

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-33-room-navigation-routing-system`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 0.3.9 → 0.4.0 para desarrollo)

### Implementación Core

**Fase 1: Estructura de Rutas Dinámicas**
- [ ] **Crear estructura de carpetas**: apps/client/src/app/salas/[id]/page.tsx
  - [ ] **Commit incremental**: Validar que ruta básica funciona antes de continuar
- [ ] **Implementar generateStaticParams**: Generar rutas estáticas para todas las salas
  - [ ] **Commit incremental**: Validar que build funciona con rutas estáticas
- [ ] **Crear layout para salas**: apps/client/src/app/salas/layout.tsx con navegación común
  - [ ] **Commit incremental**: Validar layout básico antes de continuar

**Fase 2: Componentes de Navegación**
- [ ] **Crear componente Breadcrumb**: apps/client/src/components/navigation/Breadcrumb.tsx
  - [ ] **Usar usePathname**: Para obtener ruta actual
  - [ ] **Integrar con Context API**: Para nombres de salas dinámicos
  - [ ] **Commit incremental**: Validar breadcrumb básico funciona
- [ ] **Crear componente Navigation**: apps/client/src/components/navigation/RoomNavigation.tsx
  - [ ] **Navegación bidireccional**: Ciudadela ↔ Salas
  - [ ] **Botones de navegación**: Anterior/Siguiente sala
  - [ ] **Commit incremental**: Validar navegación básica funciona

**Fase 3: Validación de Estados**
- [ ] **Implementar Room Guard**: Validar estado de sala antes de acceso
  - [ ] **Integrar con RoomsContext**: Verificar si sala está abierta
  - [ ] **Redirección automática**: A ciudadela si sala cerrada
  - [ ] **Commit incremental**: Validar redirects funcionan correctamente
- [ ] **Mantener estado durante navegación**: Persistir progreso de usuario
  - [ ] **Integrar con ProgressContext**: Marcar salas visitadas
  - [ ] **Estado de navegación**: Mantener posición en ciudadela
  - [ ] **Commit incremental**: Validar persistencia de estado funciona

**Fase 4: Integración con Canvas Ciudadela**
- [ ] **Actualizar canvas ciudadela**: Agregar navegación a salas desde canvas
  - [ ] **Links dinámicos**: Desde puntos de sala en canvas a rutas
  - [ ] **Estados visuales**: Indicar sala actual en canvas
  - [ ] **Commit incremental**: Validar integración canvas → salas
- [ ] **Navegación inversa**: Desde salas de vuelta a ciudadela
  - [ ] **Botón "Volver a Ciudadela"**: En todas las salas
  - [ ] **Preservar posición**: En canvas al regresar
  - [ ] **Commit incremental**: Validar navegación salas → ciudadela

### Integración y Finalización

- [ ] **URLs amigables y compartibles**: Configurar rutas limpias
  - [ ] **Formato**: /salas/video, /salas/galeria-360, /salas/chat, etc.
  - [ ] **Validar sharing**: URLs funcionan cuando se comparten
- [ ] **Testing de navegación end-to-end**: Flujos completos de navegación
  - [ ] **Ciudadela → Sala → Ciudadela**: Flujo básico
  - [ ] **Navegación entre salas**: Sin pasar por ciudadela
  - [ ] **Estados cerrados**: Redirects apropiados
- [ ] **Commit de integración**: Solo si todas las validaciones pasan
- [ ] **PR final**: Hacer PR de rama principal → main
- [ ] **Cerrar issue principal**: Una vez mergeado el PR final

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Lint**: `npm run lint` - Validar estilo de código
- [ ] **Type Check**: `npm run type-check` - Validar TypeScript
- [ ] **Build**: `npm run build` - Validar que compila correctamente
- [ ] **Export**: `npm run export` - Validar static export funciona
- [ ] **Tests unitarios**: `npm run test` - Componentes de navegación
- [ ] **E2E Tests**: `npm run test:e2e` - Flujos de navegación completos
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (ej: 0.4.0 → 0.4.1 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

**Filosofía de Trabajo Incremental (Issues COMPLEJOS):**
- Cada fase de implementación debe incluir validación intermedia
- Hacer commit solo cuando la funcionalidad parcial esté funcionando
- No avanzar al siguiente paso si hay pruebas fallidas
- Priorizar commits pequeños y funcionales vs commits grandes

## Criterios de Aceptación
- [ ] Rutas dinámicas para cada sala individual funcionando
- [ ] Navegación bidireccional: ciudadela ↔ salas implementada
- [ ] Validación de estado de sala antes de acceso
- [ ] Redirección a ciudadela si sala cerrada
- [ ] Mantenimiento de estado durante navegación
- [ ] URLs amigables y compartibles (/salas/video, /salas/chat, etc.)
- [ ] Breadcrumb/navegación visual clara
- [ ] Tests pasan correctamente
- [ ] No hay degradación de performance
- [ ] Integración con Context API existente funciona

## Riesgos Identificados
1. **Static Export con Dynamic Routes**: Posible incompatibilidad - Mitigación: usar generateStaticParams correctamente
2. **Integración con Canvas**: Coordinación entre canvas y rutas - Mitigación: testing exhaustivo de navegación bidireccional
3. **Estado Global**: Conflictos con Context API existente - Mitigación: revisar RoomsContext y ProgressContext antes de implementar
4. **Performance**: Rutas dinámicas pueden afectar build time - Mitigación: optimizar generateStaticParams y prefetch

## Estimación
- **Complejidad**: 4/5 - Alta (routing dinámico + navegación bidireccional + integración)
- **Dependencias Bloqueantes**: Canvas Interactivity & Room States (completado)

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #33 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-33.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-33.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/33
- Documentación Consultada: 
  - Next.js 15 Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  - React Context API Breadcrumbs: https://dev.to/dan_starner/building-dynamic-breadcrumbs-in-nextjs-17oa
  - Navigation Best Practices: https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating
- Dependencias: Canvas Interactivity & Room States (completado)
- Context API: RoomsContext, ProgressContext, UserContext (implementados en issue #31)