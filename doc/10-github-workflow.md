# GitHub Workflow - Comandos Útiles

Este documento contiene todos los comandos de GitHub CLI validados para gestionar issues, proyectos, ramas y el workflow completo de desarrollo.

## Tabla de Contenidos

1. [Búsqueda y Exploración](#búsqueda-y-exploración)
2. [Creación de Issues](#creación-de-issues)
3. [Gestión de Issues](#gestión-de-issues)
4. [Proyectos GitHub](#proyectos-github)
5. [Estados vs Campos de Proyecto](#estados-vs-campos-de-proyecto)
6. [Workflow Completo](#workflow-completo)
7. [Referencias Rápidas](#referencias-rápidas)

## Búsqueda y Exploración

### Listar Issues
```bash
# Listar issues recientes
gh issue list --limit 10

# Buscar issues por estado
gh issue list --state open
gh issue list --state closed

# Buscar issues por label
gh issue list --label "priority: P1"
gh issue list --label "frontend"

# Buscar issues por milestone
gh issue list --milestone "Fase 1 - Validación Técnica"

# Ver detalles completos de un issue
gh issue view 46 --json number,title,state,labels,assignees,milestone,projectItems
```

### Explorar Proyectos
```bash
# Listar proyectos de la organización
gh project list --owner QuatioDevelop

# Ver items de un proyecto
gh project item-list 9 --owner QuatioDevelop --format json

# Ver campos y opciones de un proyecto
gh project field-list 9 --owner QuatioDevelop
```

### Explorar Labels y Milestones
```bash
# Listar todos los labels disponibles
gh label list

# Ver milestones
gh api repos/QuatioDevelop/sura-esenciafest-2025/milestones
```

## Creación de Issues

### Issue Básico
```bash
gh issue create \
  --title "Título del issue" \
  --body "Descripción detallada del problema o feature"
```

### Issue Completo con Metadatos
```bash
gh issue create \
  --title "Implementar nueva funcionalidad" \
  --body "Descripción detallada con criterios de aceptación" \
  --label "frontend" \
  --label "priority: P2" \
  --assignee "@me" \
  --milestone "Fase 1 - Validación Técnica" \
  --project "Esencia Fest 2025"
```

### Issue desde Rama Actual
```bash
# Crear issue y asociarlo automáticamente a la rama actual
gh issue create \
  --title "Feature desarrollada en $(git branch --show-current)" \
  --body "Issue creada desde la rama actual para el workflow de desarrollo" \
  --label "testing" \
  --assignee "@me" \
  --project "Esencia Fest 2025"
```

## Gestión de Issues

### Editar Issues
```bash
# Agregar labels
gh issue edit 49 --add-label "priority: P3" --add-label "backend"

# Quitar labels
gh issue edit 49 --remove-label "priority: P3"

# Cambiar asignación
gh issue edit 49 --add-assignee "@me"
gh issue edit 49 --remove-assignee "usuario"

# Cambiar milestone
gh issue edit 49 --milestone "Nuevo Milestone"

# Agregar/quitar de proyectos
gh issue edit 49 --add-project "Nuevo Proyecto"
gh issue edit 49 --remove-project "Proyecto Viejo"
```

### Comentarios
```bash
# Agregar comentario
gh issue comment 49 --body "Comentario de progreso o actualización"

# Ver issue con comentarios
gh issue view 49 --comments
```

### Cerrar/Reabrir Issues
```bash
# Cerrar issue
gh issue close 49 --reason "completed"
gh issue close 49 --reason "not_planned"

# Reabrir issue
gh issue reopen 49
```

## Proyectos GitHub

### Información del Proyecto
```bash
# IDs necesarios (obtenidos via GraphQL)
PROJECT_ID="PVT_kwDOBTzlQ84A9igu"
STATUS_FIELD_ID="PVTSSF_lADOBTzlQ84A9iguzgxNkjg"
PRIORITY_FIELD_ID="PVTSSF_lADOBTzlQ84A9iguzgxcNaU"
```

### Opciones de Status Disponibles
- **Backlog** - ID: `63058c9b`
- **Todo** - ID: `f75ad846`
- **In Progress** - ID: `47fc9ee4`
- **In Review** - ID: `755e24a2`
- **Done** - ID: `98236657`

### Opciones de Priority Disponibles
- **P0** (Critical) - ID: `6fa282b4`
- **P1** (High) - ID: `7b74aaff`
- **P2** (Medium) - ID: `627310aa`
- **P3** (Medium-Low) - ID: `70809c31`
- **P4** (Low) - ID: `bee470ee`
- **P5** (Lowest) - ID: `64f19bab`

### Cambiar Status del Proyecto
```bash
# Cambiar a "In Progress"
gh project item-edit \
  --id "ITEM_ID_DEL_ISSUE" \
  --field-id "$STATUS_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "47fc9ee4"

# Cambiar a "Done"
gh project item-edit \
  --id "ITEM_ID_DEL_ISSUE" \
  --field-id "$STATUS_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "98236657"
```

### Cambiar Priority del Proyecto
```bash
# Cambiar a P3 (Medium-Low)
gh project item-edit \
  --id "ITEM_ID_DEL_ISSUE" \
  --field-id "$PRIORITY_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "70809c31"

# Cambiar a P1 (High)
gh project item-edit \
  --id "ITEM_ID_DEL_ISSUE" \
  --field-id "$PRIORITY_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "7b74aaff"
```

### Obtener Item ID de un Issue
```bash
# Buscar en la lista de items del proyecto
gh project item-list 9 --owner QuatioDevelop --format json | grep -A5 -B5 "TITULO_DEL_ISSUE"
```

## Estados vs Campos de Proyecto

### ⚠️ Diferencia Importante

**Estados de Issues (binario):**
- `OPEN` - Issue abierto
- `CLOSED` - Issue cerrado

**Campos de Proyecto (workflow):**
- **Status**: Backlog → Todo → In Progress → In Review → Done
- **Priority**: P0 → P1 → P2 → P3 → P4 → P5

**Son independientes:** Un issue puede estar `OPEN` pero tener status `Done` en el proyecto.

### Labels vs Campos de Proyecto

**Labels del repositorio:**
```bash
# Estos son labels simples
--label "priority: P1"
--label "frontend" 
--label "testing"
```

**Campos del proyecto:**
```bash
# Estos son campos estructurados con opciones predefinidas
--field-id "PRIORITY_FIELD_ID" --single-select-option-id "P1_OPTION_ID"
--field-id "STATUS_FIELD_ID" --single-select-option-id "IN_PROGRESS_ID"
```

**Los labels y campos de proyecto son independientes** - pueden tener valores diferentes.

## Workflow Completo

### 1. Crear Feature Branch desde Issue
```bash
# Crear issue
ISSUE_URL=$(gh issue create \
  --title "Implementar sistema de autenticación" \
  --body "Feature completa con login, registro y middleware" \
  --label "frontend" \
  --label "priority: P1" \
  --assignee "@me" \
  --milestone "Fase 1 - Validación Técnica" \
  --project "Esencia Fest 2025")

# Extraer número del issue
ISSUE_NUMBER=$(echo $ISSUE_URL | grep -o '[0-9]*$')

# Crear rama desde el issue
git checkout main
git pull origin main
git checkout -b "feature/auth-system-issue-$ISSUE_NUMBER"
```

### 2. Desarrollo con Updates de Status
```bash
# Cambiar status a "In Progress"
gh project item-edit \
  --id "ITEM_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "47fc9ee4"

# Agregar comentarios de progreso
gh issue comment $ISSUE_NUMBER --body "✅ Configuración inicial completada"
gh issue comment $ISSUE_NUMBER --body "🔄 Implementando validación de formularios"
```

### 3. Pull Request y Review
```bash
# Cambiar status a "In Review"
gh project item-edit \
  --id "ITEM_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "755e24a2"

# Crear Pull Request
gh pr create \
  --title "Implementar sistema de autenticación" \
  --body "Fixes #$ISSUE_NUMBER" \
  --assignee "@me" \
  --reviewer "team-member"
```

### 4. Merge y Cierre Automático
```bash
# Al hacer merge del PR, el issue se cierra automáticamente por "Fixes #N"
# Cambiar status a "Done"
gh project item-edit \
  --id "ITEM_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --project-id "$PROJECT_ID" \
  --single-select-option-id "98236657"
```

### 5. Workflow de Branch desde Issue (GitHub Web)
```bash
# Alternativa: crear branch directamente desde issue en GitHub Web
# 1. Ir al issue en GitHub
# 2. Click en "Create a branch" en la sidebar derecha
# 3. Automáticamente crea branch con formato: ISSUE_NUMBER-titulo-del-issue
# 4. Pull request automáticamente se vincula al issue
```

## Referencias Rápidas

### Comandos de Información
```bash
# Verificar autenticación y scopes
gh auth status

# Ver configuración actual del repo
gh repo view --json name,owner,url

# Estado actual de la rama
git status
git branch --show-current
```

### Obtener IDs para Comandos Avanzados
```bash
# GraphQL para obtener project fields y opciones
gh api graphql -f query='{
  organization(login: "QuatioDevelop") {
    projectV2(number: 9) {
      id
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}'
```

### Comandos de Limpieza
```bash
# Cerrar issues de prueba
gh issue close ISSUE_NUMBER --reason "completed"

# Eliminar rama local
git branch -d feature/branch-name

# Eliminar rama remota  
git push origin --delete feature/branch-name
```

---

## Notas Importantes

1. **Scopes necesarios**: Asegúrate de tener el scope `project` en tu token de GitHub CLI:
   ```bash
   gh auth refresh -s project
   ```

2. **IDs del proyecto**: Los IDs de campos y opciones son específicos de cada proyecto. Usa el comando GraphQL para obtenerlos.

3. **Automatización**: Los issues se cierran automáticamente cuando un PR que contenga "Fixes #N" o "Closes #N" es merged.

4. **Consistencia**: Mantén sincronizados los labels del repositorio con los campos del proyecto para mejor organización.

5. **Workflow recomendado**: Issue → Branch → Development → PR → Review → Merge → Auto-close