---
description: Enviar trabajo terminado creando PR y gestionando issues relacionados
allowed-tools: [Read, Bash, Glob, TodoWrite]
---

# Submit Work Issue

Enviar trabajo terminado para revisión: **$ARGUMENTS**

## Proceso:

### 1. Validación de Pruebas del Proyecto (CRÍTICO)

**IMPORTANTE**: Ejecutar todas las pruebas antes de cualquier otra acción

```bash
echo "🧪 VALIDACIÓN CRÍTICA: Ejecutando pruebas del proyecto..."
echo ""

# Detectar comandos de prueba del proyecto
LINT_CMD=""
TYPECHECK_CMD=""
TEST_CMD=""
BUILD_CMD=""
E2E_CMD=""

# 1. Revisar CLAUDE.md para comandos definidos
if [ -f "CLAUDE.md" ]; then
  echo "📋 Revisando comandos en CLAUDE.md..."
  
  # Buscar comandos de desarrollo en CLAUDE.md
  LINT_CMD=$(grep -oE "npm run [a-zA-Z0-9:-]+" CLAUDE.md | grep -E "(lint|eslint)" | head -1)
  TYPECHECK_CMD=$(grep -oE "npm run [a-zA-Z0-9:-]+" CLAUDE.md | grep -E "(type-check|typecheck)" | head -1) 
  TEST_CMD=$(grep -oE "npm run [a-zA-Z0-9:-]+" CLAUDE.md | grep -E "(test)" | head -1)
  BUILD_CMD=$(grep -oE "npm run [a-zA-Z0-9:-]+" CLAUDE.md | grep -E "(build|export)" | head -1)
  E2E_CMD=$(grep -oE "npx playwright test" CLAUDE.md | head -1)
fi

# 2. Fallback: Revisar package.json si no se encontraron en CLAUDE.md
if [ -f "package.json" ] && [ -z "$LINT_CMD$TYPECHECK_CMD$TEST_CMD$BUILD_CMD" ]; then
  echo "📦 Revisando scripts en package.json..."
  
  [ -z "$LINT_CMD" ] && LINT_CMD=$(jq -r '.scripts | keys[] | select(test("lint"))' package.json 2>/dev/null | head -1 | xargs -I {} echo "npm run {}")
  [ -z "$TYPECHECK_CMD" ] && TYPECHECK_CMD=$(jq -r '.scripts | keys[] | select(test("type-check|typecheck"))' package.json 2>/dev/null | head -1 | xargs -I {} echo "npm run {}")
  [ -z "$TEST_CMD" ] && TEST_CMD=$(jq -r '.scripts | keys[] | select(test("^test$"))' package.json 2>/dev/null | head -1 | xargs -I {} echo "npm run {}")
  [ -z "$BUILD_CMD" ] && BUILD_CMD=$(jq -r '.scripts | keys[] | select(test("build|export"))' package.json 2>/dev/null | head -1 | xargs -I {} echo "npm run {}")
fi

echo ""
echo "🔍 Comandos detectados:"
[ ! -z "$LINT_CMD" ] && echo "  ✅ Lint: $LINT_CMD"
[ ! -z "$TYPECHECK_CMD" ] && echo "  ✅ Type Check: $TYPECHECK_CMD" 
[ ! -z "$TEST_CMD" ] && echo "  ✅ Tests: $TEST_CMD"
[ ! -z "$BUILD_CMD" ] && echo "  ✅ Build: $BUILD_CMD"
[ ! -z "$E2E_CMD" ] && echo "  ✅ E2E Tests: $E2E_CMD"
echo ""

# 3. Ejecutar pruebas en orden y fallar si alguna falla
TESTS_PASSED=true

# Lint
if [ ! -z "$LINT_CMD" ]; then
  echo "🔍 Ejecutando Lint..."
  if ! $LINT_CMD; then
    echo "❌ LINT FAILED - No se puede crear PR con errores de lint"
    TESTS_PASSED=false
  else
    echo "✅ Lint passed"
  fi
  echo ""
fi

# Type Check  
if [ ! -z "$TYPECHECK_CMD" ]; then
  echo "🔍 Ejecutando Type Check..."
  if ! $TYPECHECK_CMD; then
    echo "❌ TYPE CHECK FAILED - No se puede crear PR con errores de tipos"
    TESTS_PASSED=false
  else
    echo "✅ Type Check passed"
  fi
  echo ""
fi

# Tests Unitarios
if [ ! -z "$TEST_CMD" ]; then
  echo "🔍 Ejecutando Tests..."
  if ! $TEST_CMD; then
    echo "❌ TESTS FAILED - No se puede crear PR con tests fallidos"
    TESTS_PASSED=false
  else
    echo "✅ Tests passed"
  fi
  echo ""
fi

# Build
if [ ! -z "$BUILD_CMD" ]; then
  echo "🔍 Ejecutando Build..."
  if ! $BUILD_CMD; then
    echo "❌ BUILD FAILED - No se puede crear PR si no compila"
    TESTS_PASSED=false
  else
    echo "✅ Build passed"
  fi
  echo ""
fi

# E2E Tests (opcional - solo si están definidos)
if [ ! -z "$E2E_CMD" ]; then
  echo "🔍 Ejecutando E2E Tests..."
  if ! $E2E_CMD; then
    echo "⚠️  E2E TESTS FAILED - Revisar funcionalidad end-to-end"
    echo "    Continuando pero recomendamos revisar antes del merge"
  else
    echo "✅ E2E Tests passed"
  fi
  echo ""
fi

# Validación final
if [ "$TESTS_PASSED" = false ]; then
  echo ""
  echo "🚨 =================================="
  echo "🚨 VALIDACIÓN CRÍTICA FALLIDA"
  echo "🚨 =================================="
  echo ""
  echo "❌ Algunas pruebas críticas fallaron."
  echo "❗ NO se puede crear PR hasta que todas las pruebas pasen."
  echo ""
  echo "🔧 Acciones requeridas:"
  echo "   1. Corregir errores de lint/tipos/tests/build"
  echo "   2. Hacer commit de las correcciones"
  echo "   3. Ejecutar /submit-work nuevamente"
  echo ""
  exit 1
fi

echo "🎉 =================================="
echo "🎉 TODAS LAS PRUEBAS PASARON"
echo "🎉 =================================="
echo ""
echo "✅ El código está listo para PR"
echo "🚀 Continuando con el proceso de submit..."
echo ""
```

### 2. Detectar Guías del Proyecto
```bash
# Buscar guía de contribuciones para entender flujo de PRs
find . doc/ docs/ -maxdepth 3 -type f -name "*.md" | xargs grep -l -i -E "(contribuci|contribution|pr|pull.*request)" 2>/dev/null | head -1

# Buscar documentación de implementación para contexto
find . doc/ docs/ -maxdepth 3 -type f -name "*.md" | xargs grep -l -i -E "(implement|arquitectura)" 2>/dev/null | head -1
```

### 3. Análisis del Trabajo Realizado

**Historia de Commits:**
```bash
# Obtener base branch (main/master)
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
CURRENT_BRANCH=$(git branch --show-current)

echo "Branch actual: $CURRENT_BRANCH"
echo "Target branch: $BASE_BRANCH"

# Commits del branch actual
git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD

# Archivos modificados en todo el branch
git diff --name-only $(git merge-base HEAD $BASE_BRANCH)..HEAD

# Issues/números referenciados en commits
RELATED_ISSUES=$(git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | grep -oE "#[0-9]+" | sort -u | tr '\n' ' ')
echo "Issues detectados: $RELATED_ISSUES"
```

**Análisis de Impacto:**
```bash
# Resumen de cambios
git diff --stat $(git merge-base HEAD $BASE_BRANCH)..HEAD

# Detectar tipo de trabajo realizado
CHANGED_FILES=$(git diff --name-only $(git merge-base HEAD $BASE_BRANCH)..HEAD)
echo "$CHANGED_FILES" | grep -E "\.(js|ts|jsx|tsx)$" && echo "Frontend changes detected"
echo "$CHANGED_FILES" | grep -E "infrastructure|iac/" && echo "Infrastructure changes detected"
echo "$CHANGED_FILES" | grep -E "\.md$" && echo "Documentation changes detected"
```

### 4. Gestión de Issues Relacionados

**Analizar Issues y Extraer Contexto de Comentarios:**
```bash
# Para cada issue detectado, extraer contexto completo
mkdir -p .claude/temp
for ISSUE_NUM in $RELATED_ISSUES; do
  ISSUE_NUM_CLEAN=$(echo $ISSUE_NUM | sed 's/#//')
  
  echo "🔍 Analizando Issue #$ISSUE_NUM_CLEAN..."
  
  # Obtener información completa del issue incluyendo comentarios
  ISSUE_INFO=$(gh issue view $ISSUE_NUM_CLEAN --json title,body,state,labels,milestone,comments,assignees)
  CURRENT_STATE=$(echo "$ISSUE_INFO" | jq -r '.state')
  
  # Guardar información del issue
  echo "$ISSUE_INFO" > .claude/temp/issue-$ISSUE_NUM_CLEAN-full.json
  
  # Extraer contexto de comentarios para el PR
  COMMENTS_TEXT=$(echo "$ISSUE_INFO" | jq -r '.comments[].body' | tr '\n' ' ')
  COMMENTS_COUNT=$(echo "$ISSUE_INFO" | jq -r '.comments | length')
  
  echo "  📝 Comentarios encontrados: $COMMENTS_COUNT"
  
  # Extraer información valiosa de comentarios
  TESTING_CONTEXT=""
  DECISIONS_CONTEXT=""
  ENDPOINTS_CONTEXT=""
  REQUIREMENTS_CONTEXT=""
  
  if [ $COMMENTS_COUNT -gt 0 ]; then
    # Testing reportado
    if echo "$COMMENTS_TEXT" | grep -qi -E "(test|probado|funciona|working|deployed|desplegado|endpoint.*ok|✅.*test|✅.*endpoint)"; then
      TESTING_CONTEXT=$(echo "$COMMENTS_TEXT" | grep -i -oE "[^.]*test[^.]*\.|[^.]*probado[^.]*\.|[^.]*funciona[^.]*\.|[^.]*working[^.]*\.|[^.]*deployed[^.]*\." | head -2 | tr '\n' ' ')
      echo "  ✅ Testing documentado en comentarios"
    fi
    
    # URLs/endpoints mencionados
    ENDPOINTS_CONTEXT=$(echo "$COMMENTS_TEXT" | grep -oE "https?://[a-zA-Z0-9.-]+(/[a-zA-Z0-9./?=&-]*)?" | head -3 | tr '\n' ' ')
    if [ ! -z "$ENDPOINTS_CONTEXT" ]; then
      echo "  🔗 Endpoints encontrados: $ENDPOINTS_CONTEXT"
    fi
    
    # Decisiones importantes
    if echo "$COMMENTS_TEXT" | grep -qi -E "(decision|acordado|implemented|completado|cambio.*importante|modificacion|actualizado)"; then
      DECISIONS_CONTEXT=$(echo "$COMMENTS_TEXT" | grep -i -oE "[^.]*decision[^.]*\.|[^.]*acordado[^.]*\.|[^.]*completado[^.]*\." | head -2 | tr '\n' ' ')
      echo "  📋 Decisiones importantes documentadas"
    fi
    
    # Requirements adicionales
    if echo "$COMMENTS_TEXT" | grep -qi -E "(también.*necesita|además.*debe|falta.*agregar|missing|pendiente|requirement)"; then
      REQUIREMENTS_CONTEXT=$(echo "$COMMENTS_TEXT" | grep -i -oE "[^.]*necesita[^.]*\.|[^.]*debe[^.]*\.|[^.]*falta[^.]*\.|[^.]*missing[^.]*\.|[^.]*pendiente[^.]*\." | head -2 | tr '\n' ' ')
      echo "  ⚠️  Requirements adicionales mencionados"
    fi
  fi
  
  # Guardar contexto extraído para usar en PR
  cat > .claude/temp/issue-$ISSUE_NUM_CLEAN-context.json << EOF
{
  "testing_context": "$TESTING_CONTEXT",
  "decisions_context": "$DECISIONS_CONTEXT", 
  "endpoints_context": "$ENDPOINTS_CONTEXT",
  "requirements_context": "$REQUIREMENTS_CONTEXT",
  "comments_count": $COMMENTS_COUNT
}
EOF
  
  # Mover issue a "In Review" si está abierto
  if [ "$CURRENT_STATE" = "open" ]; then
    echo "  🔄 Moviendo issue #$ISSUE_NUM_CLEAN a In Review..."
    
    # ===== NUEVO: CAMBIAR STATUS EN PROJECT A "IN REVIEW" (APPROACH ROBUSTO) =====
    echo "  📊 Cambiando status del project a 'In Review'..."
    
    # Obtener información del repositorio
    if command -v jq >/dev/null 2>&1; then
      REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
      REPO_NAME=$(gh repo view --json name --jq '.name')
    else
      REPO_OWNER=$(gh repo view --json owner | grep '"login"' | sed 's/.*"login": *"\([^"]*\)".*/\1/')
      REPO_NAME=$(gh repo view --json name | grep '"name"' | sed 's/.*"name": *"\([^"]*\)".*/\1/')
    fi
    
    # Buscar projects del owner
    echo "  🔍 Buscando projects disponibles..."
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
        echo "  📋 Project encontrado: #$PROJECT_NUMBER"
        
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
            IN_REVIEW_OPTION_ID=$(echo "$PROJECT_FIELDS" | jq -r '.data.organization.projectV2.fields.nodes[] | select(.name == "Status") | .options[] | select(.name == "In Review") | .id')
          else
            PROJECT_ID=$(echo "$PROJECT_FIELDS" | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
            STATUS_FIELD_ID=$(echo "$PROJECT_FIELDS" | grep -A20 '"name": *"Status"' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
            IN_REVIEW_OPTION_ID=$(echo "$PROJECT_FIELDS" | grep -A50 '"name": *"Status"' | grep -A5 '"name": *"In Review"' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
          fi
          
          if [ ! -z "$PROJECT_ID" ] && [ ! -z "$STATUS_FIELD_ID" ] && [ ! -z "$IN_REVIEW_OPTION_ID" ]; then
            echo "  🔧 IDs encontrados - Project: $PROJECT_ID, Status Field: $STATUS_FIELD_ID, In Review: $IN_REVIEW_OPTION_ID"
            
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
                ITEM_ID=$(echo "$PROJECT_ITEMS" | jq -r '.data.organization.projectV2.items.nodes[] | select(.content.number == '$ISSUE_NUM_CLEAN') | .id')
              else
                # Buscar el item ID para el issue específico (más complejo sin jq)
                ITEM_ID=$(echo "$PROJECT_ITEMS" | grep -B3 -A1 '"number": *'$ISSUE_NUM_CLEAN',' | grep '"id"' | head -1 | sed 's/.*"id": *"\([^"]*\)".*/\1/')
              fi
              
              if [ ! -z "$ITEM_ID" ]; then
                echo "  🎯 Item encontrado: $ITEM_ID"
                
                # Cambiar status a "In Review"
                RESULT=$(gh project item-edit \
                  --project-id "$PROJECT_ID" \
                  --id "$ITEM_ID" \
                  --field-id "$STATUS_FIELD_ID" \
                  --single-select-option-id "$IN_REVIEW_OPTION_ID" 2>/dev/null)
                
                if [ $? -eq 0 ]; then
                  echo "  ✅ Status cambiado a 'In Review' en project #$PROJECT_NUMBER"
                  
                  # Verificar el cambio
                  sleep 1
                  VERIFICATION=$(gh issue view "$ISSUE_NUM_CLEAN" --json projectItems 2>/dev/null)
                  if echo "$VERIFICATION" | grep -q "In Review"; then
                    echo "  ✅ Verificación: Status actualizado correctamente"
                  else
                    echo "  ⚠️  Verificación: Status podría no haberse actualizado"
                  fi
                else
                  echo "  ⚠️  No se pudo cambiar el status en el project"
                fi
              else
                echo "  ⚠️  No se encontró el issue #$ISSUE_NUM_CLEAN en el project #$PROJECT_NUMBER"
              fi
            else
              echo "  ⚠️  No se pudieron obtener los items del project"
            fi
          else
            echo "  ⚠️  No se encontraron los IDs necesarios para cambiar el status"
            echo "      Project ID: $PROJECT_ID"
            echo "      Status Field ID: $STATUS_FIELD_ID" 
            echo "      In Review Option ID: $IN_REVIEW_OPTION_ID"
          fi
        else
          echo "  ⚠️  No se pudo obtener información de campos del project"
        fi
      else
        echo "  ⚠️  No se encontró un project válido"
      fi
    else
      echo "  ⚠️  No se encontraron projects para el owner $REPO_OWNER"
    fi
    
    # ===== FIN NUEVO: CAMBIAR STATUS EN PROJECT =====
    
    # Agregar label "in-review" si no existe
    gh issue edit $ISSUE_NUM_CLEAN --add-label "in-review" 2>/dev/null || true
    
    echo "  ✅ Issue #$ISSUE_NUM_CLEAN marcado como In Review (labels + project status)"
  else
    echo "  ℹ️  Issue #$ISSUE_NUM_CLEAN ya está en estado: $CURRENT_STATE"
  fi
  
  echo ""
done
```

### 5. Extraer Contexto de Commits

**Crear TodoWrite:**
- [ ] Analizar guías del proyecto encontradas
- [ ] Extraer información de commits realizados
- [ ] Mover issues relacionados a "In Review"
- [ ] Generar título y descripción del PR con referencias de cierre
- [ ] Crear template de PR según guías del proyecto

**Extraer Contexto de Commits:**
```bash
# Primer y último commit para entender scope
FIRST_COMMIT=$(git log --reverse --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | head -1)
LAST_COMMIT=$(git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | head -1)

# Extraer patrones comunes de commits para generar título
git log --oneline $(git merge-base HEAD $BASE_BRANCH)..HEAD | grep -oE "(feat|fix|docs|refactor|test|chore)" | sort | uniq -c
```

### 6. Aplicar Guías del Proyecto

**Si se encuentra guía de contribuciones:**
- Leer estructura de PR requerida
- Aplicar template específico del proyecto
- Seguir convenciones de naming establecidas

**Si no se encuentra guía:**
- Usar template genérico pero informativo
- Basarse en análisis de commits y archivos

### 7. Generación Automática del PR

**Template Dinámico con Contexto de Issues:**
```bash
# Generar descripción enriquecida con contexto de comentarios
echo "Generando descripción del PR con contexto completo..."

# Recopilar contexto de todos los issues relacionados
ALL_TESTING_CONTEXT=""
ALL_DECISIONS_CONTEXT=""
ALL_ENDPOINTS_CONTEXT=""
ALL_REQUIREMENTS_CONTEXT=""

for ISSUE_NUM in $RELATED_ISSUES; do
  ISSUE_NUM_CLEAN=$(echo $ISSUE_NUM | sed 's/#//')
  
  if [ -f ".claude/temp/issue-$ISSUE_NUM_CLEAN-context.json" ]; then
    TESTING_CTX=$(jq -r '.testing_context' .claude/temp/issue-$ISSUE_NUM_CLEAN-context.json)
    DECISIONS_CTX=$(jq -r '.decisions_context' .claude/temp/issue-$ISSUE_NUM_CLEAN-context.json)
    ENDPOINTS_CTX=$(jq -r '.endpoints_context' .claude/temp/issue-$ISSUE_NUM_CLEAN-context.json)
    REQUIREMENTS_CTX=$(jq -r '.requirements_context' .claude/temp/issue-$ISSUE_NUM_CLEAN-context.json)
    
    [ ! -z "$TESTING_CTX" ] && ALL_TESTING_CONTEXT="$ALL_TESTING_CONTEXT $TESTING_CTX"
    [ ! -z "$DECISIONS_CTX" ] && ALL_DECISIONS_CONTEXT="$ALL_DECISIONS_CONTEXT $DECISIONS_CTX"
    [ ! -z "$ENDPOINTS_CTX" ] && ALL_ENDPOINTS_CONTEXT="$ALL_ENDPOINTS_CONTEXT $ENDPOINTS_CTX"
    [ ! -z "$REQUIREMENTS_CTX" ] && ALL_REQUIREMENTS_CONTEXT="$ALL_REQUIREMENTS_CONTEXT $REQUIREMENTS_CTX"
  fi
done

# Crear template enriquecido
cat > .claude/temp/pr-description.md << 'EOF'
## Resumen

[Resumen generado basado en commits y archivos modificados]

## Cambios Realizados

[Lista de cambios principales extraída de git diff]

## Closes Issues

[Referencias automáticas para cerrar issues cuando se mergee el PR]
$(for issue in $RELATED_ISSUES; do echo "- Closes $issue"; done)

## Contexto del Issue

EOF

# Agregar contexto de comentarios si existe
if [ ! -z "$ALL_TESTING_CONTEXT" ]; then
  cat >> .claude/temp/pr-description.md << EOF

### Testing/Validación Reportada
$ALL_TESTING_CONTEXT

EOF
fi

if [ ! -z "$ALL_DECISIONS_CONTEXT" ]; then
  cat >> .claude/temp/pr-description.md << EOF

### Decisiones Importantes
$ALL_DECISIONS_CONTEXT

EOF
fi

if [ ! -z "$ALL_ENDPOINTS_CONTEXT" ]; then
  cat >> .claude/temp/pr-description.md << EOF

### Endpoints/URLs Operativas
$ALL_ENDPOINTS_CONTEXT

EOF
fi

if [ ! -z "$ALL_REQUIREMENTS_CONTEXT" ]; then
  cat >> .claude/temp/pr-description.md << EOF

### Requirements Adicionales
$ALL_REQUIREMENTS_CONTEXT

EOF
fi

# Continuar con template estándar - usar variables expandidas
cat >> .claude/temp/pr-description.md << EOF

## Tipo de Cambio

[Determinado por análisis de archivos: Feature/Fix/Infrastructure/Documentation]

## Información del Branch
- **Origen**: $CURRENT_BRANCH
- **Destino**: $BASE_BRANCH
- **Commits**: $COMMIT_COUNT

## Plan de Pruebas

[Basado en guías del proyecto, testing reportado o genérico si no hay información]
EOF

echo "✅ Descripción del PR generada con contexto completo"
```

**IMPORTANTE**: NO incluir referencias automáticas de generación por AI o Claude Code en el PR.

**Crear PR:**
```bash
# Generar título inteligente basado en commits
PR_TITLE="[Tipo de cambio]: [Descripción extraída de commits principales]"

# Crear PR usando template generado
gh pr create --title "$PR_TITLE" --body-file .claude/temp/pr-description.md

# Obtener URL del PR creado para mostrar al usuario
```

### 8. Output Final y Limpieza

```bash
echo "✅ PR Y GESTIÓN DE ISSUES COMPLETADA"
echo ""
echo "📊 Resumen:"
echo "- ✅ Pruebas del proyecto: TODAS PASARON"
echo "- Branch: $CURRENT_BRANCH → $BASE_BRANCH"
echo "- Commits incluidos: $COMMIT_COUNT"
echo "- Archivos modificados: $FILES_CHANGED"
echo "- Issues gestionados: $RELATED_ISSUES"
echo "- Estado de issues: Movidos a 'In Review'"
echo "- Tipo de cambio: $CHANGE_TYPE"
echo "- Contexto de comentarios: Analizado e incluido en PR"

# Verificar y reportar status del project para todos los issues relacionados
echo ""
echo "📋 Status del Project por Issue:"
for ISSUE_NUM in $RELATED_ISSUES; do
  ISSUE_NUM_CLEAN=$(echo $ISSUE_NUM | sed 's/#//')
  PROJECT_STATUS_CHECK=$(gh issue view "$ISSUE_NUM_CLEAN" --json projectItems 2>/dev/null)
  if echo "$PROJECT_STATUS_CHECK" | grep -q "In Review"; then
    echo "  - Issue #$ISSUE_NUM_CLEAN: ✅ In Review"
  else
    echo "  - Issue #$ISSUE_NUM_CLEAN: ⚠️  Verificar manualmente"
  fi
done
echo ""
echo "🔗 PR URL: $PR_URL"
echo ""
echo "🔄 Flujo Automático Configurado:"
echo "  1. ✅ Pruebas del proyecto ejecutadas y pasaron"
echo "  2. ✅ Issues analizados (incluidos comentarios)"
echo "  3. ✅ Issues movidos a 'In Review'"
echo "  4. 🔄 PR creado con contexto completo"
echo "  5. 🎯 Issues se cerrarán automáticamente al mergear"
echo ""
echo "📋 Próximos pasos:"
echo "- Solicitar review del PR"
echo "- Una vez aprobado y mergeado, los issues se cerrarán automáticamente"
echo "- [Pasos adicionales según guías del proyecto si las hay]"
echo ""

# Limpieza de archivos temporales
echo "🧹 Limpiando archivos temporales..."
rm -f .claude/temp/issue-*-full.json 2>/dev/null
rm -f .claude/temp/issue-*-context.json 2>/dev/null
echo "✅ Limpieza completada"
```

## Características

- **🧪 Validación crítica de pruebas**: Ejecuta automáticamente todas las pruebas del proyecto ANTES de crear PR
- **🚫 Fail-fast**: Bloquea creación de PR si hay errores de lint, tipos, tests o build
- **🔍 Auto-detección**: Encuentra comandos de prueba en CLAUDE.md y package.json automáticamente  
- **📊 Suite completa**: lint, type-check, tests, build, E2E (si están definidos)
- **Gestión completa del flujo**: Pruebas → Issues → In Review → PR → Auto-close
- **Project Management automatizado**: Detecta automáticamente el project correcto y cambia status de "In Progress" a "In Review"
- **Transición robusta de status**: Usa approach robusto con GraphQL API para garantizar cambio de status
- **Análisis profundo de issues**: Extrae contexto de commits, issues y comentarios automáticamente
- **Contexto enriquecido**: Incluye testing reportado, decisiones y endpoints de comentarios
- **PR inteligente**: Descripción generada con contexto completo de discusiones
- **Adaptable**: Usa guías del proyecto si existen, genérico si no
- **Automatización completa**: Mueve issues a review (labels + project status) y configura cierre automático
- **Detección inteligente**: Identifica URLs, testing y requirements en comentarios
- **Branch-aware**: Detecta branch actual y target automáticamente
- **Verificación post-cambio**: Confirma que el status del project se actualizó correctamente para cada issue
- **Reporting detallado**: Muestra status del project por issue en el resumen final

## Flujo Completo Automatizado

1. **🧪 Validación crítica**: Ejecuta todas las pruebas del proyecto (lint, types, tests, build, E2E)
2. **🚫 Gate de calidad**: BLOQUEA si alguna prueba falla - no permite PR defectuoso
3. **📊 Análisis**: Detecta branch, commits, issues relacionados
4. **📝 Extracción de contexto**: Analiza comentarios de issues para obtener testing, decisiones y endpoints
5. **🔄 Transición robusta**: Mueve issues de "In Progress" → "In Review" (labels + project status)
6. **✅ Verificación**: Confirma que el status del project se actualizó correctamente
7. **📤 PR Creation**: Crea PR con contexto completo y referencias `Closes #123`
8. **🎯 Auto-close**: GitHub cierra issues automáticamente al mergear

**IMPORTANTE**: Este comando maneja todo el ciclo de vida de la tarea desde finalización hasta cierre.