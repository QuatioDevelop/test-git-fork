---
description: Validar PR antes del merge verificando cumplimiento de requerimientos y contexto
allowed-tools: [Read, Bash, Glob, TodoWrite]
---

# Validate PR

Validar pull request antes del merge: **$ARGUMENTS**

## Proceso:

### 1. Recolección de Información del PR

**Obtener datos básicos del PR:**
```bash
PR_NUMBER="$ARGUMENTS"

if [ -z "$PR_NUMBER" ]; then
  echo "❌ Error: Debe especificar el número del PR"
  echo "Uso: /validate-pr {pr-number}"
  exit 1
fi

echo "🔍 Analizando PR #$PR_NUMBER..."
echo ""

# Verificar que el PR existe
if ! gh pr view $PR_NUMBER >/dev/null 2>&1; then
  echo "❌ Error: PR #$PR_NUMBER no encontrado"
  exit 1
fi

# Obtener información completa del PR
PR_INFO=$(gh pr view $PR_NUMBER --json title,body,files,additions,deletions,author,state,reviewRequests,reviews)
PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_BODY=$(echo "$PR_INFO" | jq -r '.body')
PR_STATE=$(echo "$PR_INFO" | jq -r '.state')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author.login')
CHANGED_FILES=$(echo "$PR_INFO" | jq -r '.files[].path' | tr '\n' ' ')
ADDITIONS=$(echo "$PR_INFO" | jq -r '.additions')
DELETIONS=$(echo "$PR_INFO" | jq -r '.deletions')

echo "📊 Información del PR:"
echo "- Título: $PR_TITLE"
echo "- Estado: $PR_STATE"
echo "- Autor: $PR_AUTHOR"
echo "- Cambios: +$ADDITIONS -$DELETIONS"
echo "- Archivos modificados: $(echo "$PR_INFO" | jq -r '.files | length')"
echo ""
```

### 2. Identificar Issues Relacionados

**Extraer referencias de issues (texto + detección automática GitHub):**
```bash
# Buscar referencias a issues en el cuerpo del PR
RELATED_ISSUES=$(echo "$PR_BODY" | grep -oE "#[0-9]+" | sort -u | tr '\n' ' ')

# Verificar detección automática de GitHub usando GraphQL
# Obtener owner y repo dinámicamente  
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')

AUTO_CLOSING_ISSUES=$(gh api graphql --field query='
{
  repository(owner: "'$REPO_OWNER'", name: "'$REPO_NAME'") {
    pullRequest(number: '$PR_NUMBER') {
      closingIssuesReferences(first: 10) {
        nodes {
          number
          title
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[]')

if [ -z "$RELATED_ISSUES" ] && [ -z "$AUTO_CLOSING_ISSUES" ]; then
  echo "⚠️  No se encontraron referencias a issues en el PR"
  echo "   Recomendación: Agregar referencias como 'Closes #123'"
  echo ""
elif [ ! -z "$AUTO_CLOSING_ISSUES" ]; then
  echo "🎯 Issues que GitHub cerrará automáticamente:"
  echo "$AUTO_CLOSING_ISSUES" | while read -r issue; do
    ISSUE_NUM=$(echo "$issue" | jq -r '.number')
    ISSUE_TITLE=$(echo "$issue" | jq -r '.title')
    echo "   ✅ #$ISSUE_NUM: $ISSUE_TITLE"
    RELATED_ISSUES="$RELATED_ISSUES #$ISSUE_NUM"
  done
  echo ""
else
  echo "🎯 Issues relacionados: $RELATED_ISSUES"
  echo ""
fi

if [ ! -z "$RELATED_ISSUES" ] || [ ! -z "$AUTO_CLOSING_ISSUES" ]; then
  # Usar issues detectados automáticamente si no hay explícitos
  if [ -z "$RELATED_ISSUES" ]; then
    RELATED_ISSUES=$(echo "$AUTO_CLOSING_ISSUES" | jq -r '.number' | sed 's/^/#/' | tr '\n' ' ')
  fi
  
  # Para cada issue, obtener información
  for ISSUE_REF in $RELATED_ISSUES; do
    ISSUE_NUM=$(echo $ISSUE_REF | sed 's/#//')
    echo "📋 Analizando Issue $ISSUE_REF:"
    
    if gh issue view $ISSUE_NUM >/dev/null 2>&1; then
      ISSUE_INFO=$(gh issue view $ISSUE_NUM --json title,body,state,labels,milestone,comments)
      ISSUE_TITLE=$(echo "$ISSUE_INFO" | jq -r '.title')
      ISSUE_STATE=$(echo "$ISSUE_INFO" | jq -r '.state')
      ISSUE_LABELS=$(echo "$ISSUE_INFO" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')
      
      echo "  - Título: $ISSUE_TITLE"
      echo "  - Estado: $ISSUE_STATE"
      echo "  - Labels: $ISSUE_LABELS"
      
      # Analizar comentarios del issue para contexto adicional
      COMMENTS_COUNT=$(echo "$ISSUE_INFO" | jq -r '.comments | length')
      echo "  - Comentarios: $COMMENTS_COUNT"
      
      if [ $COMMENTS_COUNT -gt 0 ]; then
        echo "  📝 Analizando comentarios del issue..."
        
        # Extraer información clave de los comentarios
        COMMENTS_TEXT=$(echo "$ISSUE_INFO" | jq -r '.comments[].body' | tr '\n' ' ')
        
        # Buscar testing reportado en comentarios
        if echo "$COMMENTS_TEXT" | grep -qi -E "(test|probado|funciona|working|deployed|desplegado|endpoint|api.*ok|✅)"; then
          echo "     ✅ Testing/validación reportado en comentarios"
          TESTING_REPORTED=true
        else
          echo "     ℹ️  No se reportó testing en comentarios"
          TESTING_REPORTED=false
        fi
        
        # Buscar URLs/endpoints mencionados
        ENDPOINTS_MENTIONED=$(echo "$COMMENTS_TEXT" | grep -oE "https?://[a-zA-Z0-9.-]+(/[a-zA-Z0-9./?=&-]*)?" | head -3 | tr '\n' ' ')
        if [ ! -z "$ENDPOINTS_MENTIONED" ]; then
          echo "     🔗 URLs/endpoints mencionados: $ENDPOINTS_MENTIONED"
        fi
        
        # Buscar cambios/decisiones importantes en comentarios
        if echo "$COMMENTS_TEXT" | grep -qi -E "(cambio|modificado|actualizado|decision|acordado|implemented|completado)"; then
          echo "     📋 Decisiones/cambios importantes documentados en comentarios"
          DECISIONS_DOCUMENTED=true
        else
          DECISIONS_DOCUMENTED=false
        fi
        
        # Buscar problemas/blockers resueltos
        if echo "$COMMENTS_TEXT" | grep -qi -E "(problema|issue|blocker|error.*resuelto|fixed|solucionado)"; then
          echo "     🔧 Problemas/blockers resueltos documentados"
          BLOCKERS_RESOLVED=true
        else
          BLOCKERS_RESOLVED=false
        fi
        
        # Extraer requirements adicionales de comentarios
        ADDITIONAL_REQUIREMENTS=""
        if echo "$COMMENTS_TEXT" | grep -qi -E "(también.*necesita|además.*debe|falta.*agregar|missing|pendiente)"; then
          echo "     ⚠️  Posibles requirements adicionales mencionados en comentarios"
          ADDITIONAL_REQUIREMENTS="detected"
        fi
        
      else
        echo "     ℹ️  Sin comentarios adicionales"
        TESTING_REPORTED=false
        DECISIONS_DOCUMENTED=false
        BLOCKERS_RESOLVED=false
      fi
      
      # Guardar información del issue para análisis posterior
      echo "$ISSUE_INFO" > .claude/temp/issue-$ISSUE_NUM-info.json
      
      # Guardar contexto de comentarios para validación posterior
      cat > .claude/temp/issue-$ISSUE_NUM-context.json << EOF
{
  "testing_reported": $TESTING_REPORTED,
  "decisions_documented": $DECISIONS_DOCUMENTED,
  "blockers_resolved": $BLOCKERS_RESOLVED,
  "additional_requirements": "$ADDITIONAL_REQUIREMENTS",
  "endpoints_mentioned": "$ENDPOINTS_MENTIONED",
  "comments_count": $COMMENTS_COUNT
}
EOF
    else
      echo "  ❌ Issue #$ISSUE_NUM no encontrado"
    fi
    echo ""
  done
fi
```

### 3. Revisión de Documentación del Proyecto

**Buscar y analizar guías relevantes:**
```bash
echo "📚 Revisando documentación del proyecto..."

# Buscar guías de contribución
CONTRIB_GUIDE=$(find . doc/ docs/ -maxdepth 3 -name "*.md" | xargs grep -l -i -E "(contribuci|contribution|pr|pull.*request)" 2>/dev/null | head -1)

if [ ! -z "$CONTRIB_GUIDE" ]; then
  echo "✅ Guía de contribuciones encontrada: $CONTRIB_GUIDE"
else
  echo "⚠️  No se encontró guía de contribuciones específica"
fi

# Leer CLAUDE.md para contexto del proyecto
if [ -f "CLAUDE.md" ]; then
  echo "✅ Documentación del proyecto: CLAUDE.md"
  # Extraer tecnologías del stack
  TECH_STACK=$(grep -A 20 "Technology Stack\|Tech Stack" CLAUDE.md | grep -E "^\- \*\*|^\* \*\*" | head -10)
  if [ ! -z "$TECH_STACK" ]; then
    echo "🛠️  Stack tecnológico identificado"
  fi
else
  echo "⚠️  CLAUDE.md no encontrado"
fi

# Buscar documentación de arquitectura
ARCH_DOCS=$(find . doc/ docs/ -name "*.md" | xargs grep -l -i "arquitectura\|architecture" 2>/dev/null | head -3)
if [ ! -z "$ARCH_DOCS" ]; then
  echo "✅ Documentación de arquitectura encontrada"
fi

echo ""
```

### 4. Análisis de Cumplimiento de Requerimientos

**Validar cumplimiento básico:**
```bash
echo "🔍 Análisis de Cumplimiento:"
echo ""

# Inicializar contadores
VALIDATIONS_PASSED=0
VALIDATIONS_TOTAL=0
OBSERVATIONS=()
RECOMMENDATIONS=()

# Validación 1: Estructura del PR
echo "1️⃣ Estructura del PR:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

# Verificar título sigue convenciones
if echo "$PR_TITLE" | grep -qE "^(feat|fix|docs|refactor|test|chore|style|perf|ci)(\(.+\))?: "; then
  echo "   ✅ Título sigue convenciones (feat/fix/docs/etc.)"
  VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
else
  echo "   ❌ Título no sigue convenciones de commit"
  RECOMMENDATIONS+=("Usar formato: 'feat: descripción' o 'fix: descripción'")
fi

# Verificar descripción tiene contenido
if [ ${#PR_BODY} -gt 50 ]; then
  echo "   ✅ Descripción detallada presente"
else
  echo "   ⚠️  Descripción muy breve"
  RECOMMENDATIONS+=("Agregar más detalles en la descripción del PR")
fi

# Validación 2: Alineación con Issues
echo ""
echo "2️⃣ Alineación con Issues:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

if [ ! -z "$RELATED_ISSUES" ] || [ ! -z "$AUTO_CLOSING_ISSUES" ]; then
  echo "   ✅ Issues referenciados correctamente"
  VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
  
  # Verificar si usa "Closes" explícito o detección automática
  if echo "$PR_BODY" | grep -qE "(Closes|Fixes|Resolves) #[0-9]+"; then
    echo "   ✅ Configurado para auto-cerrar issues (referencia explícita)"
  elif [ ! -z "$AUTO_CLOSING_ISSUES" ]; then
    echo "   ✅ Configurado para auto-cerrar issues (detección automática GitHub)"
  else
    echo "   ⚠️  No configurado para auto-cerrar issues"
    RECOMMENDATIONS+=("Usar 'Closes #123' para auto-cerrar issues al mergear")
  fi
else
  echo "   ❌ No hay referencias a issues"
  RECOMMENDATIONS+=("Agregar referencias a issues relacionados con 'Closes #123'")
fi

# Validación 3: Coherencia de Archivos
echo ""
echo "3️⃣ Coherencia de Archivos Modificados:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

# Analizar tipos de archivos modificados
INFRASTRUCTURE_FILES=$(echo "$CHANGED_FILES" | grep -E "(iac/|infrastructure/|\.yaml$|\.yml$|template\.)" | wc -w)
BACKEND_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(js|ts|py|java|go|rs)$" | wc -w)
FRONTEND_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(jsx|tsx|vue|svelte|html|css|scss)$" | wc -w)
DOC_FILES=$(echo "$CHANGED_FILES" | grep -E "\.md$" | wc -w)
CONFIG_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(json|toml|env|config)$" | wc -w)

echo "   📁 Tipos de archivos modificados:"
[ $INFRASTRUCTURE_FILES -gt 0 ] && echo "      - Infraestructura: $INFRASTRUCTURE_FILES archivos"
[ $BACKEND_FILES -gt 0 ] && echo "      - Backend: $BACKEND_FILES archivos"
[ $FRONTEND_FILES -gt 0 ] && echo "      - Frontend: $FRONTEND_FILES archivos"
[ $DOC_FILES -gt 0 ] && echo "      - Documentación: $DOC_FILES archivos"
[ $CONFIG_FILES -gt 0 ] && echo "      - Configuración: $CONFIG_FILES archivos"

# Verificar coherencia con issue si existe
if [ ! -z "$RELATED_ISSUES" ]; then
  # Análisis básico de coherencia
  ISSUE_NUM=$(echo $RELATED_ISSUES | cut -d' ' -f1 | sed 's/#//')
  if [ -f ".claude/temp/issue-$ISSUE_NUM-info.json" ]; then
    ISSUE_LABELS=$(jq -r '.labels[].name' .claude/temp/issue-$ISSUE_NUM-info.json | tr '\n' ' ')
    
    # Verificar coherencia entre labels y archivos
    COHERENT=true
    if echo "$ISSUE_LABELS" | grep -q "infrastructure" && [ $INFRASTRUCTURE_FILES -eq 0 ]; then
      COHERENT=false
      OBSERVATIONS+=("Issue marcado como 'infrastructure' pero no se modificaron archivos de infraestructura")
    fi
    if echo "$ISSUE_LABELS" | grep -q "backend" && [ $BACKEND_FILES -eq 0 ]; then
      COHERENT=false
      OBSERVATIONS+=("Issue marcado como 'backend' pero no se modificaron archivos de backend")
    fi
    if echo "$ISSUE_LABELS" | grep -q "frontend" && [ $FRONTEND_FILES -eq 0 ]; then
      COHERENT=false
      OBSERVATIONS+=("Issue marcado como 'frontend' pero no se modificaron archivos de frontend")
    fi
    
    if $COHERENT; then
      echo "   ✅ Archivos coherentes con tipo de issue"
      VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    else
      echo "   ⚠️  Posible desalineación entre issue y archivos modificados"
    fi
  else
    echo "   ✅ Archivos modificados parecen coherentes"
    VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
  fi
else
  echo "   ⚠️  Sin issue de referencia para validar coherencia"
fi

# Validación 4: Documentación Duplicada (Solo si hay archivos .md)
echo ""
echo "4️⃣ Validación de Documentación Duplicada:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

if [ $DOC_FILES -gt 0 ]; then
  echo "   📋 Detectados $DOC_FILES archivos de documentación - Verificando duplicación..."
  
  # Obtener archivos .md modificados en el PR
  MODIFIED_DOCS=$(echo "$CHANGED_FILES" | grep "\.md$")
  
  if [ ! -z "$MODIFIED_DOCS" ]; then
    DUPLICATIONS_FOUND=false
    
    echo "$MODIFIED_DOCS" | while IFS= read -r DOC_FILE; do
      if [ -f "$DOC_FILE" ]; then
        echo "   🔍 Analizando: $DOC_FILE"
        
        # Extraer títulos/headers del documento modificado
        NEW_HEADERS=$(grep -E "^#{1,3} " "$DOC_FILE" 2>/dev/null | head -10)
        
        if [ ! -z "$NEW_HEADERS" ]; then
          # Buscar headers similares en otros documentos
          echo "$NEW_HEADERS" | while IFS= read -r HEADER; do
            CLEAN_HEADER=$(echo "$HEADER" | sed 's/^#*[[:space:]]*//' | tr '[:upper:]' '[:lower:]')
            
            if [ ${#CLEAN_HEADER} -gt 10 ]; then
              # Buscar en otros archivos .md (excluyendo el actual)
              SIMILAR_DOCS=$(find . -name "*.md" -not -path "./$DOC_FILE" -not -path "./.git/*" | \
                           xargs grep -l -i "$CLEAN_HEADER" 2>/dev/null | head -3)
              
              if [ ! -z "$SIMILAR_DOCS" ]; then
                echo "      ⚠️  Posible duplicación: '$CLEAN_HEADER'"
                echo "         También en: $(echo "$SIMILAR_DOCS" | tr '\n' ' ')"
                DUPLICATIONS_FOUND=true
              fi
            fi
          done
        fi
        
        # Verificar comandos duplicados (líneas que empiezan con comandos comunes)
        NEW_COMMANDS=$(grep -E "^[[:space:]]*(\`\`\`|npm |git |curl |docker |kubectl )" "$DOC_FILE" 2>/dev/null | head -5)
        
        if [ ! -z "$NEW_COMMANDS" ]; then
          echo "$NEW_COMMANDS" | while IFS= read -r COMMAND; do
            CLEAN_COMMAND=$(echo "$COMMAND" | sed 's/^[[:space:]]*//' | cut -c1-50)
            
            if [ ${#CLEAN_COMMAND} -gt 15 ]; then
              # Buscar comando similar en otros documentos
              SIMILAR_COMMAND_DOCS=$(find . -name "*.md" -not -path "./$DOC_FILE" -not -path "./.git/*" | \
                                   xargs grep -l -F "$CLEAN_COMMAND" 2>/dev/null | head -2)
              
              if [ ! -z "$SIMILAR_COMMAND_DOCS" ]; then
                echo "      ⚠️  Comando posiblemente duplicado: '$CLEAN_COMMAND'"
                echo "         También en: $(echo "$SIMILAR_COMMAND_DOCS" | tr '\n' ' ')"
              fi
            fi
          done
        fi
      fi
    done
    
    if [ "$DUPLICATIONS_FOUND" = false ]; then
      echo "   ✅ No se detectaron duplicaciones obvias en documentación"
      VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    else
      echo "   ⚠️  Se detectaron posibles duplicaciones - revisar manualmente"
      RECOMMENDATIONS+=("Revisar si la nueva documentación duplica contenido existente")
      RECOMMENDATIONS+=("Considerar actualizar documentos existentes en lugar de crear nuevos")
      RECOMMENDATIONS+=("Verificar que comandos documentados no estén ya explicados en otro lugar")
    fi
  else
    echo "   ✅ Sin archivos .md modificados detectados"
    VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
  fi
else
  echo "   ✅ Sin archivos de documentación en este PR"
  VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
fi

# Validación 5: Contexto de Comentarios del Issue
echo ""
echo "5️⃣ Contexto de Comentarios del Issue:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

if [ ! -z "$RELATED_ISSUES" ]; then
  MAIN_ISSUE_NUM=$(echo $RELATED_ISSUES | cut -d' ' -f1 | sed 's/#//')
  
  if [ -f ".claude/temp/issue-$MAIN_ISSUE_NUM-context.json" ]; then
    # Leer contexto de comentarios
    TESTING_REPORTED=$(jq -r '.testing_reported' .claude/temp/issue-$MAIN_ISSUE_NUM-context.json)
    DECISIONS_DOCUMENTED=$(jq -r '.decisions_documented' .claude/temp/issue-$MAIN_ISSUE_NUM-context.json)
    BLOCKERS_RESOLVED=$(jq -r '.blockers_resolved' .claude/temp/issue-$MAIN_ISSUE_NUM-context.json)
    ADDITIONAL_REQUIREMENTS=$(jq -r '.additional_requirements' .claude/temp/issue-$MAIN_ISSUE_NUM-context.json)
    ENDPOINTS_MENTIONED=$(jq -r '.endpoints_mentioned' .claude/temp/issue-$MAIN_ISSUE_NUM-context.json)
    
    CONTEXT_SCORE=0
    CONTEXT_TOTAL=3
    
    # Evaluar si el PR refleja lo discutido en comentarios
    if [ "$TESTING_REPORTED" = "true" ]; then
      echo "   ✅ Testing fue reportado en comentarios del issue"
      CONTEXT_SCORE=$((CONTEXT_SCORE + 1))
      
      # Verificar si el PR menciona este testing
      if echo "$PR_BODY" | grep -qi -E "(test|probado|validado|verificado)"; then
        echo "   ✅ PR menciona testing/validación realizada"
      else
        echo "   ⚠️  PR no menciona testing reportado en issue"
        RECOMMENDATIONS+=("Incluir información sobre testing realizado en descripción del PR")
      fi
    else
      echo "   ℹ️  No se reportó testing específico en comentarios"
      CONTEXT_SCORE=$((CONTEXT_SCORE + 1))
    fi
    
    if [ "$DECISIONS_DOCUMENTED" = "true" ]; then
      echo "   ✅ Decisiones importantes documentadas en comentarios"
      CONTEXT_SCORE=$((CONTEXT_SCORE + 1))
    else
      echo "   ℹ️  Sin decisiones importantes en comentarios"
      CONTEXT_SCORE=$((CONTEXT_SCORE + 1))
    fi
    
    if [ "$ADDITIONAL_REQUIREMENTS" = "detected" ]; then
      echo "   ⚠️  Se detectaron requirements adicionales en comentarios"
      echo "       Verificar que el PR los incluya"
      RECOMMENDATIONS+=("Revisar comentarios del issue para requirements adicionales mencionados")
    else
      echo "   ✅ Sin requirements adicionales detectados"
      CONTEXT_SCORE=$((CONTEXT_SCORE + 1))
    fi
    
    # Verificar endpoints mencionados
    if [ "$ENDPOINTS_MENTIONED" != "null" ] && [ ! -z "$ENDPOINTS_MENTIONED" ]; then
      echo "   🔗 Endpoints mencionados en issue: $ENDPOINTS_MENTIONED"
      OBSERVATIONS+=("Issue menciona endpoints específicos - verificar que sean los correctos")
    fi
    
    if [ $CONTEXT_SCORE -eq $CONTEXT_TOTAL ]; then
      echo "   ✅ PR alineado con contexto de comentarios del issue"
      VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    else
      echo "   ⚠️  Revisar alineación con comentarios del issue ($CONTEXT_SCORE/$CONTEXT_TOTAL)"
    fi
  else
    echo "   ℹ️  Sin contexto de comentarios disponible"
    VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
  fi
else
  echo "   ⚠️  Sin issues relacionados para analizar contexto"
fi

# Validación 6: Convenciones del Proyecto
echo ""
echo "6️⃣ Convenciones del Proyecto:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

# Verificar estructura de carpetas
FOLLOWS_STRUCTURE=true
if echo "$CHANGED_FILES" | grep -q "iac/" && [ -d "iac/" ]; then
  echo "   ✅ Sigue estructura de carpetas (iac/)"
elif echo "$CHANGED_FILES" | grep -q "doc/" && [ -d "doc/" ]; then
  echo "   ✅ Sigue estructura de carpetas (doc/)"
elif echo "$CHANGED_FILES" | grep -q "apps/" && [ -d "apps/" ]; then
  echo "   ✅ Sigue estructura de carpetas (apps/)"
else
  echo "   ✅ Estructura de carpetas respetada"
fi

VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))

# Validación 7: Cumplimiento de Guías de Diseño/UI (Solo si hay cambios frontend)
echo ""
echo "7️⃣ Cumplimiento de Guías de Diseño/UI:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

if [ $FRONTEND_FILES -gt 0 ]; then
  echo "   🎨 Detectados cambios frontend - Verificando cumplimiento de guías de diseño..."
  
  # Buscar documentación de design system/guías de UI
  DESIGN_DOCS=$(find . doc/ docs/ -name "*.md" | xargs grep -l -i -E "(design.*system|style.*guide|ui.*guide|component.*guide|frontend.*guide)" 2>/dev/null | head -3)
  
  if [ ! -z "$DESIGN_DOCS" ]; then
    echo "   📋 Guías de diseño encontradas:"
    echo "$DESIGN_DOCS" | while IFS= read -r DOC; do
      echo "      - $DOC"
    done
    echo ""
    echo "   🔍 Verificando cumplimiento de guías..."
    
    DESIGN_ISSUES=()
    
    # Analizar archivos frontend modificados
    COMPONENT_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(tsx|jsx|ts|js|css|scss|less)$")
    if [ ! -z "$COMPONENT_FILES" ]; then
      echo "   📝 Archivos frontend a revisar:"
      echo "$COMPONENT_FILES" | while IFS= read -r FILE; do
        echo "      - $FILE"
      done
      echo ""
      
      # Verificaciones genéricas de buenas prácticas
      echo "   ⚙️  Verificaciones automáticas:"
      
      echo "$COMPONENT_FILES" | while IFS= read -r FILE; do
        if [ -f "$FILE" ]; then
          FILE_ISSUES=()
          
          # Verificar colores hardcoded
          if grep -q -E "#[0-9a-fA-F]{3,6}|rgb\(|rgba\(" "$FILE" 2>/dev/null; then
            FILE_ISSUES+=("Colores hardcoded encontrados - considerar usar design tokens")
          fi
          
          # Verificar definiciones de fuentes inline
          if grep -q -E "font-family.*:|fontFamily.*:" "$FILE" 2>/dev/null; then
            FILE_ISSUES+=("Definiciones de fuentes inline - verificar si siguen guías corporativas")
          fi
          
          # Verificar estilos inline extensos
          INLINE_STYLES=$(grep -c "style=" "$FILE" 2>/dev/null || echo "0")
          if [ "$INLINE_STYLES" -gt 5 ]; then
            FILE_ISSUES+=("Muchos estilos inline ($INLINE_STYLES) - considerar CSS externo o design tokens")
          fi
          
          # Mostrar issues encontrados
          if [ ${#FILE_ISSUES[@]} -gt 0 ]; then
            echo "      ⚠️  $FILE:"
            for issue in "${FILE_ISSUES[@]}"; do
              echo "         - $issue"
              DESIGN_ISSUES+=("$FILE: $issue")
            done
          else
            echo "      ✅ $FILE: Sin issues obvios detectados"
          fi
        fi
      done
    fi
    
    # Verificar ubicación de componentes (si aplica estructura de apps)
    NEW_COMPONENTS=$(echo "$CHANGED_FILES" | grep -E "/components/.*\.(tsx|jsx)$")
    if [ ! -z "$NEW_COMPONENTS" ] && [ -d "apps" ]; then
      echo ""
      echo "   📂 Verificando ubicación de componentes:"
      SHARED_COMPONENTS=$(echo "$NEW_COMPONENTS" | grep "/shared/")
      APP_SPECIFIC=$(echo "$NEW_COMPONENTS" | grep -v "/shared/")
      
      if [ ! -z "$APP_SPECIFIC" ]; then
        echo "      ℹ️  Componentes en apps específicas:"
        echo "$APP_SPECIFIC" | while IFS= read -r COMP; do
          echo "         - $COMP"
        done
        DESIGN_ISSUES+=("Evaluar si componentes nuevos podrían ser reutilizables en /shared")
      fi
      
      if [ ! -z "$SHARED_COMPONENTS" ]; then
        echo "      ✅ Componentes en /shared: $(echo "$SHARED_COMPONENTS" | wc -l)"
      fi
    fi
    
    # Resultado final
    if [ ${#DESIGN_ISSUES[@]} -eq 0 ]; then
      echo ""
      echo "   ✅ Cambios frontend cumplen verificaciones automáticas"
      VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    else
      echo ""
      echo "   ⚠️  Issues detectados que requieren revisión manual:"
      OBSERVATIONS+=("DISEÑO: Revisar cumplimiento de guías en archivos frontend modificados")
      RECOMMENDATIONS+=("Consultar guías de diseño encontradas: $(echo "$DESIGN_DOCS" | tr '\n' ', ' | sed 's/,$//')")
      RECOMMENDATIONS+=("Verificar manualmente que cambios frontend siguen estándares del proyecto")
      RECOMMENDATIONS+=("Considerar correcciones menores o consultar con el equipo si son cambios mayores")
    fi
  else
    echo "   ⚠️  No se encontraron guías de diseño específicas"
    echo "   📝 Ubicaciones sugeridas para buscar guías:"
    echo "      - doc/design-system.md"
    echo "      - doc/ui-guidelines.md"
    echo "      - doc/frontend-architecture.md"
    echo "      - apps/shared/src/styles/README.md"
    OBSERVATIONS+=("Sin guías de diseño encontradas - revisar manualmente cumplimiento de estándares")
    RECOMMENDATIONS+=("Crear o ubicar documentación de guías de diseño para futuras validaciones")
  fi
else
  echo "   ✅ Sin cambios frontend detectados"
  VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
fi

# Validación 8: Análisis de Nuevas Dependencias
echo ""
echo "8️⃣ Análisis de Nuevas Dependencias:"
VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

# Verificar si hay cambios en archivos de dependencias
DEPENDENCY_FILES=$(echo "$CHANGED_FILES" | grep -E "(package\.json|package-lock\.json|yarn\.lock|requirements\.txt|Pipfile|go\.mod|composer\.json|Cargo\.toml)")

if [ ! -z "$DEPENDENCY_FILES" ]; then
  echo "   📦 Detectados cambios en dependencias - Analizando..."
  
  # Verificar package.json si existe
  if echo "$DEPENDENCY_FILES" | grep -q "package\.json"; then
    echo "   🔍 Analizando cambios en package.json..."
    
    # Obtener diff del archivo para ver qué se agregó
    NEW_DEPS=$(gh pr diff $PR_NUMBER -- package.json | grep "^+" | grep -E "\"[^\"]+\":" | head -10)
    
    if [ ! -z "$NEW_DEPS" ]; then
      echo "   📦 Nuevas dependencias detectadas:"
      echo "$NEW_DEPS" | while IFS= read -r DEP; do
        # Extraer nombre del paquete
        PACKAGE_NAME=$(echo "$DEP" | grep -oE "\"[^\"]+\"" | head -1 | tr -d '"')
        if [ ! -z "$PACKAGE_NAME" ]; then
          echo "      - $PACKAGE_NAME"
          
          # Verificar si ya existe funcionalidad similar
          SIMILAR_DEPS=$(grep -r "$PACKAGE_NAME\|$(echo $PACKAGE_NAME | cut -d'-' -f1)" package.json 2>/dev/null | grep -v "^package\.json:" | head -3)
          if [ ! -z "$SIMILAR_DEPS" ]; then
            echo "         ⚠️  Posible funcionalidad similar ya existente"
            OBSERVATIONS+=("DEPENDENCIA: $PACKAGE_NAME - verificar si no duplica funcionalidad existente")
          fi
          
          # Verificar si está en la documentación de arquitectura
          if [ ! -z "$ARCH_DOCS" ]; then
            MENTIONED_IN_ARCH=$(echo "$ARCH_DOCS" | xargs grep -l "$PACKAGE_NAME" 2>/dev/null)
            if [ ! -z "$MENTIONED_IN_ARCH" ]; then
              echo "         ✅ Mencionado en documentación de arquitectura"
            else
              echo "         ⚠️  No mencionado en documentación de arquitectura"
              OBSERVATIONS+=("DEPENDENCIA: $PACKAGE_NAME - considerar documentar en arquitectura si es significativo")
            fi
          fi
        fi
      done
      
      # Recomendaciones generales para nuevas dependencias
      RECOMMENDATIONS+=("Validar que nuevas dependencias son realmente necesarias")
      RECOMMENDATIONS+=("Verificar que no duplican funcionalidad existente en el proyecto")
      RECOMMENDATIONS+=("Considerar el impacto en bundle size y seguridad")
      RECOMMENDATIONS+=("Documentar decisiones de nuevas dependencias si son significativas")
    else
      echo "   ✅ Solo cambios menores en package.json (versiones, etc.)"
      VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    fi
  else
    echo "   ✅ Cambios en dependencias parecen rutinarios"
    VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
  fi
else
  echo "   ✅ Sin cambios en dependencias detectados"
  VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
fi

echo ""
```

### 5. Generación de Reporte Final

**Crear reporte de validación:**
```bash
echo "📋 REPORTE DE VALIDACIÓN - PR #$PR_NUMBER"
echo "================================================="
echo ""

# Calcular porcentaje de cumplimiento
if [ $VALIDATIONS_TOTAL -gt 0 ]; then
  PERCENTAGE=$((VALIDATIONS_PASSED * 100 / VALIDATIONS_TOTAL))
else
  PERCENTAGE=0
fi

echo "📊 Resumen: $VALIDATIONS_PASSED/$VALIDATIONS_TOTAL validaciones pasaron ($PERCENTAGE%)"

if [ $PERCENTAGE -ge 80 ]; then
  echo "🎯 Estado: ✅ EXCELENTE - Listo para review"
elif [ $PERCENTAGE -ge 60 ]; then
  echo "🎯 Estado: ⚠️  BUENO - Algunas mejoras recomendadas"
else
  echo "🎯 Estado: ❌ REQUIERE ATENCIÓN - Varios elementos por corregir"
fi

echo ""

# Mostrar observaciones si las hay
if [ ${#OBSERVATIONS[@]} -gt 0 ]; then
  echo "👀 Observaciones:"
  for obs in "${OBSERVATIONS[@]}"; do
    echo "   ℹ️  $obs"
  done
  echo ""
fi

# Mostrar recomendaciones si las hay
if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
  echo "💡 Recomendaciones:"
  for rec in "${RECOMMENDATIONS[@]}"; do
    echo "   📝 $rec"
  done
  echo ""
fi

# Contexto del issue principal si existe
if [ ! -z "$RELATED_ISSUES" ]; then
  MAIN_ISSUE=$(echo $RELATED_ISSUES | cut -d' ' -f1)
  ISSUE_NUM=$(echo $MAIN_ISSUE | sed 's/#//')
  
  if [ -f ".claude/temp/issue-$ISSUE_NUM-info.json" ]; then
    ISSUE_TITLE=$(jq -r '.title' .claude/temp/issue-$ISSUE_NUM-info.json)
    echo "🎯 Contexto del Issue Principal ($MAIN_ISSUE):"
    echo "   \"$ISSUE_TITLE\""
    echo ""
  fi
fi

echo "🔗 PR: $(gh pr view $PR_NUMBER --json url --jq '.url')"
echo ""

# Limpieza de archivos temporales
rm -f .claude/temp/issue-*-info.json 2>/dev/null
rm -f .claude/temp/issue-*-context.json 2>/dev/null

# Determinación del veredicto final
VERDICTO=""
if [ $PERCENTAGE -ge 70 ] && [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
  VEREDICTO="✅ APROBADO: PR cumple todos los estándares de calidad"
  
elif [ $PERCENTAGE -ge 50 ]; then
  VEREDICTO="⚠️  CONDICIONAL: PR requiere ajustes menores antes del review"
  
else
  VEREDICTO="❌ RECHAZADO: PR requiere correcciones significativas"
  
fi

echo "$VEREDICTO"
echo ""

# IMPORTANTE: Preguntar interactivamente si agregar comentario
# NO automatizar esta decisión - siempre preguntar al usuario
echo "💬 ¿Desea agregar este reporte como comentario en el PR? (y/n)"
read -r ADD_COMMENT

if [ "$ADD_COMMENT" = "y" ] || [ "$ADD_COMMENT" = "Y" ]; then
    # Crear comentario con el reporte de validación
    VALIDATION_COMMENT="## 📋 Reporte de Validación Automática

**Resultado:** $VERDICTO

**📊 Resumen:** $VALIDATIONS_PASSED/$VALIDATIONS_TOTAL validaciones pasaron ($PERCENTAGE%)"
    
    if [ ${#OBSERVATIONS[@]} -gt 0 ]; then
      VALIDATION_COMMENT="$VALIDATION_COMMENT

**👀 Observaciones:**"
      for obs in "${OBSERVATIONS[@]}"; do
        VALIDATION_COMMENT="$VALIDATION_COMMENT
- $obs"
      done
    fi
    
    if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
      VALIDATION_COMMENT="$VALIDATION_COMMENT

**💡 Recomendaciones:**"
      for rec in "${RECOMMENDATIONS[@]}"; do
        VALIDATION_COMMENT="$VALIDATION_COMMENT
- $rec"
      done
    fi
    
    VALIDATION_COMMENT="$VALIDATION_COMMENT

---
*Validación automática realizada por [/validate-pr](.claude/commands/validate-pr.md)*"
    
    # Agregar comentario al PR
    gh pr comment $PR_NUMBER --body "$VALIDATION_COMMENT"
fi
```

## Características

- **Análisis de Contexto Completo**: Compara PR con issues relacionados, comentarios y documentación
- **Detección Automática**: Usa GraphQL para detectar relaciones PR-Issue que GitHub identifica automáticamente
- **Análisis de Comentarios**: Extrae testing reportado, decisiones y requirements de comentarios del issue
- **Validación de Proceso**: Enfocado en cumplimiento de estándares y alineación con objetivos del proyecto
- **Comentario Automático**: Opción de agregar reporte como comentario en el PR para seguimiento
- **Reporte Claro**: Output estructurado con porcentajes y recomendaciones específicas
- **Detección Inteligente**: Identifica endpoints, testing y requirements adicionales mencionados
- **Escalable**: Base sólida para agregar más validaciones en futuras versiones
- **Rápido**: Proceso completo en ~30 segundos

## Uso

```bash
/validate-pr 16
```

## Output Ejemplo

```
📋 Analizando Issue #1:
  - Título: Desplegar Infraestructura AWS
  - Estado: CLOSED
  - Labels: infrastructure,backend
  - Comentarios: 3
  📝 Analizando comentarios del issue...
     ✅ Testing/validación reportado en comentarios
     🔗 URLs/endpoints mencionados: https://api.esenciafest.com/health
     📋 Decisiones/cambios importantes documentados en comentarios

📋 REPORTE DE VALIDACIÓN - PR #16
=================================

📊 Resumen: 4/5 validaciones pasaron (80%)
🎯 Estado: ✅ EXCELENTE - Listo para review

4️⃣ Contexto de Comentarios del Issue:
   ✅ Testing fue reportado en comentarios del issue
   ✅ PR menciona testing/validación realizada
   ✅ Decisiones importantes documentadas en comentarios
   🔗 Endpoints mencionados en issue: https://api.esenciafest.com/health
   ✅ PR alineado con contexto de comentarios del issue

🎯 Contexto del Issue Principal (#1):
   "Desplegar Infraestructura AWS"

🔗 PR: https://github.com/repo/pull/16

✅ VEREDICTO: PR APROBADO - Cumple todos los estándares de calidad
```