---
description: Crear borrador inicial de plan maestro para cualquier funcionalidad o fase con análisis del repositorio
allowed-tools: [Read, Task, Glob, Write, Bash]
---

# Master Plan Draft Generator

Crear borrador de plan maestro para: **$ARGUMENTS**

## Proceso:

### 1. Análisis del Estado Actual del Repositorio
Primero analizar qué está sucediendo AHORA en el repositorio:
- **Trabajo en progreso**: Issues actualmente "In Progress" de cualquier colaborador
- **Pull Requests abiertos**: PRs que podrían afectar la funcionalidad
- **Milestones activos**: Evaluar si hay uno apropiado o necesidad de crear nuevo
- **Dependencias bloqueantes**: Issues o trabajo que debe completarse primero
- **Búsqueda inteligente**: Identificar issues relacionados usando palabras clave de la funcionalidad solicitada

**Ejecutar estos comandos en paralelo usando múltiples llamadas Bash:**
```bash
# Issues en progreso
gh issue list --state open --label "in-progress" --limit 10

# Pull requests abiertos
gh pr list --state open --limit 10

# Todos los issues abiertos
gh issue list --state open --limit 20

# Milestones existentes (usar API ya que gh milestone no existe)
gh api repos/:owner/:repo/milestones

# Buscar issues relacionados usando palabras clave de la funcionalidad
gh issue list --state open --search "[extraer keywords de argumentos]" --limit 10
```

### 2. Análisis del Contexto del Proyecto
Analizar la documentación y código existente para entender:
- Arquitectura actual del proyecto (revisar `/doc/` y `CLAUDE.md`)
- Stack tecnológico en uso
- Convenciones y patrones establecidos
- Estado actual de implementación

### 3. Entendimiento de la Funcionalidad Solicitada
Basado en el análisis del repositorio y proyecto:
- Identificar el alcance real de la funcionalidad/fase
- Determinar componentes afectados
- Considerar impacto en arquitectura existente
- Verificar si hay trabajo previo o issues relacionados

### 4. Análisis Crítico y Lluvia de Ideas
**FASE CRÍTICA**: Revisar la planificación existente en la documentación y generar ideas adicionales:
- **Gap Analysis**: ¿Qué elementos críticos podrían estar faltando en la documentación?
- **Brainstorming**: ¿Qué tareas adicionales se necesitarían realmente para esta fase?
- **Riesgos técnicos**: ¿Qué validaciones o POCs adicionales deberían incluirse?
- **Dependencias ocultas**: ¿Qué integraciones o configuraciones no están consideradas?
- **Testing scenarios**: ¿Qué casos edge o escenarios de prueba son críticos?
- **Cliente requirements**: ¿Qué validaciones del cliente podrían ser necesarias?

**Objetivo**: Expandir el plan inicial para ser más comprehensivo, luego se puede recortar si es necesario.

### 5. Evaluación de Milestone
Determinar estrategia de milestone:
- **Si existe milestone apropiado**: Evaluar si las fechas y scope son compatibles
- **Si no existe milestone apropiado**: Sugerir crear uno nuevo con fecha específica
- **Considerar timing**: Basado en trabajo actualmente en progreso y dependencias

### 6. Generación del Plan Borrador
Crear tabla de tareas principales (5-10 items) priorizadas:
- **Incluir tareas originales** de la documentación existente
- **Agregar tareas identificadas** en el análisis crítico y lluvia de ideas
- Descripciones high-level enfocadas en QUÉ hacer, no CÓMO
- Sin estimaciones de tiempo o complejidad técnica
- Consideraciones de coordinación con trabajo actual en progreso
- **Marcar claramente** qué tareas son "adicionales/opcionales" vs "core"

### 7. Validación de Lotes Trabajables
**CRÍTICO**: Antes de finalizar el plan, validar agrupación coherente:

**Preguntas de Validación:**
- ¿Cuáles de estas tareas tiene sentido hacerlas juntas en el mismo PR?
- ¿Hay tareas que están relacionadas funcionalmente pero separadas artificialmente?
- ¿Cada tarea propuesta justifica un PR independiente con valor claro?
- ¿Existen tareas que son muy pequeñas y deberían agruparse?

**Criterios de Lotes Trabajables:**
- **Funcionalidad coherente**: Tareas de la misma funcionalidad deben agruparse
- **Valor de PR**: Cada lote debe generar un PR con valor tangible
- **Evitar micro-PRs**: No crear PRs para cambios triviales como "cambiar un color"
- **Contexto compartido**: Tareas que requieren entender el mismo contexto deben ir juntas

**Proceso de Reagrupación:**
1. **Identificar familias funcionales** entre las tareas listadas
2. **Detectar tareas granulares** que podrían agruparse
3. **Verificar valor independiente** de cada grupo resultante
4. **Reorganizar tabla** agrupando tareas relacionadas en lotes coherentes

### 8. Resumen de Entendimiento
Generar párrafo conciso confirmando:
- Qué se va a implementar
- Cómo se integra con el proyecto actual
- Coordinación con trabajo actualmente en progreso
- Estrategia de milestone (usar existente o crear nuevo)

### 9. Output Final
Guardar en archivo `.claude/temp/draft-plan-[nombre-normalizado].md` con:
```markdown
# Plan Borrador: [Funcionalidad]

## Estado Actual del Trabajo
**Actualmente en Progreso (relacionado):**
- #[número]: [título] - En progreso por @[usuario]
- PR #[número]: [título] - [estado de review] por @[usuario]
- [No hay trabajo actualmente en progreso relacionado]

**Milestone Recomendado:**
- **Existente**: [Nombre] - [Fecha] (si hay uno apropiado)
- **Nuevo Sugerido**: "[Nombre Propuesto]" - [Fecha propuesta] (si no hay uno apropiado)

**Dependencias Bloqueantes:**
- #[número]: [título] - Debe completarse antes de iniciar
- [Ninguna dependencia bloqueante identificada]

## Entendimiento del Contexto
[Párrafo conciso confirmando qué se va a implementar, cómo se integra con el proyecto actual, y consideraciones principales basado en el análisis del repositorio]

## Análisis Crítico Realizado
**Gaps y Ideas Identificadas:**
- [Elementos faltantes encontrados en docs/args/análisis]
- [Riesgos técnicos no considerados originalmente]
- [Dependencias ocultas o validaciones adicionales]
- [Casos edge importantes a cubrir]

## Validación de Lotes Trabajables Aplicada
**Agrupación realizada:**
- [Descripción de cómo se reagruparon las tareas por funcionalidad]
- [Justificación de por qué cada lote genera valor de PR independiente]
- [Tareas que se combinaron y por qué]

## Plan de Tareas (Organizadas en Lotes Trabajables)

| # | Lote/Tarea | Descripción | Valor de PR | Origen | Dependencias |
|---|------------|-------------|-------------|---------|-------------|
| 1 | [Nombre lote] | [Qué funcionalidad completa se implementa] | [Por qué vale un PR] | **Doc/Args/Análisis** | [Issue #X, Milestone Y, o "Ninguna"] |
| 2 | [Nombre lote] | [Qué funcionalidad completa se implementa] | [Por qué vale un PR] | **Doc/Args/Análisis** | [Dependencia] |
| 3 | [Nombre lote] | [Qué funcionalidad completa se implementa] | [Por qué vale un PR] | **Doc/Args/Análisis** | [Dependencia] |
| 4 | [Nombre lote] | [Qué funcionalidad completa se implementa] | [Por qué vale un PR] | **Doc/Args/Análisis** | [Dependencia] |
| 5 | [Nombre lote] | [Qué funcionalidad completa se implementa] | [Por qué vale un PR] | **Doc/Args/Análisis** | [Dependencia] |

## Consideraciones Importantes
- **Integración**: [Cómo se integra con trabajo actualmente en progreso]
- **Coordinación**: [Si hay conflictos potenciales con trabajo actual]
- **Timing**: [Cuándo se puede iniciar basado en dependencias bloqueantes]
- **Milestone**: [Justificación de por qué usar existente o crear nuevo]

## Próximo Paso
**Para continuar con la planificación detallada:**

1. **Validar** que este entendimiento es correcto
2. **Confirmar** que las tareas identificadas cubren el scope deseado
3. **Ejecutar** el siguiente comando:
   ```
   /master-plan-detail draft-plan-[nombre-normalizado].md
   ```

**NOTA**: El comando master-plan-detail convertirá estas tareas en issues detallados de GitHub con checklists específicos.
```

**IMPORTANTE**: Al final, mostrar resumen del entendimiento y preguntar explícitamente si es correcto antes de proceder al siguiente paso.