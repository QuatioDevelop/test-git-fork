---
description: Deployar plan maestro detallado a GitHub como milestone, issues y project
allowed-tools: [Read, Bash, TodoWrite]
---

# Master Plan Deploy

Deployar a GitHub el plan maestro detallado: **$ARGUMENTS**

## Proceso:

### 1. Cargar Plan Detallado
Leer el archivo detailed-plan especificado desde `.claude/temp/` y extraer:
- Configuración de milestone (nombre, fecha)
- Configuración de project (nombre, ID si existe)
- Labels faltantes a crear
- Lista completa de issues con checklists
- Estados iniciales para cada issue

### 2. Detección Automática del Repositorio
```bash
# Obtener owner y repo del directorio actual (usar gh --jq)
OWNER=$(gh repo view --json owner,name --jq '.owner.login')
REPO=$(gh repo view --json owner,name --jq '.name')
```

### 3. Ejecución Secuencial (Sin Interactividad)

**Crear TodoWrite para tracking:**
- [ ] Detectar repositorio actual
- [ ] Crear/verificar milestone
- [ ] Crear labels faltantes
- [ ] Crear/verificar project
- [ ] Crear issues uno por uno
- [ ] Asociar issues al project
- [ ] Asignar estados iniciales

**Paso 1: Crear/Verificar Milestone**
```bash
# Verificar si milestone existe (usar gh --jq en lugar de jq externo)
MILESTONE_NUMBER=$(gh api "repos/$OWNER/$REPO/milestones" --jq ".[] | select(.title==\"$MILESTONE_NAME\") | .number")

if [ -z "$MILESTONE_NUMBER" ]; then
  # Crear milestone si no existe
  gh api "repos/$OWNER/$REPO/milestones" \
    -f title="$MILESTONE_NAME" \
    -f description="$MILESTONE_DESCRIPTION" \
    -f due_on="${DUE_DATE}T23:59:59Z"
  echo "✅ Milestone '$MILESTONE_NAME' creado"
else
  echo "✅ Milestone '$MILESTONE_NAME' ya existe (#$MILESTONE_NUMBER)"
fi
```

**Paso 2: Crear Labels Faltantes**
```bash
# Para cada label en la lista de LABELS_TO_CREATE
for LABEL in "${LABELS_TO_CREATE[@]}"; do
  IFS='|' read -r name color description <<< "$LABEL"
  gh label create "$name" --color "$color" --description "$description" 2>/dev/null || echo "Label $name ya existe"
done
```

**Paso 3: Crear/Verificar Project**
```bash
# Verificar si project existe
PROJECT_NUMBER=$(gh project list --owner "$OWNER" | grep "$PROJECT_NAME" | awk '{print $1}' | head -1)

if [ -z "$PROJECT_NUMBER" ]; then
  # Crear project si no existe
  gh project create --title "$PROJECT_NAME" --owner "$OWNER"
  PROJECT_NUMBER=$(gh project list --owner "$OWNER" | grep "$PROJECT_NAME" | awk '{print $1}' | head -1)
  echo "✅ Project '$PROJECT_NAME' creado (#$PROJECT_NUMBER)"
else
  echo "✅ Project '$PROJECT_NAME' ya existe (#$PROJECT_NUMBER)"
fi
```

**Paso 4: Crear Issues**
```bash
# Para cada issue definido en el plan detallado
for ISSUE in "${ISSUES_ARRAY[@]}"; do
  IFS='|' read -r title labels body <<< "$ISSUE"
  
  ISSUE_URL=$(gh issue create \
    --title "$title" \
    --milestone "$MILESTONE_NAME" \
    --label "$labels" \
    --body "$body")
  
  echo "✅ Issue creado: $ISSUE_URL"
  ISSUE_URLS+=("$ISSUE_URL")
done
```

**Paso 5: Asociar Issues al Project**
```bash
# Para cada issue creado
for ISSUE_URL in "${ISSUE_URLS[@]}"; do
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL"
  echo "✅ Issue asociado al project: $ISSUE_URL"
done
```

**Paso 6: Asignar Estados Iniciales**
```bash
# Obtener Project ID completo (formato PVT_kwDO...)
PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.id')

# Obtener Field ID de Status - usar comando simplificado
STATUS_FIELD_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" | grep "Status.*ProjectV2SingleSelectField" | awk '{print $NF}')

# Obtener option ID para "Todo" - usar API GraphQL con gh --jq
TODO_OPTION_ID=$(gh api graphql -f query='{
  node(id: "'$STATUS_FIELD_ID'") {
    ... on ProjectV2SingleSelectField {
      options {
        id
        name
      }
    }
  }
}' --jq '.data.node.options[] | select(.name=="Todo") | .id')

# Obtener IDs de items del project (solo los nuevos issues)
ITEM_IDS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" | grep "Issue" | tail -n "${#ISSUE_URLS[@]}" | awk '{print $NF}')

# Asignar estado "Todo" a cada item nuevo
for ITEM_ID in $ITEM_IDS; do
  gh project item-edit \
    --project-id "$PROJECT_ID" \
    --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" \
    --single-select-option-id "$TODO_OPTION_ID"
  echo "✅ Estado 'Todo' asignado a item: $ITEM_ID"
done
```

### 4. Output Final (Solo Reporte)

```
✅ DEPLOYMENT COMPLETADO

📊 Resumen de Ejecución:
- Repositorio: $OWNER/$REPO
- Milestone: $MILESTONE_NAME (Due: $DUE_DATE)
- Project: $PROJECT_NAME (#$PROJECT_NUMBER)
- Labels creados: ${#LABELS_TO_CREATE[@]}
- Issues creados: ${#ISSUE_URLS[@]}
- Estados asignados: Todo

🔗 Enlaces Directos:
- Project Board: https://github.com/orgs/$OWNER/projects/$PROJECT_NUMBER
- Milestone: https://github.com/$OWNER/$REPO/milestone/$MILESTONE_NUMBER
- Issues creados:
$(printf "  - %s\n" "${ISSUE_URLS[@]}")

📋 Próximos Pasos:
1. Revisar issues en el project board
2. Mover issues a estados apropiados según progreso
3. Comenzar desarrollo siguiendo checklist de cada issue
```

### 5. Limpieza Automática
```bash
# Mover archivos temporales a carpeta de completados
mkdir -p .claude/completed
mv .claude/temp/$DETAILED_PLAN_FILE .claude/completed/
echo "✅ Archivos temporales organizados en .claude/completed/"
```

## Formato Esperado del Plan Detallado

El archivo detailed-plan debe contener variables claramente definidas:
```markdown
<!-- Variables de configuración -->
MILESTONE_NAME="Fase 1 - Validación Técnica"
MILESTONE_DESCRIPTION="Validar integraciones críticas"
DUE_DATE="2025-08-01"
PROJECT_NAME="Esencia Fest 2025"
LABELS_TO_CREATE=("infrastructure|1d76db|AWS, SAM" "frontend|0e8a16|Next.js, React")

<!-- Issues con formato específico -->
ISSUE_TITLE="Setup Canvas Responsive"
ISSUE_LABELS="frontend,critical"
ISSUE_BODY="[Checklist completo en markdown]"
```