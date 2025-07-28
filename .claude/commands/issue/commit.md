---
description: Crear commit inteligente basado en cambios realizados y contexto del issue
allowed-tools: [Read, Bash, Glob]
---

# Issue Commit

Crear commit inteligente analizando cambios y contexto: **$ARGUMENTS**

## Proceso:

### 1. Analizar Estado del Repositorio

```bash
echo "🔍 Analizando estado del repositorio..."

# Verificar que hay cambios para commitear
if git diff --quiet && git diff --cached --quiet; then
  echo "❌ No hay cambios para commitear"
  echo "Estado actual:"
  git status --short
  exit 1
fi

# Obtener información básica
CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

echo "📂 Rama actual: $CURRENT_BRANCH"
echo "📂 Base branch: $BASE_BRANCH"

# Verificar si estamos en una rama de trabajo
if [ "$CURRENT_BRANCH" = "$BASE_BRANCH" ]; then
  echo "⚠️  Estás en $BASE_BRANCH - considera crear una rama de trabajo"
fi
```

### 2. Extraer Contexto del Issue

```bash
echo "🎯 Extrayendo contexto del issue..."

# Intentar leer metadata de trabajo actual
ISSUE_NUMBER=""
ISSUE_TITLE=""
BRANCH_TYPE=""

if [ -f ".claude/temp/current-work.json" ]; then
  ISSUE_NUMBER=$(jq -r '.issue_number // empty' .claude/temp/current-work.json 2>/dev/null)
  ISSUE_TITLE=$(jq -r '.issue_title // empty' .claude/temp/current-work.json 2>/dev/null)
  echo "✅ Metadata encontrada: Issue #$ISSUE_NUMBER"
  echo "📋 Título: $ISSUE_TITLE"
else
  echo "⚠️  No se encontró metadata de trabajo actual"
  
  # Intentar extraer número de issue de la rama
  ISSUE_NUMBER=$(echo "$CURRENT_BRANCH" | grep -oE "issue-[0-9]+" | grep -oE "[0-9]+" | head -1)
  
  if [ ! -z "$ISSUE_NUMBER" ]; then
    echo "🔍 Issue detectado de la rama: #$ISSUE_NUMBER"
    
    # Obtener título del issue desde GitHub
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title' 2>/dev/null)
    if [ $? -eq 0 ] && [ ! -z "$ISSUE_TITLE" ]; then
      echo "📋 Título obtenido: $ISSUE_TITLE"
    else
      echo "⚠️  No se pudo obtener título del issue"
      ISSUE_TITLE=""
    fi
  else
    echo "⚠️  No se detectó número de issue en la rama"
  fi
fi

# Determinar tipo de rama
if echo "$CURRENT_BRANCH" | grep -q "^feature/"; then
  BRANCH_TYPE="feature"
elif echo "$CURRENT_BRANCH" | grep -q "^fix/\|^bugfix/"; then
  BRANCH_TYPE="fix"
elif echo "$CURRENT_BRANCH" | grep -q "^hotfix/"; then
  BRANCH_TYPE="hotfix"
elif echo "$CURRENT_BRANCH" | grep -q "^docs/"; then
  BRANCH_TYPE="docs"
elif echo "$CURRENT_BRANCH" | grep -q "^refactor/"; then
  BRANCH_TYPE="refactor"
elif echo "$CURRENT_BRANCH" | grep -q "^test/"; then
  BRANCH_TYPE="test"
elif echo "$CURRENT_BRANCH" | grep -q "^chore/"; then
  BRANCH_TYPE="chore"
else
  BRANCH_TYPE="feature"  # default
fi

echo "🏷️  Tipo de rama detectado: $BRANCH_TYPE"
```

### 3. Analizar Cambios Realizados

```bash
echo "📊 Analizando cambios realizados..."

# Obtener archivos modificados (staged y unstaged)
STAGED_FILES=$(git diff --cached --name-only)
UNSTAGED_FILES=$(git diff --name-only)

echo "📁 Archivos staged:"
if [ ! -z "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | sed 's/^/  - /'
else
  echo "  (ninguno)"
fi

echo "📁 Archivos unstaged:"
if [ ! -z "$UNSTAGED_FILES" ]; then
  echo "$UNSTAGED_FILES" | sed 's/^/  - /'
else
  echo "  (ninguno)"
fi

# Si hay archivos unstaged, preguntar si agregarlos
if [ ! -z "$UNSTAGED_FILES" ]; then
  echo ""
  echo "❓ Archivos unstaged detectados. ¿Agregarlos al commit?"
  
  # Si se proporcionó un argumento específico, usarlo
  COMMIT_MESSAGE_ARG="$1"
  if [ ! -z "$COMMIT_MESSAGE_ARG" ]; then
    echo "📝 Mensaje personalizado detectado, agregando todos los archivos..."
    git add -A
  else
    # Modo interactivo simple
    echo "   [y] Agregar todos"
    echo "   [s] Solo archivos staged actuales"
    echo "   [q] Cancelar"
    read -p "Selección [y/s/q]: " ADD_CHOICE
    
    case "$ADD_CHOICE" in
      y|Y|yes)
        echo "➕ Agregando todos los archivos..."
        git add -A
        ;;
      s|S|staged)
        echo "📋 Usando solo archivos staged"
        ;;
      q|Q|quit)
        echo "❌ Operación cancelada"
        exit 0
        ;;
      *)
        echo "📋 Usando solo archivos staged (default)"
        ;;
    esac
  fi
fi

# Obtener lista final de archivos a commitear
FINAL_FILES=$(git diff --cached --name-only)
if [ -z "$FINAL_FILES" ]; then
  echo "❌ No hay archivos staged para commitear"
  exit 1
fi

echo ""
echo "✅ Archivos que se van a commitear:"
echo "$FINAL_FILES" | sed 's/^/  - /'
```

### 4. Clasificar Tipo de Cambios

```bash
echo ""
echo "🔍 Clasificando tipo de cambios..."

# Analizar tipos de archivos modificados
HAS_CODE_CHANGES=$(echo "$FINAL_FILES" | grep -E "\.(js|ts|jsx|tsx|py|java|go|rs|php|rb|c|cpp|h|hpp)$" | wc -l)
HAS_CONFIG_CHANGES=$(echo "$FINAL_FILES" | grep -E "\.(json|yaml|yml|toml|ini|conf|config)$" | wc -l)
HAS_DOC_CHANGES=$(echo "$FINAL_FILES" | grep -E "\.(md|txt|rst|adoc)$" | wc -l)
HAS_STYLE_CHANGES=$(echo "$FINAL_FILES" | grep -E "\.(css|scss|sass|less|styl)$" | wc -l)
HAS_TEST_CHANGES=$(echo "$FINAL_FILES" | grep -E "(test|spec)\.(js|ts|jsx|tsx|py)$|__tests__/" | wc -l)
HAS_INFRA_CHANGES=$(echo "$FINAL_FILES" | grep -E "docker|terraform|\.tf$|\.yml$|\.yaml$|infrastructure|iac/" | wc -l)

# Determinar tipo principal de cambio
CHANGE_TYPE=""
CHANGE_SCOPE=""

if [ "$HAS_TEST_CHANGES" -gt 0 ]; then
  CHANGE_TYPE="test"
  CHANGE_SCOPE="testing"
elif [ "$HAS_DOC_CHANGES" -gt 0 ] && [ "$HAS_CODE_CHANGES" -eq 0 ]; then
  CHANGE_TYPE="docs"
  CHANGE_SCOPE="documentation"
elif [ "$HAS_INFRA_CHANGES" -gt 0 ]; then
  CHANGE_TYPE="infra"
  CHANGE_SCOPE="infrastructure"
elif [ "$HAS_CONFIG_CHANGES" -gt 0 ] && [ "$HAS_CODE_CHANGES" -eq 0 ]; then
  CHANGE_TYPE="config"
  CHANGE_SCOPE="configuration"
elif [ "$HAS_STYLE_CHANGES" -gt 0 ]; then
  CHANGE_TYPE="style"
  CHANGE_SCOPE="styling"
else
  CHANGE_TYPE="$BRANCH_TYPE"
  
  # Determinar scope basado en archivos
  if echo "$FINAL_FILES" | grep -q "^apps/client/"; then
    CHANGE_SCOPE="client"
  elif echo "$FINAL_FILES" | grep -q "^apps/admin/"; then
    CHANGE_SCOPE="admin"
  elif echo "$FINAL_FILES" | grep -q "^apps/shared/"; then
    CHANGE_SCOPE="shared"
  elif echo "$FINAL_FILES" | grep -q "^iac/"; then
    CHANGE_SCOPE="infrastructure"
  elif echo "$FINAL_FILES" | grep -q "^doc/"; then
    CHANGE_SCOPE="docs"
  else
    CHANGE_SCOPE=""
  fi
fi

echo "🏷️  Tipo de cambio: $CHANGE_TYPE"
if [ ! -z "$CHANGE_SCOPE" ]; then
  echo "🎯 Scope detectado: $CHANGE_SCOPE"
fi
```

### 5. Generar Descripción del Cambio

```bash
echo ""
echo "📝 Generando descripción del cambio..."

# Analizar diff para entender el cambio
DIFF_SUMMARY=$(git diff --cached --stat | tail -1)
ADDED_LINES=$(echo "$DIFF_SUMMARY" | grep -oE "[0-9]+ insertion" | grep -oE "[0-9]+" || echo "0")
DELETED_LINES=$(echo "$DIFF_SUMMARY" | grep -oE "[0-9]+ deletion" | grep -oE "[0-9]+" || echo "0")
FILES_CHANGED=$(echo "$FINAL_FILES" | wc -l)

echo "📊 Estadísticas: $FILES_CHANGED archivos, +$ADDED_LINES/-$DELETED_LINES líneas"

# Generar descripción basada en archivos principales
MAIN_CHANGES=""

# Detectar cambios específicos
if echo "$FINAL_FILES" | grep -q "package\.json"; then
  MAIN_CHANGES="$MAIN_CHANGES dependencies,"
fi

if echo "$FINAL_FILES" | grep -q "README\|readme"; then
  MAIN_CHANGES="$MAIN_CHANGES documentation,"
fi

if echo "$FINAL_FILES" | grep -q "\.env\|config"; then
  MAIN_CHANGES="$MAIN_CHANGES configuration,"
fi

# Detectar archivos nuevos vs modificados
NEW_FILES=$(git diff --cached --name-status | grep "^A" | wc -l)
MODIFIED_FILES=$(git diff --cached --name-status | grep "^M" | wc -l)
DELETED_FILES=$(git diff --cached --name-status | grep "^D" | wc -l)

if [ "$NEW_FILES" -gt 0 ]; then
  MAIN_CHANGES="$MAIN_CHANGES new files,"
fi

if [ "$DELETED_FILES" -gt 0 ]; then
  MAIN_CHANGES="$MAIN_CHANGES cleanup,"
fi

# Limpiar trailing comma
MAIN_CHANGES=$(echo "$MAIN_CHANGES" | sed 's/,$//')
```

### 6. Generar Mensaje de Commit

```bash
echo ""
echo "✍️  Generando mensaje de commit..."

# Si se proporcionó mensaje personalizado, usarlo
if [ ! -z "$COMMIT_MESSAGE_ARG" ]; then
  COMMIT_MESSAGE="$COMMIT_MESSAGE_ARG"
  echo "📝 Usando mensaje personalizado: $COMMIT_MESSAGE"
else
  # Generar mensaje automático
  
  # Componentes del mensaje
  TYPE_PREFIX="$CHANGE_TYPE"
  
  if [ ! -z "$CHANGE_SCOPE" ]; then
    SCOPE_PART="($CHANGE_SCOPE)"
  else
    SCOPE_PART=""
  fi
  
  # Generar descripción inteligente
  if [ ! -z "$ISSUE_TITLE" ]; then
    # Usar título del issue como base, pero simplificado
    DESCRIPTION=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | sed 's/  */ /g' | cut -c1-50)
  else
    # Generar descripción basada en archivos
    if [ "$FILES_CHANGED" -eq 1 ]; then
      MAIN_FILE=$(echo "$FINAL_FILES" | head -1)
      DESCRIPTION="update $(basename "$MAIN_FILE")"
    elif [ ! -z "$MAIN_CHANGES" ]; then
      DESCRIPTION="update $MAIN_CHANGES"
    else
      DESCRIPTION="implement changes"
    fi
  fi
  
  # Construir mensaje final
  COMMIT_MESSAGE="$TYPE_PREFIX$SCOPE_PART: $DESCRIPTION"
  
  # Agregar referencia al issue si existe
  if [ ! -z "$ISSUE_NUMBER" ]; then
    COMMIT_MESSAGE="$COMMIT_MESSAGE

Refs #$ISSUE_NUMBER"
  fi
fi

echo "💬 Mensaje de commit:"
echo "   $COMMIT_MESSAGE"
echo ""
```

### 7. Confirmar y Ejecutar Commit

```bash
echo "🤔 ¿Proceder con el commit?"
echo ""
echo "📋 Resumen:"
echo "   Archivos: $FILES_CHANGED"
echo "   Cambios: +$ADDED_LINES/-$DELETED_LINES líneas"
echo "   Tipo: $CHANGE_TYPE"
if [ ! -z "$CHANGE_SCOPE" ]; then
  echo "   Scope: $CHANGE_SCOPE"
fi
if [ ! -z "$ISSUE_NUMBER" ]; then
  echo "   Issue: #$ISSUE_NUMBER"
fi
echo ""

# Si hay mensaje personalizado, commit directo
if [ ! -z "$COMMIT_MESSAGE_ARG" ]; then
  echo "📝 Mensaje personalizado detectado, haciendo commit..."
  PROCEED="y"
else
  read -p "¿Continuar? [Y/n]: " PROCEED
fi

case "$PROCEED" in
  n|N|no)
    echo "❌ Commit cancelado"
    exit 0
    ;;
  *)
    echo "✅ Creando commit..."
    
    # Ejecutar commit
    git commit -m "$COMMIT_MESSAGE" || {
      echo "❌ Error al crear commit"
      exit 1
    }
    
    echo ""
    echo "🎉 COMMIT CREADO EXITOSAMENTE"
    echo ""
    echo "📊 Commit hash: $(git rev-parse --short HEAD)"
    echo "💬 Mensaje: $COMMIT_MESSAGE"
    
    if [ ! -z "$ISSUE_NUMBER" ]; then
      echo "🔗 Asociado a issue: #$ISSUE_NUMBER"
    fi
    
    echo ""
    echo "📋 Próximos pasos:"
    echo "   - Continuar implementando"
    echo "   - O ejecutar: /issue:submit-work (cuando termines)"
    ;;
esac
```

## Características

- **Análisis inteligente**: Detecta tipo de cambios y scope automáticamente
- **Contexto del issue**: Integra información del issue actual si está disponible
- **Commits limpios**: Sin referencias a Claude o AI
- **Convenciones**: Sigue formato convencional de commits (type(scope): description)
- **Flexibilidad**: Permite mensajes personalizados o generación automática
- **Validaciones**: Verifica que hay cambios antes de proceder
- **Referencias**: Incluye referencias al issue cuando es apropiado

## Uso

```bash
# Commit automático basado en análisis
/issue:commit

# Commit con mensaje personalizado
/issue:commit "fix(auth): resolve login validation issue"
```

## Formato de Commits Generados

```
type(scope): description

Refs #123
```

**Ejemplos:**
- `feat(client): add user authentication system`
- `fix(admin): resolve dashboard loading issue`
- `docs: update installation instructions`
- `test(shared): add unit tests for utility functions`
- `refactor(infrastructure): optimize deployment pipeline`

**IMPORTANTE**: Los commits nunca incluyen referencias a Claude Code o AI, mantienen un estilo profesional y coherente con el proyecto.