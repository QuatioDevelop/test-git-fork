# Plan para Issue #31: Global State Management Implementation

**Fecha de Análisis**: 2025-07-16 14:30
**Estado del Issue**: OPEN
**Labels**: frontend, critical, priority: P1

## Clasificación: COMPLEJO

**Criterios de Clasificación Aplicados:**
- **Nuevas features/funcionalidades**: Context API implementación desde cero
- **Cambios de arquitectura**: Estado global que afecta múltiples componentes
- **Cambios que afectan múltiples componentes**: Usuario, salas, progreso, autenticación
- **Performance optimization**: Sincronización con localStorage y persistencia
- **Resultado**: COMPLEJO porque requiere implementar un sistema de estado global completo que coordina múltiples contextos, afecta la arquitectura de la aplicación, e incluye optimizaciones de performance y persistencia

## Análisis del Issue

**Descripción del Problema:**
Implementar gestión de estado global con Context API para usuario, salas y progreso.

**Checklist Detallado**:
- [ ] Crear Context API para estado global de usuario
- [ ] Implementar estado de salas (abierto/cerrado/visitado)
- [ ] Configurar sincronización con localStorage
- [ ] Mantener estado persistente durante navegación
- [ ] Manejar estado de autenticación
- [ ] Implementar estado de progreso de usuario
- [ ] Configurar providers correctamente anidados

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 + React 19 + TypeScript
- Infraestructura: AWS Serverless (SAM + Lambda + API Gateway + DynamoDB)
- Package Manager: npm
- Arquitectura: Monorepo Turborepo con static export

**Backend APIs Disponibles (Probado ✅):**
- `POST /auth` - Login/Register unificado con JWT
- `GET /rooms/status` - Estado de 5 salas (sala1-sala5)
- `GET /user/progress` - Array simple de salas completadas
- `PUT /user/progress/{salaId}` - Marcar sala completada
- `DELETE /user/delete` - Eliminar usuario

**Estructura de Datos Backend:**
```json
{
  "user": {
    "email": "test@example.com",
    "name": "Test", "lastname": "User",
    "country": "Colombia", "negocio": "SURA",
    "progress": ["sala1", "sala3"] // Array simple
  },
  "rooms": {
    "sala1": {"status": "available", "title": "Bienvenida", "openAt": "2025-08-18T10:00:00Z"},
    "sala2": {"status": "available", "title": "Conferencia Principal", "openAt": "2025-08-18T11:00:00Z"}
    // ... hasta sala5
  }
}
```

**Issue Backend Identificado:**
- ⚠️ **Duplicados en progreso**: `PUT /user/progress/{salaId}` permite duplicados (sala1, sala1)
- ✅ **Timestamps**: Disponibles en activity logs separados

**Estado Actual:**
- Trabajo en progreso: No se detectaron branches relacionados
- Archivos afectados: apps/client/src/context/ (no existe), apps/client/src/hooks/ (existe vacío)
- Issues similares: Ninguno detectado
- Context existente: AuthProvider ya implementado como base

**Impacto:**
- Frontend: Sí (arquitectura de estado global)
- Backend: Opcional (fix duplicados en user-progress.js)
- Infraestructura: No

## Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| Context API Nativo | 3/5 | 5/5 | 4/5 | 5/5 | 2/5 | 19/25 |
| Redux Toolkit | 4/5 | 4/5 | 5/5 | 3/5 | 3/5 | 19/25 |
| Zustand | 2/5 | 4/5 | 5/5 | 4/5 | 2/5 | 17/25 |
| TanStack Query + Context | 4/5 | 3/5 | 5/5 | 4/5 | 3/5 | 19/25 |

**Approach Seleccionado:** Context API Nativo (Score: 19/25)

**Justificación:**
Context API nativo es la mejor opción porque:
1. **Compatibilidad**: Se integra perfectamente con el AuthProvider existente
2. **Simplicidad**: No requiere dependencias adicionales, alineado con la filosofía Next.js del proyecto
3. **Performance**: Con React 19 y useMemo/useCallback optimization es suficientemente eficiente
4. **Mantenibilidad**: Código más transparente y fácil de debuggear
5. **Fit Arquitectura**: Alineado con la decisión de usar static export y minimizar bundle size
6. **Riesgo bajo**: Tecnología nativa de React, sin vendor lock-in

**Tecnologías/Paquetes Recomendados:**
- React Context API: nativo - gestión de estado global
- localStorage: nativo - persistencia de estado
- React hooks: nativo - optimización con useMemo/useCallback
- Backend APIs existentes: `/auth`, `/rooms/status`, `/user/progress`

**Consideraciones Especiales:**
- **Performance**: Uso de múltiples contextos especializados para evitar re-renders innecesarios
- **Persistencia**: Sincronización automática con localStorage para estado crítico
- **Backend Integration**: APIs ya probados y funcionando en dev environment
- **Progress Structure**: Array simple `["sala1", "sala3"]` - timestamps via activity logs
- **Deduplication**: Frontend debe verificar duplicados antes de llamar backend
- **Bundle Size**: Approach nativo mantiene el bundle size controlado para static export
- **Dependencias**: Cero dependencias adicionales, usando solo React APIs nativas

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla secuencial por ser desarrollo de un developer
- **Justificación**: Aunque es un issue complejo, no requiere desarrollo paralelo ya que los contextos son interdependientes y deben implementarse secuencialmente

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-31-global-state-context-api`

### Sub-Issues Necesarios
No aplica - se usará rama sencilla secuencial

## Checklist de Implementación

### Preparación y Setup

- [ ] Verificar dependencias existentes en package.json de client app
- [ ] Analizar AuthProvider existente como base arquitectónica
- [ ] Crear estructura de carpetas para contextos globales

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-31-global-state-context-api`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 0.3.8 → 0.3.9 para desarrollo)

### Implementación Core

**Trabajo Incremental para Issue COMPLEJO:**

- [ ] **Fase 1: Estructura base de contextos**
  - [ ] Crear `apps/client/src/context/GlobalStateProvider.tsx` como contexto principal
  - [ ] Crear `apps/client/src/context/UserContext.tsx` para estado de usuario
  - [ ] Crear `apps/client/src/context/RoomsContext.tsx` para estado de salas
  - [ ] Crear `apps/client/src/context/ProgressContext.tsx` para progreso de usuario
  - [ ] Definir tipos TypeScript basados en APIs backend probados
  - [ ] **Commit incremental**: Validar que la estructura base funciona antes de continuar

- [ ] **Fase 2: Implementación de UserContext**
  - [ ] Implementar tipos TypeScript para estado de usuario (email, name, lastname, country, negocio)
  - [ ] Implementar provider con estado inicial
  - [ ] Agregar funciones para actualizar estado de usuario
  - [ ] Integrar con AuthProvider existente (mantener compatibilidad)
  - [ ] **Commit incremental**: Validar que UserContext funciona independientemente

- [ ] **Fase 3: Implementación de RoomsContext**
  - [ ] Definir tipos para estado de salas basado en `GET /rooms/status`
  - [ ] Implementar provider que consume `GET /rooms/status` API
  - [ ] Agregar estado local: available/visiting/completed por sala
  - [ ] **Commit incremental**: Validar que RoomsContext funciona independientemente

### Integración y Funcionalidades Avanzadas

- [ ] **Fase 4: Implementación de ProgressContext**
  - [ ] Definir tipos para progreso basado en `GET /user/progress` (array simple)
  - [ ] Implementar provider que consume `GET /user/progress` API
  - [ ] Agregar función `markRoomCompleted(salaId)` que llama `PUT /user/progress/{salaId}`
  - [ ] Implementar deduplicación frontend (verificar si ya está en array antes de PUT)
  - [ ] Agregar cálculo de progreso total (completedRooms.length / totalRooms)
  - [ ] **Commit incremental**: Validar que ProgressContext funciona independientemente

- [ ] **Fase 5: Integración Backend + Deduplicación**
  - [ ] Implementar servicios API para consumir endpoints backend
  - [ ] Agregar error handling para APIs (network, auth, server errors)
  - [ ] Implementar retry logic para requests críticos
  - [ ] Validar token JWT y refresh automático si es necesario
  - [ ] **Commit incremental**: Validar que la integración backend funciona correctamente

- [ ] **Fase 6: Sincronización con localStorage**
  - [ ] Implementar hooks para persistencia automática de estado crítico
  - [ ] Configurar hydration desde localStorage al inicializar
  - [ ] Sincronizar con backend al reconectar (merge local + remote state)
  - [ ] Manejar edge cases (localStorage no disponible, datos corruptos)
  - [ ] **Commit incremental**: Validar que la persistencia funciona correctamente

- [ ] **Fase 7: Composición de Providers**
  - [ ] Crear GlobalStateProvider que anide todos los contextos
  - [ ] Optimizar order de providers para evitar dependency issues
  - [ ] Actualizar `apps/client/src/app/layout.tsx` para incluir GlobalStateProvider
  - [ ] **Validación intermedia**: Ejecutar pruebas básicas y hacer commit si funciona

### Hooks y Utilidades

- [ ] **Fase 8: Crear hooks de conveniencia**
  - [ ] Crear `apps/client/src/hooks/useGlobalState.ts` como hook principal
  - [ ] Crear hooks específicos: `useUser`, `useRooms`, `useProgress`
  - [ ] Implementar selectors para optimizar re-renders
  - [ ] Agregar hooks para APIs: `useMarkRoomCompleted`, `useRoomsStatus`
  - [ ] **Commit incremental**: Validar que los hooks funcionan correctamente

- [ ] **Fase 9: Optimización de Performance**
  - [ ] Implementar memoización con useMemo y useCallback
  - [ ] Configurar context splitting para minimizar re-renders
  - [ ] Optimizar API calls (cache, throttling para localStorage sync)
  - [ ] Agregar debug utilities para development
  - [ ] **Commit de integración**: Solo si todas las optimizaciones funcionan

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Detectar comandos de prueba**: Revisar CLAUDE.md, package.json para comandos
- [ ] **Lint**: `npm run lint` 
- [ ] **Type Check**: `npm run type-check`
- [ ] **Tests unitarios**: `npm run test` para client app
- [ ] **Build**: `npm run build` para validar static export
- [ ] **Tests específicos del contexto**: Crear y ejecutar tests para los nuevos contextos
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Integración Final

- [ ] **Testing de integración**: Verificar funcionamiento completo del estado global
- [ ] **Validación end-to-end**: Confirmar persistencia durante navegación
- [ ] **Performance testing**: Verificar que no hay re-renders excesivos
- [ ] **Commit de integración**: Solo si todas las validaciones pasan
- [ ] **PR final**: Hacer PR de rama principal → main
- [ ] **Cerrar issue principal**: Una vez mergeado el PR final

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (ej: 0.3.8 → 0.4.0 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

**Filosofía de Trabajo Incremental para Issue COMPLEJO:**
- Cada fase debe incluir validación intermedia
- Hacer commit solo cuando la funcionalidad parcial esté funcionando
- No avanzar al siguiente paso si hay pruebas fallidas
- Priorizar commits pequeños y funcionales vs commits grandes

## Criterios de Aceptación
- [ ] Context API para estado global de usuario implementado
- [ ] Estado de salas consumiendo `GET /rooms/status` funcional
- [ ] Estado de progreso consumiendo `GET /user/progress` funcional
- [ ] Función `markRoomCompleted()` llamando `PUT /user/progress/{salaId}` con deduplicación
- [ ] Sincronización con localStorage operativa
- [ ] Estado persistente durante navegación validado
- [ ] Manejo de estado de autenticación integrado con AuthProvider existente
- [ ] Providers correctamente anidados sin conflictos
- [ ] Error handling para fallos de backend implementado
- [ ] Tests pasan correctamente
- [ ] No hay degradación de performance
- [ ] Hook useGlobalState.ts funcional según especificación
- [ ] Progreso calculado correctamente: completedRooms.length / 5 total rooms

## Riesgos Identificados
1. **Re-renders excesivos**: Context API puede causar renders innecesarios - Mitigación: Context splitting y memoización
2. **Conflictos con AuthProvider**: Integración con sistema existente - Mitigación: Análisis cuidadoso de AuthProvider antes de implementar
3. **Backend API failures**: Network errors, auth expiry - Mitigación: Error handling, retry logic, graceful degradation
4. **Progress duplicados**: Backend permite duplicados en array - Mitigación: Deduplicación en frontend antes de API calls
5. **localStorage edge cases**: Datos corruptos o no disponible - Mitigación: Fallbacks y validación de datos
6. **State sync conflicts**: Local vs remote state inconsistency - Mitigación: Merge strategy y source of truth definido

## Estimación
- **Complejidad**: 4/5 - Alta (sistema de estado global completo)
- **Dependencias Bloqueantes**: Authentication System completado (✅ ya está)

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #31 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-31.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-31.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/31
- AuthProvider existente: apps/client/src/components/auth/AuthProvider.tsx
- Backend APIs probados: https://api.dev.esenciafest.com (✅ functional)
- Arquitectura de datos: doc/05-arquitectura-datos.md
- Backend source: iac/backend/src/ (auth.js, rooms.js, user-progress.js)
- Documentación React Context: https://react.dev/reference/react/createContext
- Guía de contribuciones del proyecto: doc/08-guia-contribuciones.md