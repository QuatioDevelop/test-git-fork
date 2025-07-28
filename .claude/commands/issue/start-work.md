---
description: Iniciar trabajo en un issue creando ramas y configurando el entorno
allowed-tools: [Read, Bash, Glob, TodoWrite]
---

# Start Work Issue

Iniciar trabajo en un issue específico: **$ARGUMENTS**

## Proceso:

### 1. Validar Entorno y Prerequisites

```bash
# Validar que existe el plan del issue
ISSUE_PLAN_FILE="$1"
if [ -z "$ISSUE_PLAN_FILE" ]; then
  echo "❌ Error: Debes especificar el archivo del plan del issue"
  echo "Uso: /start-work-issue issue-plan-123.md"
  exit 1
fi

PLAN_PATH=".claude/artifact-temp/$ISSUE_PLAN_FILE"
if [ ! -f "$PLAN_PATH" ]; then
  echo "❌ Error: Plan del issue no encontrado: $PLAN_PATH"
  echo "❗ IMPORTANTE: Los planes se buscan en .claude/artifact-temp/ del proyecto actual"
  echo "Ejecuta primero: /plan-issue [numero]"
  exit 1
fi

echo "✅ Plan encontrado: $PLAN_PATH"

# Extraer número del issue del nombre del archivo
ISSUE_NUMBER=$(echo "$ISSUE_PLAN_FILE" | grep -oE "[0-9]+" | head -1)
if [ -z "$ISSUE_NUMBER" ]; then
  echo "❌ Error: No se pudo extraer número del issue de: $ISSUE_PLAN_FILE"
  exit 1
fi

echo "🎯 Issue detectado: #$ISSUE_NUMBER"
```

### 2. Validar Estado Actual del Workspace

```bash
# Verificar que workspace está limpio
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Error: Workspace tiene cambios uncommitted"
  echo "Haz commit o stash de tus cambios antes de continuar"
  git status --short
  exit 1
fi

# Obtener branch actual y base
CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

echo "📂 Branch actual: $CURRENT_BRANCH"
echo "📂 Base branch: $BASE_BRANCH"

# Verificar que estamos en base branch o que podemos hacer switch seguro
if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
  echo "⚠️  No estás en $BASE_BRANCH. Cambiando automáticamente..."
  git checkout "$BASE_BRANCH" || {
    echo "❌ Error: No se pudo cambiar a $BASE_BRANCH"
    exit 1
  }
fi

# Pull latest changes
echo "🔄 Actualizando $BASE_BRANCH..."
git pull origin "$BASE_BRANCH" || {
  echo "❌ Error: No se pudo actualizar $BASE_BRANCH"
  exit 1
}

echo "✅ Workspace validado y actualizado"
```

### 3. Leer y Parsear Estrategia del Plan

```bash
echo "📋 Leyendo estrategia del plan..."

# Crear directorio temporal para variables persistentes
mkdir -p .claude/temp

# Leer el plan completo
PLAN_CONTENT=$(cat "$PLAN_PATH")

# Extraer nombre de rama recomendado del plan
BRANCH_NAME=$(echo "$PLAN_CONTENT" | grep -oE "feature/issue-[0-9]+-[a-zA-Z0-9-]+" | head -1)
if [ -z "$BRANCH_NAME" ]; then
  # Fallback: generar nombre estándar usando alternativa a jq
  if command -v jq >/dev/null 2>&1; then
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title' 2>/dev/null)
  else
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title 2>/dev/null | grep '"title"' | sed 's/.*"title": *"\([^"]*\)".*/\1/')
  fi
  
  if [ ! -z "$ISSUE_TITLE" ]; then
    BRANCH_SUFFIX=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-30)
    BRANCH_NAME="feature/issue-$ISSUE_NUMBER-$BRANCH_SUFFIX"
  else
    BRANCH_NAME="feature/issue-$ISSUE_NUMBER"
  fi
fi

echo "🌿 Nombre de rama: $BRANCH_NAME"

# Guardar variables en archivo temporal para persistencia
cat > .claude/temp/vars.env << 'EOF'
ISSUE_NUMBER="$ISSUE_NUMBER"
BRANCH_NAME="$BRANCH_NAME"
BASE_BRANCH="$BASE_BRANCH"
PLAN_PATH="$PLAN_PATH"
ISSUE_PLAN_FILE="$ISSUE_PLAN_FILE"
EOF

# Verificar si necesita subramas (solo si el plan lo especifica explícitamente)
NEEDS_SUBBRANCHES=$(echo "$PLAN_CONTENT" | grep -i -c "subrama\|sub-rama\|subbranch\|sub-branch" || echo "0")
CREATE_SUBISSUES=$(echo "$PLAN_CONTENT" | grep -i -c "sub-issue\|subissue\|dividir.*issue\|crear.*issue" || echo "0")

if [ "$NEEDS_SUBBRANCHES" -gt 0 ]; then
  echo "🔀 Plan requiere subramas - se configurarán después"
fi

if [ "$CREATE_SUBISSUES" -gt 0 ]; then
  echo "📋 Plan requiere sub-issues - se crearán después"
fi

# Verificar si necesita version bump
NEEDS_VERSION_BUMP=$(echo "$PLAN_CONTENT" | grep -i -c "version\|bump\|package\.json" || echo "0")
```

### 4. Validar que la Rama No Existe

```bash
echo "🔍 Validando que la rama no existe..."

# Verificar localmente
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "❌ Error: La rama '$BRANCH_NAME' ya existe localmente"
  echo "Ramas existentes para este issue:"
  git branch --list "*issue-$ISSUE_NUMBER*"
  exit 1
fi

# Verificar remotamente
if git ls-remote --exit-code --heads origin "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "❌ Error: La rama '$BRANCH_NAME' ya existe en el remoto"
  exit 1
fi

echo "✅ Rama '$BRANCH_NAME' disponible"
```

### 5. Verificar Estado del Issue en GitHub

```bash
echo "🔍 Verificando estado del issue #$ISSUE_NUMBER en GitHub..."

# Obtener estado actual del issue
ISSUE_INFO=$(gh issue view "$ISSUE_NUMBER" --json state,assignees,labels,title 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "❌ Error: No se pudo acceder al issue #$ISSUE_NUMBER"
  exit 1
fi

# Extraer información usando alternativa a jq si no está disponible
if command -v jq >/dev/null 2>&1; then
  ISSUE_STATE=$(echo "$ISSUE_INFO" | jq -r '.state')
  ISSUE_TITLE=$(echo "$ISSUE_INFO" | jq -r '.title')
  CURRENT_ASSIGNEES=$(echo "$ISSUE_INFO" | jq -r '.assignees[].login' | tr '\n' ',' | sed 's/,$//')
else
  ISSUE_STATE=$(echo "$ISSUE_INFO" | grep '"state"' | sed 's/.*"state": *"\([^"]*\)".*/\1/')
  ISSUE_TITLE=$(echo "$ISSUE_INFO" | grep '"title"' | sed 's/.*"title": *"\([^"]*\)".*/\1/')
  CURRENT_ASSIGNEES=$(echo "$ISSUE_INFO" | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/' | tr '\n' ',' | sed 's/,$//')
fi

echo "📋 Issue: $ISSUE_TITLE"
echo "📊 Estado actual: $ISSUE_STATE"

if [ "$ISSUE_STATE" != "open" ]; then
  echo "⚠️  Issue #$ISSUE_NUMBER no está abierto (estado: $ISSUE_STATE)"
  read -p "¿Continuar de todas formas? (y/N): " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    echo "❌ Operación cancelada"
    exit 1
  fi
fi

# Verificar si ya está asignado a alguien más
if [ ! -z "$CURRENT_ASSIGNEES" ]; then
  if command -v jq >/dev/null 2>&1; then
    CURRENT_USER=$(gh api user --jq '.login')
  else
    CURRENT_USER=$(gh api user | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/')
  fi
  
  if [ "$CURRENT_ASSIGNEES" != "$CURRENT_USER" ]; then
    echo "⚠️  Issue ya está asignado a: $CURRENT_ASSIGNEES"
    read -p "¿Continuar y reasignar? (y/N): " REASSIGN
    if [ "$REASSIGN" != "y" ] && [ "$REASSIGN" != "Y" ]; then
      echo "❌ Operación cancelada"
      exit 1
    fi
  fi
fi

echo "✅ Issue validado"
```

### 6. Crear TodoWrite para Tracking

```bash
echo "📝 Creando todo list para tracking..."
```

**Crear TodoWrite:**
- [ ] Crear rama principal para el issue
- [ ] Configurar tracking issue-rama
- [ ] Actualizar versión si es necesario
- [ ] Asignar issue y marcar como "In Progress"
- [ ] Crear sub-issues si el plan lo especifica
- [ ] Configurar subramas si el plan lo requiere

### 7. Crear Rama Principal (Con Linking Automático)

```bash
echo "🌿 Creando rama: $BRANCH_NAME"

# Estrategia 1: Intentar gh issue develop (rama vinculada automáticamente)
echo "🔗 Intentando crear rama vinculada automáticamente..."
LINKED_BRANCH_CREATED=false

if gh issue develop "$ISSUE_NUMBER" --name "$BRANCH_NAME" --checkout 2>/dev/null; then
  echo "✅ Rama '$BRANCH_NAME' creada y vinculada automáticamente con gh issue develop"
  LINKED_BRANCH_CREATED=true
else
  echo "⚠️  gh issue develop falló, usando método tradicional..."
  
  # Estrategia 2: Fallback con git checkout -b (método tradicional)
  git checkout -b "$BRANCH_NAME" || {
    echo "❌ Error: No se pudo crear la rama $BRANCH_NAME"
    exit 1
  }
  
  echo "✅ Rama '$BRANCH_NAME' creada con método tradicional"
fi

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  echo "❌ Error: No se pudo cambiar a la rama $BRANCH_NAME"
  exit 1
fi

echo "✅ Rama '$BRANCH_NAME' activada correctamente"
```

### 8. Configurar Tracking y Verificar Linking Issue-Rama

```bash
echo "🔗 Configurando tracking issue-rama..."

# Configurar upstream tracking (push de la rama si no fue creada con gh issue develop)
if [ "$LINKED_BRANCH_CREATED" = false ]; then
  git push -u origin "$BRANCH_NAME" || {
    echo "❌ Error: No se pudo hacer push inicial de la rama"
    exit 1
  }
  echo "✅ Rama '$BRANCH_NAME' pushed y configurada para tracking"
else
  echo "✅ Rama ya configurada automáticamente con gh issue develop"
fi

# Verificar estado del linking con GitHub API
echo "🔍 Verificando linking automático issue-rama..."
sleep 2  # Dar tiempo para que GitHub sincronice

# Obtener owner y repo dinámicamente usando alternativa a jq
if command -v jq >/dev/null 2>&1; then
  REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
  REPO_NAME=$(gh repo view --json name --jq '.name')
else
  REPO_OWNER=$(gh repo view --json owner | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/')
  REPO_NAME=$(gh repo view --json name | grep '"name"' | sed 's/.*"name": *"\([^"]*\)".*/\1/')
fi

LINKED_BRANCHES=$(gh api graphql -f query='query { repository(owner: "'$REPO_OWNER'", name: "'$REPO_NAME'") { issue(number: '$ISSUE_NUMBER') { linkedBranches(first: 10) { nodes { ref { name } } } } } }' --jq '.data.repository.issue.linkedBranches.nodes[].ref.name' 2>/dev/null || echo "")

BRANCH_IS_LINKED=false
if echo "$LINKED_BRANCHES" | grep -q "^$BRANCH_NAME$"; then
  echo "✅ Rama '$BRANCH_NAME' está vinculada correctamente al issue #$ISSUE_NUMBER"
  BRANCH_IS_LINKED=true
else
  echo "⚠️  Rama '$BRANCH_NAME' NO está vinculada automáticamente al issue #$ISSUE_NUMBER"
  echo "💡 Se vinculará automáticamente al crear el PR"
fi

# Crear metadata para linking usando formato más robusto
mkdir -p .claude/temp

# Crear JSON de forma más segura (evita problemas con heredoc)
echo "{" > .claude/temp/current-work.json
echo "  \"issue_number\": \"$ISSUE_NUMBER\"," >> .claude/temp/current-work.json
echo "  \"issue_title\": \"$ISSUE_TITLE\"," >> .claude/temp/current-work.json
echo "  \"branch_name\": \"$BRANCH_NAME\"," >> .claude/temp/current-work.json
echo "  \"base_branch\": \"$BASE_BRANCH\"," >> .claude/temp/current-work.json
echo "  \"started_at\": \"$(date -Iseconds)\"," >> .claude/temp/current-work.json
echo "  \"plan_file\": \"$ISSUE_PLAN_FILE\"," >> .claude/temp/current-work.json
echo "  \"needs_subbranches\": $NEEDS_SUBBRANCHES," >> .claude/temp/current-work.json
echo "  \"create_subissues\": $CREATE_SUBISSUES," >> .claude/temp/current-work.json
echo "  \"needs_version_bump\": $NEEDS_VERSION_BUMP," >> .claude/temp/current-work.json
echo "  \"linked_branch_created\": $LINKED_BRANCH_CREATED," >> .claude/temp/current-work.json
echo "  \"branch_is_linked\": $BRANCH_IS_LINKED" >> .claude/temp/current-work.json
echo "}" >> .claude/temp/current-work.json

echo "✅ Metadata de trabajo guardada en .claude/temp/current-work.json"
```

### 9. Version Bump (Solo si el Plan lo Especifica)

```bash
if [ "$NEEDS_VERSION_BUMP" -gt 0 ]; then
  echo "📦 Actualizando versión según plan..."
  
  # Buscar package.json en el proyecto
  if [ -f "package.json" ]; then
    # Obtener versión actual usando alternativa a jq
    if command -v jq >/dev/null 2>&1; then
      CURRENT_VERSION=$(jq -r '.version' package.json)
    else
      CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
    fi
    echo "📦 Versión actual: $CURRENT_VERSION"
    
    # Hacer bump incremental para desarrollo (patch)
    npm version patch --no-git-tag-version || {
      echo "⚠️  No se pudo hacer version bump automático"
    }
    
    # Obtener nueva versión usando alternativa a jq
    if command -v jq >/dev/null 2>&1; then
      NEW_VERSION=$(jq -r '.version' package.json)
    else
      NEW_VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
    fi
    echo "📦 Nueva versión: $NEW_VERSION"
    
    # Commit del version bump
    git add package.json package-lock.json 2>/dev/null
    git commit -m "chore: bump version to $NEW_VERSION for issue #$ISSUE_NUMBER development" || true
    
    echo "✅ Version bump completado"
  else
    echo "⚠️  package.json no encontrado - saltando version bump"
  fi
else
  echo "📦 Plan no requiere version bump - saltando"
fi
```

### 10. Asignar Issue y Marcar como "In Progress"

```bash
echo "👤 Asignando issue y actualizando estado..."

# Obtener usuario actual usando alternativa a jq
if command -v jq >/dev/null 2>&1; then
  CURRENT_USER=$(gh api user --jq '.login')
else
  CURRENT_USER=$(gh api user | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/')
fi

# Asignar issue al usuario actual (usar flag correcto)
gh issue edit "$ISSUE_NUMBER" --add-assignee "@me" || {
  echo "⚠️  No se pudo asignar el issue automáticamente"
}

# ===== NUEVO: CAMBIAR STATUS EN PROJECT A "IN PROGRESS" =====
echo "📊 Cambiando status del project a 'In Progress'..."

# Obtener información del repositorio
if command -v jq >/dev/null 2>&1; then
  REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
  REPO_NAME=$(gh repo view --json name --jq '.name')
else
  REPO_OWNER=$(gh repo view --json owner | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/')
  REPO_NAME=$(gh repo view --json name | grep '"name"' | sed 's/.*"name": *"\([^"]*\)".*/\1/')
fi

# Buscar projects del owner
echo "🔍 Buscando projects disponibles..."
PROJECT_LIST=$(gh project list --owner "$REPO_OWNER" --format json 2>/dev/null)

if [ ! -z "$PROJECT_LIST" ]; then
  # Buscar project "Esencia Fest 2025" o usar el primer project activo
  if command -v jq >/dev/null 2>&1; then
    PROJECT_NUMBER=$(echo "$PROJECT_LIST" | jq -r '.projects[] | select(.title | test("Esencia Fest|esencia|fest"; "i")) | .number' | head -1)
    if [ -z "$PROJECT_NUMBER" ]; then
      PROJECT_NUMBER=$(echo "$PROJECT_LIST" | jq -r '.projects[0].number')
    fi
  else
    PROJECT_NUMBER=$(echo "$PROJECT_LIST" | grep -i -A5 -B5 "esencia\|fest" | grep '"number"' | head -1 | sed 's/.*"number": *\([0-9]*\).*/\1/')
    if [ -z "$PROJECT_NUMBER" ]; then
      PROJECT_NUMBER=$(echo "$PROJECT_LIST" | grep '"number"' | head -1 | sed 's/.*"number": *\([0-9]*\).*/\1/')
    fi
  fi
  
  if [ ! -z "$PROJECT_NUMBER" ]; then
    echo "📋 Project encontrado: #$PROJECT_NUMBER"
    
    # Obtener información del project y campos
    PROJECT_FIELDS=$(gh api graphql -f query='
    query {
      organization(login: "'$REPO_OWNER'") {
        projectV2(number: '$PROJECT_NUMBER') {
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
    }' 2>/dev/null)
    
    if [ ! -z "$PROJECT_FIELDS" ]; then
      # Extraer ID del project y del campo Status
      if command -v jq >/dev/null 2>&1; then
        PROJECT_ID=$(echo "$PROJECT_FIELDS" | jq -r '.data.organization.projectV2.id')
        STATUS_FIELD_ID=$(echo "$PROJECT_FIELDS" | jq -r '.data.organization.projectV2.fields.nodes[] | select(.name == "Status") | .id')
        IN_PROGRESS_OPTION_ID=$(echo "$PROJECT_FIELDS" | jq -r '.data.organization.projectV2.fields.nodes[] | select(.name == "Status") | .options[] | select(.name == "In Progress") | .id')
      else
        PROJECT_ID=$(echo "$PROJECT_FIELDS" | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
        STATUS_FIELD_ID=$(echo "$PROJECT_FIELDS" | grep -A20 '"name": *"Status"' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
        IN_PROGRESS_OPTION_ID=$(echo "$PROJECT_FIELDS" | grep -A50 '"name": *"Status"' | grep -A5 '"name": *"In Progress"' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
      fi
      
      if [ ! -z "$PROJECT_ID" ] && [ ! -z "$STATUS_FIELD_ID" ] && [ ! -z "$IN_PROGRESS_OPTION_ID" ]; then
        echo "🔧 IDs encontrados - Project: $PROJECT_ID, Status Field: $STATUS_FIELD_ID, In Progress: $IN_PROGRESS_OPTION_ID"
        
        # Buscar el item del issue en el project
        PROJECT_ITEMS=$(gh api graphql -f query='
        query {
          organization(login: "'$REPO_OWNER'") {
            projectV2(number: '$PROJECT_NUMBER') {
              items(first: 100) {
                nodes {
                  id
                  content {
                    ... on Issue {
                      number
                    }
                  }
                }
              }
            }
          }
        }' 2>/dev/null)
        
        if [ ! -z "$PROJECT_ITEMS" ]; then
          if command -v jq >/dev/null 2>&1; then
            ITEM_ID=$(echo "$PROJECT_ITEMS" | jq -r '.data.organization.projectV2.items.nodes[] | select(.content.number == '$ISSUE_NUMBER') | .id')
          else
            # Buscar el item ID para el issue específico (más complejo sin jq)
            ITEM_ID=$(echo "$PROJECT_ITEMS" | grep -B3 -A1 '"number": *'$ISSUE_NUMBER',' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
          fi
          
          if [ ! -z "$ITEM_ID" ]; then
            echo "🎯 Item encontrado: $ITEM_ID"
            
            # Cambiar status a "In Progress"
            RESULT=$(gh project item-edit \
              --project-id "$PROJECT_ID" \
              --id "$ITEM_ID" \
              --field-id "$STATUS_FIELD_ID" \
              --single-select-option-id "$IN_PROGRESS_OPTION_ID" 2>/dev/null)
            
            if [ $? -eq 0 ]; then
              echo "✅ Status cambiado a 'In Progress' en project #$PROJECT_NUMBER"
              
              # Verificar el cambio
              sleep 1
              VERIFICATION=$(gh issue view "$ISSUE_NUMBER" --json projectItems 2>/dev/null)
              if echo "$VERIFICATION" | grep -q "In Progress"; then
                echo "✅ Verificación: Status actualizado correctamente"
              else
                echo "⚠️  Verificación: Status podría no haberse actualizado"
              fi
            else
              echo "⚠️  No se pudo cambiar el status en el project"
            fi
          else
            echo "⚠️  No se encontró el issue #$ISSUE_NUMBER en el project #$PROJECT_NUMBER"
          fi
        else
          echo "⚠️  No se pudieron obtener los items del project"
        fi
      else
        echo "⚠️  No se encontraron los IDs necesarios para cambiar el status"
        echo "    Project ID: $PROJECT_ID"
        echo "    Status Field ID: $STATUS_FIELD_ID" 
        echo "    In Progress Option ID: $IN_PROGRESS_OPTION_ID"
      fi
    else
      echo "⚠️  No se pudo obtener información de campos del project"
    fi
  else
    echo "⚠️  No se encontró un project válido"
  fi
else
  echo "⚠️  No se encontraron projects para el owner $REPO_OWNER"
fi

# ===== FIN NUEVO: CAMBIAR STATUS EN PROJECT =====

# Verificar qué labels existen antes de intentar agregar
echo "🔍 Verificando labels disponibles..."
AVAILABLE_LABELS=$(gh label list --limit 100 | grep -E '(progress|work|dev)' | head -5)
if [ ! -z "$AVAILABLE_LABELS" ]; then
  echo "📋 Labels relacionados encontrados:"
  echo "$AVAILABLE_LABELS"
fi

# Intentar agregar label "in-progress" o similar
if gh label list | grep -q "in-progress"; then
  gh issue edit "$ISSUE_NUMBER" --add-label "in-progress"
  echo "✅ Label 'in-progress' agregado"
elif gh label list | grep -q "work"; then
  gh issue edit "$ISSUE_NUMBER" --add-label "work"
  echo "✅ Label 'work' agregado como alternativa"
else
  echo "⚠️  No se encontraron labels apropiados para marcar como 'en progreso'"
fi

# Comentar en el issue con información de la rama
gh issue comment "$ISSUE_NUMBER" --body "🚀 **Trabajo iniciado**

- **Rama**: \`$BRANCH_NAME\`
- **Iniciado por**: @$CURRENT_USER
- **Plan**: $ISSUE_PLAN_FILE

El desarrollo está en progreso. Los commits se pueden seguir en la rama [\`$BRANCH_NAME\`](../compare/$BASE_BRANCH...$BRANCH_NAME)." || {
  echo "⚠️  No se pudo comentar en el issue"
}

echo "✅ Issue #$ISSUE_NUMBER asignado y marcado como In Progress (labels + project status)"
```

### 11. Crear Sub-issues (Solo si el Plan lo Especifica)

```bash
if [ "$CREATE_SUBISSUES" -gt 0 ]; then
  echo "📋 Creando sub-issues según plan..."
  
  # Extraer sub-issues del plan (buscar patrones específicos)
  SUBISSUE_TITLES=$(echo "$PLAN_CONTENT" | grep -E "^\s*-\s.*\b(issue|tarea|task)\b" | sed 's/^\s*-\s*//' | head -5)
  
  if [ ! -z "$SUBISSUE_TITLES" ]; then
    SUBISSUE_COUNT=0
    echo "$SUBISSUE_TITLES" | while IFS= read -r SUBISSUE_TITLE; do
      if [ ! -z "$SUBISSUE_TITLE" ]; then
        SUBISSUE_COUNT=$((SUBISSUE_COUNT + 1))
        echo "  📋 Creando sub-issue: $SUBISSUE_TITLE"
        
        SUBISSUE_BODY="Sub-issue derivado de #$ISSUE_NUMBER

**Contexto**: Este es un sub-issue creado automáticamente para organizar el trabajo del issue principal.

**Issue padre**: #$ISSUE_NUMBER  
**Rama padre**: \`$BRANCH_NAME\`

**Descripción**: $SUBISSUE_TITLE"

        # Crear el sub-issue
        NEW_SUBISSUE=$(gh issue create --title "[$ISSUE_NUMBER] $SUBISSUE_TITLE" --body "$SUBISSUE_BODY" --label "sub-issue" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
          SUBISSUE_NUMBER=$(echo "$NEW_SUBISSUE" | grep -oE "[0-9]+$")
          echo "    ✅ Sub-issue #$SUBISSUE_NUMBER creado"
          
          # Comentar en el issue padre
          gh issue comment "$ISSUE_NUMBER" --body "📋 Sub-issue creado: #$SUBISSUE_NUMBER - $SUBISSUE_TITLE" 2>/dev/null
        else
          echo "    ⚠️  No se pudo crear sub-issue: $SUBISSUE_TITLE"
        fi
      fi
    done
    
    echo "✅ Sub-issues procesados"
  else
    echo "⚠️  No se encontraron sub-issues específicos en el plan"
  fi
else
  echo "📋 Plan no requiere sub-issues - saltando"
fi
```

### 12. Configurar Subramas (Solo si el Plan lo Requiere)

```bash
if [ "$NEEDS_SUBBRANCHES" -gt 0 ]; then
  echo "🔀 Configurando subramas según plan..."
  
  # Extraer nombres de subramas del plan
  SUBBRANCH_NAMES=$(echo "$PLAN_CONTENT" | grep -oE "feature/[a-zA-Z0-9-]*" | grep -v "$BRANCH_NAME" | head -3)
  
  if [ ! -z "$SUBBRANCH_NAMES" ]; then
    echo "$SUBBRANCH_NAMES" | while IFS= read -r SUBBRANCH_NAME; do
      if [ ! -z "$SUBBRANCH_NAME" ]; then
        echo "  🔀 Preparando subbranch: $SUBBRANCH_NAME"
        
        # Verificar que no existe
        if ! git show-ref --verify --quiet "refs/heads/$SUBBRANCH_NAME"; then
          # Crear rama pero no cambiar a ella
          git branch "$SUBBRANCH_NAME" || {
            echo "    ⚠️  No se pudo crear subbranch: $SUBBRANCH_NAME"
            continue
          }
          
          # Push subbranch
          git push -u origin "$SUBBRANCH_NAME" || {
            echo "    ⚠️  No se pudo hacer push de subbranch: $SUBBRANCH_NAME"
          }
          
          echo "    ✅ Subbranch '$SUBBRANCH_NAME' creada"
        else
          echo "    ⚠️  Subbranch '$SUBBRANCH_NAME' ya existe"
        fi
      fi
    done
    
    # Volver a la rama principal
    git checkout "$BRANCH_NAME"
    
    echo "✅ Subramas configuradas"
  else
    echo "⚠️  No se encontraron subramas específicas en el plan"
  fi
else
  echo "🔀 Plan no requiere subramas - saltando"
fi
```

### 13. Output Final y Preparación

```bash
echo ""
echo "🎉 WORK INICIADO EXITOSAMENTE"
echo ""
echo "📊 Resumen:"
echo "- Issue: #$ISSUE_NUMBER - $ISSUE_TITLE"
echo "- Rama activa: $BRANCH_NAME"
echo "- Base branch: $BASE_BRANCH"
echo "- Estado: In Progress"
echo "- Asignado a: $CURRENT_USER"

# Verificar y reportar status del project
PROJECT_STATUS_CHECK=$(gh issue view "$ISSUE_NUMBER" --json projectItems 2>/dev/null)
if echo "$PROJECT_STATUS_CHECK" | grep -q "In Progress"; then
  echo "- Project Status: ✅ In Progress"
else
  echo "- Project Status: ⚠️  Verificar manualmente"
fi

# Reporte de linking
if [ "$LINKED_BRANCH_CREATED" = true ]; then
  echo "- Linking: ✅ Rama creada con gh issue develop"
elif [ "$BRANCH_IS_LINKED" = true ]; then
  echo "- Linking: ✅ Rama vinculada automáticamente"
else
  echo "- Linking: ⚠️  Vinculación manual necesaria (se hará automáticamente en PR)"
fi

if [ "$NEEDS_VERSION_BUMP" -gt 0 ]; then
  if command -v jq >/dev/null 2>&1; then
    echo "- Versión: $(jq -r '.version' package.json 2>/dev/null || echo 'N/A')"
  else
    VERSION=$(grep '"version"' package.json 2>/dev/null | sed 's/.*"version": *"\([^"]*\)".*/\1/' || echo 'N/A')
    echo "- Versión: $VERSION"
  fi
fi
if [ "$CREATE_SUBISSUES" -gt 0 ]; then
  echo "- Sub-issues: Creados según plan"
fi
if [ "$NEEDS_SUBBRANCHES" -gt 0 ]; then
  echo "- Subramas: Configuradas según plan"
fi
echo ""
echo "🔄 Siguiente en el flujo:"
echo "  1. ✅ Rama y tracking configurados"
echo "  2. 🔨 [TÚ] Implementar la solución"
echo "  3. 📤 /submit-work-issue (cuando termines)"
echo "  4. ✅ /validate-pr (antes del merge)"
echo ""
echo "📂 Workspace listo para desarrollo en: $BRANCH_NAME"
echo "📋 Metadata guardada en: .claude/temp/current-work.json"
echo ""

# Marcar todo como completado en TodoWrite
echo "✅ Todas las validaciones y configuraciones completadas"
```

## Características

- **Validación exhaustiva**: Verifica workspace, plan, ramas existentes y estado del issue
- **Creación inteligente**: Solo crea subramas y sub-issues si el plan lo especifica explícitamente
- **Linking robusto**: Intenta `gh issue develop` primero, fallback a método tradicional + verificación API
- **Verificación real**: Confirma con GraphQL API si la rama quedó vinculada al issue
- **Estado sincronizado completo**: Asigna, marca como "In Progress" en labels Y project status, comenta en GitHub
- **Project Management automatizado**: Detecta automáticamente el project correcto y cambia status de "Backlog" a "In Progress"
- **Transparencia total**: Reporta claramente el estado del linking y project status (exitoso/manual/verificar)
- **Seguridad**: Múltiples validaciones antes de cualquier operación destructiva
- **Tracking completo**: Metadata para que submit-work-issue funcione correctamente
- **Suporte a planes complejos**: Maneja sub-issues y subramas cuando es necesario
- **Fallback inteligente**: Si no encuentra el project "Esencia Fest", usa el primer project disponible
- **Verificación post-cambio**: Confirma que el status del project se actualizó correctamente

## Flujo de Integración

```
/plan-issue 123 → /start-work-issue issue-plan-123.md → [IMPLEMENTACIÓN] → /submit-work-issue → /validate-pr
```

## Validaciones Críticas Implementadas

- ✅ **Plan existe y es válido**
- ✅ **Workspace limpio** (no cambios uncommitted)
- ✅ **Rama no existe** (local ni remoto)
- ✅ **Issue accesible** en GitHub
- ✅ **Base branch actualizado**
- ✅ **Sub-items condicionales** (solo si plan los especifica)
- ✅ **Linking issue-rama** correcto
- ✅ **Estado GitHub** sincronizado

**IMPORTANTE**: Este comando prepara completamente el entorno para desarrollo y configura el tracking necesario para el resto del flujo automatizado.