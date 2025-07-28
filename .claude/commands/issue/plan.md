---
description: Analizar un issue de GitHub y generar plan de resolución con investigación opcional según complejidad
allowed-tools: [Read, Bash, Glob, Grep, WebSearch, WebFetch, TodoWrite]
---

# Plan Issue Generator

Generar plan de resolución para issue: **$ARGUMENTS**

## Proceso:

### Fase 1: Análisis y Clasificación (SIEMPRE)

**Detectar Guía de Contribuciones:**
```bash
# Buscar dinámicamente guías de contribución en el proyecto
find doc/ docs/ . -maxdepth 2 -type f -name "*.md" | xargs grep -l -i -E "(contribuci|contribution|workflow|branching|development.*guide)" 2>/dev/null | head -1

# Si se encuentra guía, leerla para aplicar reglas actuales
if [ -f "$GUIDE_FILE" ]; then
  echo "Found contribution guide: $GUIDE_FILE"
  # Será utilizada en Fase 3 para generar compliance steps
fi
```

**Obtener Issue desde GitHub:**
```bash
# Obtener información del issue
gh api "repos/:owner/:repo/issues/$ISSUE_NUMBER" --jq '{
  title: .title,
  body: .body,
  labels: [.labels[].name],
  state: .state,
  assignees: [.assignees[].login],
  milestone: .milestone.title,
  created_at: .created_at,
  updated_at: .updated_at
}'

# Obtener comentarios del issue para contexto adicional
gh api "repos/:owner/:repo/issues/$ISSUE_NUMBER/comments" --jq '.[].body'
```

**Detectar Stack Tecnológico:**
- Detectar framework/tecnología principal (package.json, requirements.txt, go.mod, etc.)
- Identificar stack de infraestructura (CloudFormation, Terraform, Docker, etc.)
- Determinar arquitectura (monolito, microservicios, serverless, etc.)

**Verificar Implementación en Progreso:**
```bash
# Buscar branches relacionados al issue
gh pr list --search "$ISSUE_NUMBER" --state all
gh api "repos/:owner/:repo/branches" --jq '.[].name' | grep -i -E "(issue|fix|feature).*$ISSUE_NUMBER|$ISSUE_NUMBER.*(issue|fix|feature)"

# Buscar commits relacionados
gh api "repos/:owner/:repo/commits" --jq '.[].commit.message' | grep -i "#$ISSUE_NUMBER"

# Buscar código relacionado usando palabras clave del issue
# Extraer keywords del título y descripción del issue para búsqueda inteligente
```

**Analizar Contexto del Repositorio:**
- Revisar documentación relevante según stack detectado
- Buscar código relacionado usando palabras clave del issue
- Identificar archivos potencialmente afectados
- Revisar issues similares existentes
- **Detectar si hay trabajo en progreso** (branches, PRs, commits relacionados)

**Análisis Crítico de Documentación (SI EL ISSUE INVOLUCRA DOCUMENTACIÓN):**
```bash
# Solo ejecutar si el issue menciona docs, README, comandos, guías, etc.
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qi -E "(doc|readme|command|guía|guide|manual|instruction|help)"; then
  echo "📋 Issue involucra documentación - Análisis crítico requerido"
  
  # 1. Mapear documentación existente
  find . doc/ docs/ -name "*.md" -type f | head -20
  
  # 2. Identificar documentos relacionados al cambio
  RELATED_DOCS=$(find . doc/ docs/ -name "*.md" -type f | xargs grep -l -i "[palabras clave del issue]" 2>/dev/null)
  
  # 3. Preguntas críticas para validar
  echo "🤔 PREGUNTAS CRÍTICAS DE DOCUMENTACIÓN:"
  echo "   ¿Es realmente necesario documentar esto?"
  echo "   ¿Ya existe documentación similar que se pueda actualizar?"
  echo "   ¿Esta información se vuelve obsoleta rápidamente?"
  echo "   ¿Los usuarios realmente necesitan esta información?"
  echo "   ¿Se puede explicar de forma más concisa?"
fi
```

**Clasificación Automática:**
Evaluar según estos criterios:
- **SIMPLE**: 
  - Copy changes, textos, traducciones
  - Ajustes de styling/CSS básicos
  - Configuración simple (colores, URLs, constantes)
  - Bug fixes de 1-2 líneas
  - **Documentación básica**: Correcciones de typos, actualización de URLs, cambios menores
  
- **COMPLEJO**:
  - Nuevas features o funcionalidades
  - Cambios de arquitectura
  - Integraciones con APIs externas
  - Infraestructura AWS/CloudFormation
  - Performance optimization
  - Security improvements
  - Cambios que afectan múltiples componentes
  - **Documentación compleja**: Nuevas guías, comandos no probados, reestructuración de docs

**Clasificación Especial para Documentación:**
- **DOCUMENTACIÓN CRÍTICA**: Requiere análisis exhaustivo si involucra:
  - Comandos que deben probarse
  - Procedimientos que otros van a seguir
  - Información que puede volverse obsoleta
  - Decisiones de arquitectura o diseño

### Fase 2: Investigación Profunda (SOLO SI ES COMPLEJO)

**Investigación de Mejores Prácticas:**
```bash
# Buscar patrones y mejores prácticas específicos al stack detectado
WebSearch: "[problema específico] best practices [stack detectado] 2025"
WebSearch: "[framework detectado] [funcionalidad específica] implementation patterns"
```

**Investigación de Soluciones Existentes:**
```bash
# Buscar paquetes según el ecosystem detectado
# Solo si aplica al stack actual:
# - npm/yarn para JavaScript/TypeScript
# - pip/poetry para Python  
# - go modules para Go
# - maven/gradle para Java
# - composer para PHP
WebSearch: "[package manager detectado] [funcionalidad específica] [framework detectado]"
WebSearch: "[lenguaje detectado] library [problema específico] 2025"
```

**Documentación Oficial:**
```bash
# Obtener documentación oficial SOLO según tecnologías realmente detectadas
# Ejemplos condicionales:
# - Si detecta AWS CloudFormation/SAM → AWS docs
# - Si detecta Next.js → Next.js docs  
# - Si detecta React → React docs
# - Si detecta Python → Python docs
# - Si detecta Go → Go docs
# - Si detecta Docker → Docker docs
# - Si detecta Kubernetes → K8s docs
WebFetch: [URL de documentación específica al stack detectado]
```

**Lluvia de Ideas y Evaluación:**
Generar 3-5 enfoques alternativos relevantes al stack detectado:
1. **Enfoque Nativo**: Implementación desde cero con tecnologías actuales
2. **Enfoque con Librería**: Usar paquete especializado del ecosystem detectado
3. **Enfoque Managed Service**: Solo si se detecta cloud provider específico
4. **Enfoque Híbrido**: Combinación de aproximaciones existentes
5. **Enfoque Iterativo**: Implementación por fases cuando la complejidad lo amerite

**Matriz de Evaluación:**
Para cada enfoque evaluar:
- **Complejidad** (1-5)
- **Mantenibilidad** (1-5)
- **Performance** (1-5)
- **Fit Arquitectura** (1-5)
- **Riesgo** (1-5)

### Fase 2.5: Validación Frontend/UI (SI EL ISSUE INVOLUCRA CAMBIOS DE UI/FRONTEND)

**Análisis Crítico para Implementación Frontend:**
```bash
# Solo ejecutar si el issue menciona componentes, UI, frontend, styling, etc.
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qi -E "(ui|frontend|component|styling|design|button|form|page|layout|css|tailwind)"; then
  echo "🎨 Issue involucra cambios Frontend/UI - Análisis de arquitectura requerido"
  
  # 1. Revisar documentación de arquitectura frontend
  find doc/ docs/ . -name "*.md" -type f | xargs grep -l -i -E "(arquitectura.*cliente|frontend|ui|component|design.*system)" 2>/dev/null | head -3
  
  # 2. Revisar estructura actual de componentes
  find apps/shared/src/components apps/*/src/components -name "*.tsx" -o -name "*.jsx" 2>/dev/null | head -10
  
  # 3. Revisar design system existente
  find apps/shared/src/styles apps/shared/src/tokens -name "*.ts" -o -name "*.css" 2>/dev/null | head -5
  
  echo "🤔 PREGUNTAS CRÍTICAS FRONTEND:"
  echo "   ¿Este componente debe ir en shared/ o en la app específica?"
  echo "   ¿Ya existe un componente similar que se pueda reutilizar/extender?"
  echo "   ¿Debe seguir el design system existente (tokens, temas)?"
  echo "   ¿Requiere usar las fuentes corporativas y los colores/tokens establecidos?"
  echo "   ⚠️  ¿Necesita soporte para diferentes temas (si existen) - TEMPORALES?"
  echo "   ¿Los colores usados serán reemplazados cuando se definan los diseños finales?"
  echo "   ¿Es un componente que otras partes del sistema podrían reutilizar?"
  echo "   ¿Debe integrarse con shadcn/ui existente o ser completamente custom?"
  echo "   ¿Requiere estados responsive/mobile-first?"
  echo "   ¿Necesita seguir patrones de accesibilidad establecidos?"
fi
```

**Decisiones Arquitectónicas Frontend:**
Si se detectan cambios de UI, determinar:
- **Ubicación del componente**: 
  - `apps/shared/` si es reutilizable entre múltiples aplicaciones
  - `apps/[app-específica]/` si es específico de una aplicación particular
- **Design System Compliance**: 
  - Usar design tokens existentes (`colors`, `typography`, `spacing`)
  - Aplicar fuentes corporativas como fuente principal
  - ⚠️ **Temas TEMPORALES**: Los temas existentes serán reemplazados con diseños finales
  - Implementar soporte para diferentes temas si es aplicable (considerando que cambiarán)
- **Patrones Existentes**: 
  - Verificar si hay componentes similares para mantener consistencia
  - Seguir estructura de shadcn/ui si aplica
  - Mantener convenciones de naming y organización actuales

### Fase 3: Análisis de Compliance y Generación de Checklist (SIEMPRE)

**Analizar Guía de Contribuciones para Strategy de Ramas:**
```bash
# Si se encontró guía en Fase 1, analizarla para determinar estrategia de ramas
if [ -f "$GUIDE_FILE" ]; then
  # Leer y analizar reglas actuales de la guía
  Read: $GUIDE_FILE
  
  # Determinar para ESTE issue específico:
  # - ¿Requiere una rama sencilla o subramas según criterios de la guía?
  # - ¿Qué convención de naming aplica para las ramas?
  # - ¿Se necesitan sub-issues obligatorios (si usa subramas)?
  # - ¿Qué versioning strategy aplicar?
  # - ¿Existen ya branches relacionados?
  
  # VERSIONING STRATEGY PARA DESARROLLO:
  # - Mantener versiones 0.x.x durante desarrollo hasta primer release de producción
  # - Version bumps incrementales: 0.1.0 → 0.2.0 → 0.3.0 para cada tarea/issue
  # - Solo llegar a 1.0.0 para primer release que usen usuarios finales
  # - Source of truth: package.json version field
  
  # Verificar estado actual del repo
  gh api "repos/:owner/:repo/branches" --jq '.[].name' | grep -E "issue.*$ISSUE_NUMBER|$ISSUE_NUMBER.*issue"
fi
```

**Determinar Strategy de Branching:**
Basado en el análisis de la guía actual, determinar:
- **DEFAULT**: Rama única secuencial `feature/issue-{numero}-{descripcion-especifica}`
- **Subramas**: SOLO si el issue explícitamente menciona:
  - Trabajo paralelo requerido, O  
  - Múltiples developers simultáneos
- **Si no se especifica**: Usar rama única secuencial
- **Sub-issues obligatorios**: Si se usan subramas, crear sub-issues ANTES que subramas
- **Naming específico**: Nombres descriptivos de la tarea real, no genéricos
  
**NAMING GUIDELINES ESPECÍFICAS:**
- ✅ **Correcto**: `feature/issue-1-aws-infrastructure-deployment` (específico)
- ❌ **Evitar**: `feature/issue-1-infrastructure` (genérico)
- ✅ **Correcto**: `feature/issue-5-forum-backend-api` (describe exactamente qué se implementa)
- ❌ **Evitar**: `feature/issue-5-backend` (demasiado amplio)
- **Regla**: El nombre debe indicar exactamente QUÉ funcionalidad/componente se está implementando

**Generar Checklist Coherente:**
Considerar estas categorías al planificar (NO como estructura fija):
- **Preparación**: Setup, configuración, dependencias
- **Implementación**: Código core, componentes, funcionalidades
- **Integración**: Conexiones, tests, validaciones
- **Deployment**: Build, deploy, monitoreo

**Crear lista de pasos lógicos y secuenciales** según el contexto real del issue:
- Si algo está empezado → "Terminar implementación de X"
- Si falta configuración → "Configurar Y"
- Si es nuevo → "Crear Z desde cero"
- Si es fix → "Corregir comportamiento de W"

### 4. Output Final

**IMPORTANTE**: Los archivos de plan se guardan en el proyecto, NO en carpeta personal del usuario.

```bash
# Crear carpeta .claude/artifact-temp en el proyecto actual si no existe
mkdir -p .claude/artifact-temp
```

Generar archivo `.claude/artifact-temp/issue-plan-$ISSUE_NUMBER.md`:

```markdown
# Plan para Issue #$ISSUE_NUMBER: $ISSUE_TITLE

**Fecha de Análisis**: $(date '+%Y-%m-%d %H:%M')
**Estado del Issue**: $ISSUE_STATE
**Labels**: $ISSUE_LABELS

## Clasificación: [SIMPLE/COMPLEJO]

**Criterios de Clasificación Aplicados:**
- [Criterio 1]: [Evaluación]
- [Criterio 2]: [Evaluación]
- **Resultado**: [SIMPLE/COMPLEJO] porque [justificación]

## Análisis del Issue

**Descripción del Problema:**
$ISSUE_BODY

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: [detectado automáticamente]
- Infraestructura: [detectada automáticamente]
- Package Manager: [detectado automáticamente]
- Arquitectura: [detectada automáticamente]

**Estado Actual:**
- Trabajo en progreso: [Sí/No]
- Archivos afectados: [lista]
- Issues similares: [número]

**Impacto:**
- Frontend: [Sí/No]
- Backend: [Sí/No]
- Infraestructura: [Sí/No]

## [SOLO SI COMPLEJO] Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| [Enfoque 1] | X/5 | X/5 | X/5 | X/5 | X/5 | XX/25 |
| [Enfoque 2] | X/5 | X/5 | X/5 | X/5 | X/5 | XX/25 |
| [Enfoque 3] | X/5 | X/5 | X/5 | X/5 | X/5 | XX/25 |

**Approach Seleccionado:** [Enfoque X] (Score: XX/25)

**Justificación:**
[Explicación detallada de por qué este enfoque es el mejor para nuestro contexto específico]

**Tecnologías/Paquetes Recomendados:**
- [Paquete/Servicio 1]: [versión] - [propósito]
- [Paquete/Servicio 2]: [versión] - [propósito]

**Consideraciones Especiales:**
- **Infraestructura**: [Solo si aplica al stack detectado - servicios y patrones recomendados]
- **Performance**: [Consideraciones de rendimiento específicas al stack]
- **Security**: [Consideraciones de seguridad según tecnologías detectadas]
- **Compatibility**: [Compatibilidad con stack y versiones actuales]
- **Dependencias**: [Análisis de dependencias del package manager detectado]

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### [Rama Sencilla / Rama Padre + Subramas]
- **Estrategia recomendada**: [Rama sencilla por DEFAULT / Multi-rama solo si se especifica trabajo paralelo]
- **Justificación**: [Por qué esta estrategia según criterios de la guía]

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-{numero}-{descripcion-especifica-de-tarea}`
- **Subramas** (si aplica):
  - `feature/issue-{numero}-{componente-especifico-1}`
  - `feature/issue-{numero}-{componente-especifico-2}`

### Sub-Issues Necesarios (si aplica)
- **Sub-issue #{numero}-1**: "{Verbo} {Componente Específico} {Contexto}"
- **Sub-issue #{numero}-2**: "{Verbo} {Componente Específico} {Contexto}"

## Checklist de Implementación

### Preparación y Setup

- [ ] [Paso de preparación 1: configuración inicial]
- [ ] [Paso de preparación 2: dependencias]

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Si es rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-{numero}-{descripcion-especifica}`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 1.0.0 → 0.1.0 para desarrollo)

**Si requiere subramas (solo si se especifica trabajo paralelo):**
- [ ] **Crear sub-issues obligatorios**: #{numero}-1, #{numero}-2, etc.
- [ ] **Crear rama padre**: `feature/issue-{numero}-{descripcion-general}`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
- [ ] **Crear subramas**: Una por sub-issue (cuando sea necesario en el flujo)

### Implementación Core

**[SOLO SI ES ISSUE COMPLEJO] - Trabajo Incremental:**
*Para issues SENCILLOS, implementar directamente sin commits intermedios*

- [ ] [Paso implementación 1: funcionalidad core]
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar que funciona básicamente antes de continuar
- [ ] [Paso implementación 2: componente principal]  
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar integración antes de continuar
- [ ] **[Solo si COMPLEJO] Validación intermedia**: Ejecutar pruebas básicas y hacer commit si funciona

### [PUNTO DE RAMIFICACIÓN - Si hay subramas]
*Los siguientes pasos se ejecutarían en paralelo en subramas diferentes:*

**En subrama feature/issue-{numero}-{componente-1}:**
- [ ] **Cambiar a subrama 1**: Crear y cambiar a subrama específica
- [ ] [Implementación específica componente 1]
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar funcionalidad parcial
- [ ] [Testing componente 1]
  - [ ] **Commit funcional**: Solo si las pruebas pasan
- [ ] **PR subrama 1**: Hacer PR de subrama → rama padre
- [ ] **Cerrar sub-issue #{numero}-1**

**En subrama feature/issue-{numero}-{componente-2}:**
- [ ] **Cambiar a subrama 2**: Crear y cambiar a subrama específica
- [ ] [Implementación específica componente 2]
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar funcionalidad parcial
- [ ] [Testing componente 2]
  - [ ] **Commit funcional**: Solo si las pruebas pasan
- [ ] **PR subrama 2**: Hacer PR de subrama → rama padre
- [ ] **Cerrar sub-issue #{numero}-2**

### Integración y Finalización

- [ ] **Merger subramas** (si aplica): Integrar todas las subramas en rama padre
- [ ] **Testing de integración**: Ejecutar pruebas específicas del proyecto
- [ ] **Validación end-to-end**: Confirmar funcionamiento completo
- [ ] **[Solo si COMPLEJO] Commit de integración**: Solo si todas las validaciones pasan
- [ ] **PR final**: Hacer PR de rama principal → main
- [ ] **Cerrar issue principal**: Una vez mergeado el PR final

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Detectar comandos de prueba**: Revisar CLAUDE.md, package.json, README para comandos
- [ ] **Lint**: `npm run lint` (si está definido)
- [ ] **Type Check**: `npm run type-check` (si está definido) 
- [ ] **Tests unitarios**: `npm test` o comando específico del proyecto
- [ ] **Build**: `npm run build` o comando específico del proyecto
- [ ] **E2E Tests**: Si están definidos en la documentación del proyecto
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Documentación y Validación (SOLO SI EL ISSUE REQUIERE DOCUMENTACIÓN)

**Análisis de Necesidad de Documentación:**
- [ ] **¿Realmente necesita documentación?**: Evaluar si el cambio requiere documentar algo
- [ ] **Revisar documentación existente**: Buscar documentos relacionados que se puedan actualizar
- [ ] **Evaluar redundancia**: ¿Ya existe información similar en otro lugar?
- [ ] **Principio de concisión**: ¿Se puede explicar de forma más breve?

**Validación de Comandos (SI SE DOCUMENTAN COMANDOS):**
- [ ] **CRÍTICO - Probar cada comando**: NUNCA documentar un comando sin probarlo
- [ ] **Validar sintaxis**: Verificar que el comando funciona exactamente como se documenta
- [ ] **Probar en entorno real**: Ejecutar en las mismas condiciones que el usuario
- [ ] **Documentar output esperado**: Incluir ejemplos de salida cuando sea útil
- [ ] **Verificar permisos**: Asegurar que el comando funciona con permisos de usuario típico

**Principios de Documentación Concisa:**
- [ ] **Solo lo necesario**: No documentar lo obvio o lo que cambia frecuentemente
- [ ] **Actualizar vs crear**: Preferir actualizar documentos existentes
- [ ] **Enfoque en casos de uso**: Documentar CÓMO usarlo, no QUÉ es (si es obvio)
- [ ] **Ejemplos reales**: Usar casos de uso reales del proyecto
- [ ] **Maintenance burden**: Considerar si la documentación requiere mantenimiento frecuente

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (ej: 0.1.0 → 0.2.0 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

**Filosofía de Trabajo Incremental (Solo Issues COMPLEJOS):**
- Para issues SENCILLOS: Implementar directamente y hacer un solo commit final
- Para issues COMPLEJOS: Cada paso de implementación debe incluir validación intermedia
- Hacer commit solo cuando la funcionalidad parcial esté funcionando
- No avanzar al siguiente paso si hay pruebas fallidas
- Priorizar commits pequeños y funcionales vs commits grandes

*Ejemplos de pasos contextuales:*
- "Completar configuración CloudFormation templates"
- "Implementar endpoints API Gateway base"
- "Configurar DynamoDB schema según doc/05-arquitectura-datos.md"
- "Validar comunicación end-to-end apps → API → DB"

## Criterios de Aceptación
- [ ] [Criterio funcional 1]
- [ ] [Criterio técnico 1]
- [ ] [Criterio de calidad 1]
- [ ] Tests pasan correctamente
- [ ] No hay degradación de performance
- [ ] Documentación actualizada

## Riesgos Identificados
1. **[Riesgo 1]**: [Descripción] - Mitigación: [estrategia]
2. **[Riesgo 2]**: [Descripción] - Mitigación: [estrategia]

## Estimación
- **Complejidad**: [1-5] - [Simple/Media/Alta]
- **Dependencias Bloqueantes**: [Lista o "Ninguna"]

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #$ISSUE_NUMBER según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-$ISSUE_NUMBER.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-$ISSUE_NUMBER.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/:owner/:repo/issues/$ISSUE_NUMBER
- Documentación Consultada: [enlaces]
- Paquetes/Servicios Investigados: [enlaces]
```

### 5. Validaciones Finales

Antes de guardar el plan:
- Verificar que la clasificación es correcta
- Confirmar que la investigación (si aplicó) es comprehensiva
- Validar que los pasos son ejecutables y lógicos
- Asegurar que el approach seleccionado fit con la arquitectura actual
- **Verificar compliance steps**: Si hay guía, asegurar que se aplicaron correctamente las reglas

**Graceful Degradation**: Si no se encuentra guía de contribuciones, el plan se genera igual pero sin la sección "Workflow Compliance Steps".

**IMPORTANTE**: Este comando NO ejecuta ninguna implementación, solo genera el plan estratégico para revisión manual.