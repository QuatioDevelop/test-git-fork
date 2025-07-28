# Documentación Esencia Fest 2025

## Orden de Lectura

1. **[01-requerimientos.md](01-requerimientos.md)**
   - Funcionalidades del sistema + admin panel
   - Especificaciones técnicas por sala

2. **[02-drivers-arquitectonicos.md](02-drivers-arquitectonicos.md)**
   - Decisiones técnicas fundamentales
   - Restricciones y criterios de calidad

3. **[03-arquitectura-alto-nivel.md](03-arquitectura-alto-nivel.md)**
   - Vista general del sistema serverless
   - Componentes principales + decisiones clave

4. **[04-api-design.md](04-api-design.md)**
   - Endpoints REST completos
   - Autenticación JWT + Cognito admin

5. **[05-arquitectura-datos.md](05-arquitectura-datos.md)**
   - DynamoDB single table design
   - Access patterns + time series logs

6. **[06-arquitectura-aplicacion-cliente.md](06-arquitectura-aplicacion-cliente.md)**
   - Stack Next.js 15 + TanStack Query v5
   - SPA estático (NO SSR) + integraciones
   - Design system con SuraSans + temas client/admin

7. **[07-plan-implementacion.md](07-plan-implementacion.md)**
   - Fases 0-4 con criterios éxito
   - Timeline + client coordination

8. **[08-cicd-pipeline.md](08-cicd-pipeline.md)**
   - GitHub Actions automation
   - Frontend + Backend deployment

9. **[09-testing-strategy.md](09-testing-strategy.md)**
   - Testing framework completo (Vitest + Playwright)
   - Guía de desarrollo con ejemplos Frontend/Backend

10. **[10-github-workflow.md](10-github-workflow.md)**
    - Comandos GitHub CLI validados
    - Workflow completo issues → branch → PR → merge

## Stack Tecnológico 2025

**Detalle completo en [06-arquitectura-aplicacion-cliente.md](06-arquitectura-aplicacion-cliente.md)**

- Next.js 15 Static Export + React 19
- TanStack Query v5 + shadcn/ui + react-konva
- Design system centralizado con SuraSans + tokens
- AWS SAM + DynamoDB + S3 + CloudFront

---
*Documentación técnica Esencia Fest 2025 - SURA*