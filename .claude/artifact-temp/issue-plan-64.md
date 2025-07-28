# Plan para Issue #64: Implementar protección API con Cognito para usuarios admin

**Fecha de Análisis**: 2025-07-17 16:30
**Estado del Issue**: OPEN
**Labels**: frontend, backend, priority: P2
**Milestone**: Fase 1 - Validación Técnica (due: 2025-08-05)

## Clasificación: COMPLEJO

**Criterios de Clasificación Aplicados:**
- **Multi-componente**: Infraestructura AWS + Backend middleware + Frontend integration + Testing
- **Arquitectura híbrida**: Implementa sistema de autenticación Cognito complementario al JWT existente
- **Integraciones externas**: AWS Cognito User Pool + Identity Pool + IAM roles
- **Seguridad crítica**: Protección de endpoints admin con token validation
- **Cross-cutting concerns**: Afecta infraestructura, backend API, frontend UI y CI/CD pipeline
- **Resultado**: COMPLEJO porque requiere cambios coordenados en múltiples capas del sistema con integración de servicios AWS

## Análisis del Issue

**Descripción del Problema:**
Implementar sistema de autenticación basado en AWS Cognito que complemente el sistema JWT existente, estableciendo protección para endpoints `/admin/*` con al menos un usuario admin (super admin) que pueda crear otros usuarios admin.

**Stack Tecnológico Detectado:**
- Framework Principal: Next.js 15 + React 19 + TypeScript (monorepo con Turborepo)
- Infraestructura: AWS SAM + CloudFormation + Lambda + DynamoDB + API Gateway
- Package Manager: npm@10.0.0 (workspaces)
- Arquitectura: Serverless backend + Static frontend (S3/CloudFront) + Admin panel separado
- Backend Runtime: Node.js 18.x con AWS SDK v3

**Estado Actual:**
- Trabajo en progreso: No se detectaron branches o PRs relacionados
- Archivos afectados: 
  - `iac/backend/template.yaml` (infraestructura base)
  - `iac/backend/src/admin-rooms.js` (TODO line 15: Add Cognito authentication)
  - `tests/e2e/admin.spec.ts` (tests base para expandir)
  - `apps/admin/` (frontend admin app en puerto 3001)
- Issues similares: No se encontraron issues similares

**Impacto:**
- Frontend: Sí (Admin panel login + token management)
- Backend: Sí (Middleware de autenticación + endpoint protection)
- Infraestructura: Sí (Cognito User Pool + Identity Pool + IAM roles)

## Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| Cognito + API Gateway Authorizer | 4/5 | 5/5 | 5/5 | 5/5 | 2/5 | 21/25 |
| Custom Lambda Middleware | 3/5 | 4/5 | 4/5 | 5/5 | 3/5 | 19/25 |
| Extend JWT system | 2/5 | 3/5 | 5/5 | 3/5 | 4/5 | 17/25 |

**Approach Seleccionado:** Cognito + Custom Lambda Middleware (Score: 21/25)

**Justificación:**
AWS Cognito proporciona seguridad enterprise-grade con gestión de usuarios robusta, integración nativa con AWS services, y permite escalabilidad futura para roles granulares. Usar middleware personalizado en lugar de API Gateway Authorizer ofrece mayor flexibilidad para logging de auditoría y manejo de errores específicos. Este enfoque mantiene la arquitectura híbrida sin afectar el flujo JWT existente.

**Tecnologías/Paquetes Recomendados:**
- **AWS Cognito User Pool**: Gestión de usuarios admin con políticas de seguridad
- **AWS Cognito Identity Pool**: Credenciales temporales para acceso a AWS resources
- **@aws-sdk/client-cognito-identity-provider**: v3.x - Gestión de usuarios desde Lambda
- **aws-amplify**: v6.x - Cliente frontend para autenticación Cognito
- **jsonwebtoken**: Existente - Para validar Cognito JWT tokens

**Consideraciones Especiales:**
- **Infraestructura**: User Pool con configuración de dominio personalizado, Identity Pool con roles IAM granulares
- **Performance**: Token caching en localStorage, validación optimizada con JWT verify en lugar de llamadas API
- **Security**: MFA opcional, password policies, token rotation automática, audit logging
- **Compatibility**: Cognito tokens compatibles con middleware JWT existente mediante estructura estándar
- **Dependencias**: Mínimo impacto - solo agregar aws-amplify al frontend admin

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla Secuencial
- **Estrategia recomendada**: Una sola rama con desarrollo secuencial (infraestructura → middleware → frontend → testing)
- **Justificación**: Aunque es multi-componente, el desarrollo debe ser secuencial porque el frontend depende de la infraestructura y el middleware. No hay trabajo paralelo eficiente posible.

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-64-cognito-admin-auth`

### Sub-Issues Necesarios
No aplica - desarrollo secuencial en una sola rama según guía de contribuciones.

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar versión actual**: Revisar package.json (actualmente v0.3.10)
- [ ] **Investigar AWS Cognito best practices**: Revisar documentación oficial para User Pools
- [ ] **Analizar endpoints admin existentes**: Confirmar scope de protección en admin-rooms.js

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-64-cognito-admin-auth`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (0.3.10 → 0.3.11)

### Implementación Core

**Trabajo Incremental Secuencial:**

#### 1. Infraestructura Base AWS Cognito
- [ ] **Agregar Cognito User Pool a template.yaml**: Configuración básica con políticas de password
  - [ ] **Commit incremental**: Validar que CloudFormation template es válido antes de continuar
- [ ] **Configurar Identity Pool y roles IAM**: Permisos mínimos para admin access  
  - [ ] **Commit incremental**: Validar roles IAM antes de continuar
- [ ] **Definir outputs para integración**: User Pool ID, Client ID, Identity Pool ID
  - [ ] **Validación intermedia**: Ejecutar `sam validate` y hacer commit si funciona

#### 2. Middleware de Autorización Backend
- [ ] **Crear utils/cognito-auth.js**: Middleware reutilizable para validar tokens Cognito
  - [ ] **Commit incremental**: Validar que funciona con tokens mock antes de continuar
- [ ] **Actualizar admin-rooms.js**: Remover TODO line 15 y aplicar middleware de protección
  - [ ] **Commit incremental**: Validar integración con endpoints existentes
- [ ] **Implementar manejo de errores 401/403**: Mensajes claros y logging de auditoría
  - [ ] **Validación intermedia**: Probar endpoints protegidos y hacer commit si funciona

#### 3. Integración Frontend Admin Panel
- [ ] **Instalar aws-amplify en apps/admin**: Agregar dependencia para Cognito client
  - [ ] **Commit incremental**: Verificar que build pasa sin errores
- [ ] **Configurar Amplify Auth**: Setup con User Pool parameters en apps/admin
  - [ ] **Commit incremental**: Validar configuración básica antes de continuar
- [ ] **Implementar LoginPage component**: UI para autenticación Cognito con redirection
  - [ ] **Commit incremental**: Validar que UI render correctamente
- [ ] **Implementar token management**: localStorage + context para auth state
  - [ ] **Validación intermedia**: Probar flujo completo login → dashboard y hacer commit si funciona

#### 4. Testing de Integración End-to-End
- [ ] **Expandir tests/e2e/admin.spec.ts**: Agregar casos para flujo de autenticación Cognito
  - [ ] **Test case**: Login exitoso con credenciales válidas
  - [ ] **Test case**: Rechazo de acceso sin token
  - [ ] **Test case**: Redirect automático para usuarios no autenticados
  - [ ] **Commit incremental**: Solo si todos los tests nuevos pasan
- [ ] **Validar acceso a endpoints protegidos**: Tests E2E para `/admin/rooms/{roomId}/override`
  - [ ] **Validación end-to-end**: Confirmar funcionamiento completo
  - [ ] **Commit de integración**: Solo si todas las validaciones pasan

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Detectar comandos de prueba**: Confirmar comandos en package.json y CLAUDE.md
- [ ] **Lint**: `npm run lint` - Validar código style
- [ ] **Type Check**: `npm run type-check` - Validar TypeScript  
- [ ] **Tests unitarios**: `npm run test:unit` - Ejecutar pruebas unitarias de apps
- [ ] **Build**: `npm run build` - Validar que builds pasan
- [ ] **Backend validation**: `npm run backend:validate` - Validar SAM template
- [ ] **E2E Tests**: `npm run test:e2e` - Ejecutar suite completa E2E
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Deployment y Configuración

- [ ] **Deploy backend infrastructure**: `npm run backend:deploy:dev` con nuevos recursos Cognito
- [ ] **Verificar outputs de CloudFormation**: Confirmar que User Pool ID y Client ID están disponibles
- [ ] **Configurar variables de entorno**: Actualizar configuración admin app con Cognito parameters
- [ ] **Crear usuario admin inicial**: Script manual o AWS Console para primer super admin
- [ ] **Validar permisos CI/CD**: Confirmar que GitHub Actions puede desplegar recursos Cognito

### Documentación Mínima (SOLO LO NECESARIO)

**Principios de Documentación Concisa:**
- [ ] **Solo lo crítico**: Documentar únicamente setup inicial de super admin (no es obvio)
- [ ] **Actualizar CLAUDE.md**: Agregar comandos de Cognito setup si son necesarios
- [ ] **Ejemplos reales**: Comandos probados para crear usuario admin inicial
- [ ] **No crear archivos nuevos**: Integrar en documentación existente

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (0.3.11 → 0.3.12 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

**Filosofía de Trabajo Incremental:**
- Cada paso de implementación debe incluir validación intermedia
- Hacer commit solo cuando la funcionalidad parcial esté funcionando
- No avanzar al siguiente paso si hay pruebas fallidas
- Priorizar commits pequeños y funcionales vs commits grandes

*Pasos específicos contextuales del issue:*
- "Completar configuración Cognito User Pool en SAM template"
- "Implementar middleware de validación JWT Cognito en admin-rooms.js"
- "Configurar Amplify Auth en admin panel con redirection UX"
- "Validar flujo end-to-end: login → token → protected endpoint access"

## Criterios de Aceptación
- [ ] **Funcionalidad Core**: Admin puede hacer login con Cognito y acceder a endpoints protegidos
- [ ] **Seguridad**: Endpoints `/admin/*` rechazan requests sin token Cognito válido (401/403)
- [ ] **Frontend**: Admin panel redirige a login si no está autenticado
- [ ] **Testing**: Tests E2E pasan incluyendo flujos de autenticación Cognito
- [ ] **Deployment**: CI/CD funciona correctamente con nuevos recursos Cognito
- [ ] **No breaking changes**: Sistema JWT existente para usuarios regulares permanece intacto
- [ ] **Audit logging**: Accesos admin son registrados para auditoría básica

## Riesgos Identificados
1. **IAM Permissions**: Configuración incorrecta de roles puede bloquear acceso - Mitigación: Usar policies restrictivas y testing incremental
2. **Token Validation**: Latencia en validación Cognito puede afectar UX - Mitigación: Implementar caching de tokens válidos
3. **Environment Variables**: Configuración incorrecta entre dev/staging/prod - Mitigación: Usar CloudFormation outputs y validation scripts
4. **CI/CD Permissions**: GitHub Actions puede requerir permisos adicionales para Cognito - Mitigación: Verificar permisos IAM antes de merge

## Estimación
- **Complejidad**: 4/5 - Alta (multi-layer integration con AWS services)
- **Dependencias Bloqueantes**: Ninguna - todos los recursos AWS están disponibles

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #64 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-64.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-64.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/64
- Documentación Consultada: 
  - AWS Cognito User Pools Developer Guide
  - AWS SAM CloudFormation Reference
  - doc/08-guia-contribuciones.md (branching strategy)
- Paquetes/Servicios Investigados: 
  - aws-amplify v6.x (Cognito frontend integration)
  - @aws-sdk/client-cognito-identity-provider v3.x (backend user management)