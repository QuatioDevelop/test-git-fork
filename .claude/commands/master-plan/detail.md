---
description: Convertir borrador en plan maestro detallado con checklists, validando GitHub setup
allowed-tools: [Read, Write, Edit, Bash, Glob]
---

# Master Plan Detail Generator

Detallar plan maestro desde archivo: **$ARGUMENTS**

## Proceso:

### 1. Cargar Plan Borrador
Leer el archivo draft especificado desde `.claude/temp/`

### 2. Validación del Estado de GitHub
Antes de detallar, validar:
- **Repositorio actual**: Obtener información del owner del repo
- **Milestones existentes**: Listar milestones del repositorio actual
- **Projects detectados**: Verificar projects asociados a issues existentes
- **Labels configurados**: Revisar labels disponibles en el repo
- **Estado actual**: Issues existentes relacionados y duplicaciones

Comandos a ejecutar:
```bash
# Detectar owner del repositorio actual
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
echo "Repository owner: $REPO_OWNER"
gh repo view --json owner,name,nameWithOwner

# Listar milestones
gh api repos/:owner/:repo/milestones

# Listar projects del owner detectado
echo "Projects disponibles para $REPO_OWNER:"
gh project list --owner $REPO_OWNER

# Detectar projects asociados a issues existentes (método más efectivo)
echo "Detectando projects asociados a issues existentes..."
gh issue list --limit 50 --json number,title,projectItems | jq -r '.[] | select(.projectItems | length > 0) | .projectItems[0].title' | sort | uniq

# Listar labels del repo
gh label list

# Listar issues existentes para verificar duplicaciones
echo "Issues existentes para verificar duplicaciones:"
gh issue list --limit 50 --json number,title,state,labels --jq '.[] | "Issue #\(.number): \(.title) - \(.state) - Labels: \(.labels | map(.name) | join(", "))"'
```

### 3. Validación de Lotes Trabajables del Draft

**CRÍTICO - Revisar Agrupación Antes del Redimensionamiento:**
Antes de evaluar tamaños individuales, validar si la agrupación del draft es correcta:

**Preguntas de Validación de Lotes:**
- ¿Las tareas del draft están correctamente agrupadas por funcionalidad?
- ¿Hay tareas separadas que deberían hacerse juntas en el mismo PR?
- ¿Algún "lote" del draft es en realidad múltiples funcionalidades independientes?
- ¿Cada lote propuesto tiene valor tangible como PR independiente?

**Criterios de Reagrupación:**
```bash
# LOTE BIEN FORMADO:
#   - Funcionalidad coherente (ej: "Setup completo de autenticación")
#   - Valor independiente como PR
#   - Contexto técnico relacionado
#   - Test scenarios cohesivos

# REAGRUPAR SI:
#   - Tareas granulares de la misma funcionalidad están separadas
#   - Múltiples tareas requieren el mismo contexto técnico
#   - Tareas pequeñas que juntas forman una funcionalidad completa

# DIVIDIR SI:
#   - El "lote" cruza múltiples funcionalidades independientes
#   - Tiene dependencias internas complejas que justifican separación
#   - Es demasiado grande para un PR coherente
```

**Proceso de Validación de Lotes:**
1. **Mapear funcionalidades** representadas en el draft
2. **Identificar tareas fragmentadas** de la misma funcionalidad
3. **Detectar lotes híbridos** que mezclan funcionalidades
4. **Reagrupar según coherencia funcional** y valor de PR
5. **Validar que cada lote resultante** justifica un issue/PR independiente

### 4. Evaluación y Redimensionamiento de Tareas (Post-Reagrupación)

**Análisis de Tamaño de Cada Lote Validado:**
Para cada lote correctamente agrupado, evaluar:

```bash
# Criterios de evaluación de tamaño:
# EJECUTABLE (1 issue): 
#   - Se puede completar en una sesión de trabajo coherente
#   - Tiene un objetivo claro y específico
#   - No cruza múltiples dominios técnicos principales
#   - Checklist resultante sería de 5-15 items máximo

# DEMASIADO COMPLEJA (dividir):
#   - Cruza múltiples dominios (frontend + backend + infra)
#   - Requiere múltiples fases de implementación
#   - Checklist resultante sería de 20+ items
#   - Tiene dependencias internas complejas

# DEMASIADO PEQUEÑA (combinar):
#   - Checklist resultante sería de 2-3 items muy simples
#   - Es más bien un paso de una tarea mayor
#   - No justifica un issue independiente
```

**Proceso de Redimensionamiento:**

1. **Para cada tarea del draft:**
   - Estimar checklist resultante mentalmente
   - Identificar dominios técnicos involucrados
   - Evaluar si tiene sub-dependencias complejas

2. **Si la tarea es DEMASIADO COMPLEJA:**
   - Dividir por dominio técnico (ej: "Setup Frontend" + "Setup Backend")
   - O dividir por fases lógicas (ej: "Config Básica" + "Integración Avanzada")
   - Crear 2-3 tareas más específicas
   - **IMPORTANTE**: Solo dividir si realmente se justifica

3. **Si la tarea es DEMASIADO PEQUEÑA:**
   - Buscar tareas relacionadas para combinar
   - Crear una tarea consolidada más significativa
   - **IMPORTANTE**: Solo combinar si mantiene coherencia

4. **Si la tarea está BIEN DIMENSIONADA:**
   - Proceder directamente al detalle
   - No forzar cambios innecesarios

### 5. Detalle de Cada Tarea (Reagrupada y Redimensionada)

**Formato por tarea final:**
```markdown
### [Nombre de la Tarea] 
*[Nota si fue reagrupada/dividida/combinada desde el draft original]*

**Objetivo**: [Descripción específica del objetivo]

**Validación de Lote Trabajable**: 
- [Por qué este lote forma una funcionalidad coherente]
- [Valor específico que aporta como PR independiente]
- [Cómo se reagrupó desde el draft original, si aplica]

**Justificación de Tamaño**: 
- [Por qué esta tarea es del tamaño adecuado]
- [Si fue redimensionada: explicar la lógica]

**Checklist Detallado**:
- [ ] Subtarea específica 1
- [ ] Subtarea específica 2  
- [ ] Subtarea específica 3
- [ ] Subtarea específica 4-8 (ideal)

**Criterios de Aceptación**:
- Criterio funcional 1
- Criterio técnico 2
- Criterio de calidad 3

**Labels Sugeridos**: [infrastructure/frontend/backend/testing/critical]
**Estado Inicial**: [Todo/Backlog]
**Dependencias**: [Referencia a otras tareas si aplica]

**Referencias**:
- Archivo/documento relevante
- Comando específico a ejecutar
```

### 6. Configuración de GitHub
Basado en la validación, determinar:

**Milestone**:
- Si existe: usar milestone existente
- Si no existe: proponer creación con fecha específica

**Project Association**:
- Si existe project relacionado: usar ese project
- Si no existe: proponer creación de nuevo project

**Labels Necesarios**:
- Verificar si labels sugeridos existen
- Listar labels faltantes para crear

### 7. Verificación de Duplicaciones
Antes de generar el plan final, verificar:
- **Tareas similares**: Comparar con issues existentes para evitar duplicación
- **Dependencias**: Verificar que las dependencias realmente existen
- **Implementación existente**: Revisar si alguna funcionalidad ya está implementada
- **Scope overlap**: Detectar solapamiento con trabajo en progreso

### 8. Output Final
Guardar en archivo `.claude/temp/detailed-plan-[nombre].md` con:

```markdown
# Plan Detallado: [Funcionalidad]

## Validación de Lotes Trabajables Aplicada

**Análisis de Agrupación del Draft**:
- **Lotes del draft**: [número] 
- **Lotes finales**: [número]
- **Reagrupaciones realizadas**: [detalle de cómo se reorganizaron]

**Validación de Coherencia Funcional**:
- ✅ Cada lote representa una funcionalidad coherente
- ✅ Cada lote justifica un PR con valor independiente  
- ✅ No hay tareas granulares separadas artificialmente
- ✅ No hay micro-PRs para cambios triviales

**Cambios de Agrupación Realizados**:
- **Reagrupadas**: [Tarea A + Tarea B → Lote AB] - Justificación: [misma funcionalidad]
- **Divididas**: [Lote X → Lote X1 + Lote X2] - Justificación: [funcionalidades independientes]
- **Sin cambios**: [Lotes que ya estaban bien agrupados]

## Redimensionamiento de Lotes Validados

**Lotes Originales Post-Reagrupación**: [número]
**Issues Finales Ejecutables**: [número]

**Cambios de Tamaño Realizados**:
- **Divididos**: [Lote X → Issue X1 + Issue X2] - Justificación: [razón técnica]
- **Combinados**: [Lote Y + Lote Z → Issue YZ] - Justificación: [razón técnica]  
- **Sin cambios**: [Lotes que ya tenían el tamaño adecuado]

**Principios Aplicados**:
- ✅ Lotes agrupados por funcionalidad coherente
- ✅ Cada issue ejecutable en sesiones coherentes de trabajo
- ✅ Checklists de 5-15 items por issue
- ✅ Un dominio técnico principal por issue (cuando es posible)
- ✅ Valor de PR claro y tangible para cada issue

## Configuración GitHub Detectada
- **Milestone**: [existente/a crear] - [nombre] - [fecha]
- **Project**: [detectado/a crear] - [nombre detectado automáticamente]
- **Labels Faltantes**: [lista de labels a crear]

## Verificación de Duplicaciones
- **Issues similares existentes**: [lista de issues que podrían duplicar trabajo]
- **Funcionalidades ya implementadas**: [lista de funcionalidades que ya existen]
- **Conflictos potenciales**: [posibles conflictos con trabajo en progreso]

## Issues a Crear

[Detalle completo de cada issue con formato especificado]

## Resumen de Ejecución
- **Lotes trabajables validados**: [número]
- **Total issues finales**: [número]
- **Reagrupaciones realizadas**: [número]
- **Valor de PR garantizado**: ✅ Cada issue genera PR con valor tangible
- **Milestone**: [acción requerida]
- **Project**: [acción requerida] 
- **Labels nuevos**: [número]
- **Duplicaciones detectadas**: [número]

## Comandos GitHub que se ejecutarán:
```bash
# Ejemplo de comandos que se ejecutarán en /github-deploy
gh api repos/:owner/:repo/milestones -f title="..." -f due_on="..."
gh label create "..." --color "..." --description "..."
gh issue create --title "..." --milestone "..." --label "..." --body "..."
```

## Próximo Paso
Si la configuración y detalle están correctos, ejecutar:
`/master-plan-deploy detailed-plan-[nombre].md`
```

**IMPORTANTE**: Mostrar resumen de lo que se creará en GitHub y pedir confirmación antes del deploy.