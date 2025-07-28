---
description: Actualizar plan del issue con progreso actual y trabajo realizado
allowed-tools: [Read, Bash, Glob, Edit]
---

# Issue Save Progress

Actualizar plan del issue con el progreso actual: **$ARGUMENTS**

## Proceso:

### 1. Identificar Plan Actual

```bash
echo "🔍 Identificando plan del issue actual..."

# Obtener información del trabajo actual
ISSUE_NUMBER=""
PLAN_FILE=""

if [ -f ".claude/temp/current-work.json" ]; then
  ISSUE_NUMBER=$(jq -r '.issue_number // empty' .claude/temp/current-work.json 2>/dev/null)
  PLAN_FILE=$(jq -r '.plan_file // empty' .claude/temp/current-work.json 2>/dev/null)
  
  if [ ! -z "$ISSUE_NUMBER" ] && [ ! -z "$PLAN_FILE" ]; then
    echo "✅ Trabajo actual: Issue #$ISSUE_NUMBER"
    echo "📄 Plan file: $PLAN_FILE"
  else
    echo "⚠️  Metadata incompleta en current-work.json"
  fi
else
  echo "⚠️  No se encontró metadata de trabajo actual"
  
  # Buscar plan más reciente en .claude/artifact-temp del proyecto
  RECENT_PLAN=$(ls -t .claude/artifact-temp/issue-plan-*.md 2>/dev/null | head -1)
  if [ ! -z "$RECENT_PLAN" ]; then
    PLAN_FILE=$(basename "$RECENT_PLAN")
    ISSUE_NUMBER=$(echo "$PLAN_FILE" | grep -oE "[0-9]+" | head -1)
    echo "🔍 Plan más reciente encontrado: $PLAN_FILE"
  else
    echo "❌ No se encontró ningún plan de issue"
    exit 1
  fi
fi

PLAN_PATH=".claude/temp/$PLAN_FILE"
if [ ! -f "$PLAN_PATH" ]; then
  echo "❌ Plan no encontrado: $PLAN_PATH"
  exit 1
fi

echo "📋 Actualizando plan: $PLAN_PATH"
```

### 2. Analizar Progreso Actual

```bash
echo ""
echo "📊 Analizando progreso actual..."

# Obtener información de la rama actual
CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

echo "🌿 Rama actual: $CURRENT_BRANCH"

# Obtener commits realizados en esta rama
if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
  COMMITS_COUNT=$(git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | wc -l)
  echo "📝 Commits realizados: $COMMITS_COUNT"
  
  if [ "$COMMITS_COUNT" -gt 0 ]; then
    echo ""
    echo "📋 Commits en esta rama:"
    git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | sed 's/^/  - /'
    
    # Obtener archivos modificados en toda la rama
    MODIFIED_FILES=$(git diff --name-only $(git merge-base HEAD $BASE_BRANCH)..HEAD)
    FILES_COUNT=$(echo "$MODIFIED_FILES" | grep -v '^$' | wc -l)
    echo ""
    echo "📁 Archivos modificados: $FILES_COUNT"
    if [ "$FILES_COUNT" -gt 0 ] && [ "$FILES_COUNT" -le 10 ]; then
      echo "$MODIFIED_FILES" | sed 's/^/  - /'
    elif [ "$FILES_COUNT" -gt 10 ]; then
      echo "$MODIFIED_FILES" | head -10 | sed 's/^/  - /'
      echo "  ... y $((FILES_COUNT - 10)) más"
    fi
  fi
else
  echo "⚠️  Estás en $BASE_BRANCH - no hay commits específicos del issue"
  COMMITS_COUNT=0
fi

# Verificar estado actual
STAGED_FILES=$(git diff --cached --name-only)
UNSTAGED_FILES=$(git diff --name-only)

if [ ! -z "$STAGED_FILES" ]; then
  echo ""
  echo "📋 Cambios staged:"
  echo "$STAGED_FILES" | sed 's/^/  - /'
fi

if [ ! -z "$UNSTAGED_FILES" ]; then
  echo ""
  echo "⚠️  Cambios unstaged:"
  echo "$UNSTAGED_FILES" | sed 's/^/  - /'
fi
```

### 3. Generar Resumen de Progreso

```bash
echo ""
echo "📝 Generando resumen de progreso..."

# Generar timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Crear resumen del progreso
PROGRESS_SUMMARY=""

if [ "$COMMITS_COUNT" -gt 0 ]; then
  PROGRESS_SUMMARY="## 📊 Progreso Actual (Actualizado: $TIMESTAMP)

### ✅ Trabajo Completado
- **Commits realizados**: $COMMITS_COUNT
- **Archivos modificados**: $FILES_COUNT
- **Rama de trabajo**: \`$CURRENT_BRANCH\`

#### Commits recientes:
$(git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | head -5 | sed 's/^/- /')"

  if [ "$FILES_COUNT" -gt 0 ] && [ "$FILES_COUNT" -le 15 ]; then
    PROGRESS_SUMMARY="$PROGRESS_SUMMARY

#### Archivos trabajados:
$(echo "$MODIFIED_FILES" | sed 's/^/- /')"
  fi
else
  PROGRESS_SUMMARY="## 📊 Progreso Actual (Actualizado: $TIMESTAMP)

### 🏁 Estado Inicial
- Rama creada: \`$CURRENT_BRANCH\`
- Issue en progreso: #$ISSUE_NUMBER
- Trabajo pendiente según plan original"
fi

# Agregar estado de cambios actuales si los hay
if [ ! -z "$STAGED_FILES" ] || [ ! -z "$UNSTAGED_FILES" ]; then
  PROGRESS_SUMMARY="$PROGRESS_SUMMARY

### 🔄 Trabajo en Progreso"
  
  if [ ! -z "$STAGED_FILES" ]; then
    PROGRESS_SUMMARY="$PROGRESS_SUMMARY
#### Cambios staged (listos para commit):
$(echo "$STAGED_FILES" | sed 's/^/- /')"
  fi
  
  if [ ! -z "$UNSTAGED_FILES" ]; then
    PROGRESS_SUMMARY="$PROGRESS_SUMMARY
#### Cambios unstaged (en desarrollo):
$(echo "$UNSTAGED_FILES" | sed 's/^/- /')"
  fi
fi

PROGRESS_SUMMARY="$PROGRESS_SUMMARY

---
"

echo "✅ Resumen de progreso generado"
```

### 4. Actualizar Plan con Progreso

```bash
echo ""
echo "📄 Actualizando plan con progreso..."

# Leer plan actual
PLAN_CONTENT=$(cat "$PLAN_PATH")

# Verificar si ya existe una sección de progreso
if echo "$PLAN_CONTENT" | grep -q "## 📊 Progreso Actual"; then
  echo "🔄 Actualizando sección de progreso existente..."
  
  # Eliminar sección de progreso anterior (desde "## 📊 Progreso Actual" hasta la próxima sección "##" o final)
  PLAN_WITHOUT_PROGRESS=$(echo "$PLAN_CONTENT" | awk '
    /^## 📊 Progreso Actual/ { skip=1; next }
    /^## / && skip { skip=0 }
    !skip { print }
  ')
  
  # Insertar nuevo progreso al inicio (después del título principal)
  UPDATED_PLAN=$(echo "$PLAN_WITHOUT_PROGRESS" | awk -v progress="$PROGRESS_SUMMARY" '
    NR==1 { print; print ""; print progress; next }
    { print }
  ')
else
  echo "➕ Agregando nueva sección de progreso..."
  
  # Insertar progreso al inicio (después del título principal)
  UPDATED_PLAN=$(echo "$PLAN_CONTENT" | awk -v progress="$PROGRESS_SUMMARY" '
    NR==1 { print; print ""; print progress; next }
    { print }
  ')
fi

# Crear checksum del contenido original antes de guardar
ORIGINAL_CHECKSUM=$(echo "$PLAN_CONTENT" | sha256sum | cut -d' ' -f1)

# Guardar plan actualizado
echo "$UPDATED_PLAN" > "$PLAN_PATH"

# Crear checksum del contenido actualizado
NEW_CHECKSUM=$(cat "$PLAN_PATH" | sha256sum | cut -d' ' -f1)

echo "✅ Plan actualizado: $PLAN_PATH"
```

### 5. Actualizar Metadata de Trabajo

```bash
echo ""
echo "🔄 Actualizando metadata de trabajo..."

if [ -f ".claude/temp/current-work.json" ]; then
  # Actualizar metadata con progreso
  UPDATED_METADATA=$(jq --arg timestamp "$TIMESTAMP" --arg commits "$COMMITS_COUNT" --arg files "$FILES_COUNT" '
    .last_progress_update = $timestamp |
    .commits_count = ($commits | tonumber) |
    .files_modified = ($files | tonumber)
  ' .claude/temp/current-work.json)
  
  echo "$UPDATED_METADATA" > .claude/temp/current-work.json
  echo "✅ Metadata actualizada"
else
  echo "⚠️  No se encontró metadata para actualizar"
fi
```

### 6. Validación de Cambios y Output Final

```bash
echo ""
echo "🔍 Validando que el archivo del plan realmente cambió..."

# Comparar checksums para validar cambios
if [ "$ORIGINAL_CHECKSUM" = "$NEW_CHECKSUM" ]; then
  echo ""
  echo "⚠️  =================================="
  echo "⚠️  ADVERTENCIA: ARCHIVO SIN CAMBIOS"  
  echo "⚠️  =================================="
  echo ""
  echo "❗ El archivo del plan NO se modificó:"
  echo "   - Checksum original: $ORIGINAL_CHECKSUM"
  echo "   - Checksum actual:   $NEW_CHECKSUM"
  echo ""
  echo "🤔 Posibles causas:"
  echo "   1. No había progreso nuevo que agregar"
  echo "   2. El mismo progreso ya estaba registrado"
  echo "   3. Solo se detectaron metadatos sin cambios reales"
  echo ""
  echo "📋 Resultado: Plan mantiene el mismo contenido"
  FILE_CHANGED=false
else
  echo "✅ Archivo del plan modificado correctamente"
  echo "   - Checksum original: $ORIGINAL_CHECKSUM"  
  echo "   - Checksum nuevo:    $NEW_CHECKSUM"
  FILE_CHANGED=true
fi

echo ""
if [ "$FILE_CHANGED" = true ]; then
  echo "🎉 PROGRESO GUARDADO EXITOSAMENTE"
else
  echo "📄 PROCESO COMPLETADO (Sin cambios en el plan)"
fi
echo ""
echo "📊 Resumen:"
echo "- Issue: #$ISSUE_NUMBER"
echo "- Plan: $PLAN_FILE"
echo "- Archivo modificado: $([ "$FILE_CHANGED" = true ] && echo "✅ SÍ" || echo "❌ NO")"
echo "- Commits detectados: $COMMITS_COUNT"
echo "- Archivos trabajados: $FILES_COUNT"
echo "- Timestamp: $TIMESTAMP"
echo ""
echo "📋 El plan ahora refleja:"
echo "  ✅ Trabajo completado hasta el momento"
echo "  🔄 Estado actual de cambios"
echo "  📝 Commits realizados"
echo "  📁 Archivos modificados"
echo ""
echo "💡 Próximos pasos:"
echo "  - Continuar implementando según el plan"
echo "  - Usar /issue:commit para nuevos commits"
echo "  - Ejecutar /issue:save-progress periódicamente"
echo "  - Finalizar con /issue:submit-work cuando esté listo"
echo ""
if [ "$FILE_CHANGED" = true ]; then
  echo "📄 Plan actualizado disponible en: .claude/artifact-temp/$PLAN_FILE"
else
  echo "📄 Plan disponible (sin cambios) en: .claude/artifact-temp/$PLAN_FILE"
fi
```

## Características

- **🔍 Validación de cambios**: Verifica con checksum que el archivo realmente se modificó
- **🚨 Detección de duplicados**: Alerta si no hay progreso nuevo que guardar
- **📊 Tracking automático**: Detecta commits, archivos modificados y estado actual
- **📝 Progreso visible**: Actualiza el plan con una sección de progreso clara
- **⏰ Timestamp**: Marca cuándo se actualizó por última vez
- **🔄 Estado completo**: Incluye cambios staged, unstaged y commits
- **🛡️ Preserva plan original**: Solo agrega/actualiza sección de progreso
- **⚙️ Metadata sincronizada**: Mantiene consistencia con current-work.json
- **✅ Confirmación clara**: Indica si el plan cambió o se mantuvo igual

## Uso

```bash
# Guardar progreso automáticamente
/issue:save-progress

# El plan se actualiza con:
# - Commits realizados
# - Archivos modificados  
# - Cambios en progreso
# - Timestamp de actualización
```

## Sección Generada en el Plan

```markdown
## 📊 Progreso Actual (Actualizado: 2024-12-XX XX:XX:XX)

### ✅ Trabajo Completado
- **Commits realizados**: 3
- **Archivos modificados**: 5
- **Rama de trabajo**: `feature/issue-123-auth-system`

#### Commits recientes:
- abc1234 feat(auth): add login validation
- def5678 fix(auth): handle edge cases
- ghi9012 test(auth): add unit tests

#### Archivos trabajados:
- src/auth/login.ts
- src/auth/validation.ts
- tests/auth.spec.ts

### 🔄 Trabajo en Progreso
#### Cambios unstaged:
- src/auth/register.ts

---
```

**IMPORTANTE**: Este comando permite mantener el plan actualizado con el progreso real, facilitando retomar el trabajo y tener visibilidad completa del estado actual.