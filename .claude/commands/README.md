# Claude Commands

Sistema de comandos para gestión automatizada de proyectos y tareas.

## Comandos Disponibles

### 📋 Master Plan
Para funcionalidades grandes que requieren múltiples issues:
- `/master-plan:draft "Nombre"` → `draft-plan-nombre.md`
- `/master-plan:detail draft-plan-nombre.md` → `detailed-plan-nombre.md`  
- `/master-plan:deploy detailed-plan-nombre.md` → Issues en GitHub

### 🎯 Issue Workflow  
Para trabajar en issues específicos:
- `/issue:plan 123` → `issue-plan-123.md`
- `/issue:start-work issue-plan-123.md` → Rama + tracking
- `/issue:commit` → Commits inteligentes
- `/issue:save-progress` → Actualiza plan con progreso
- `/issue:submit-work` → PR en GitHub
- `/issue:validate-pr {pr-number}` → Reporte de validación

## Flujo de Trabajo

### Nueva Funcionalidad Compleja
```bash
# 1. Crear borrador (puedes incluir docs de referencia)
/master-plan:draft "Nombre de la funcionalidad"

# 2. Revisar y pulir draft-plan-nombre.md si es necesario

# 3. Detallar plan
/master-plan:detail draft-plan-nombre.md

# 4. Revisar y pulir detailed-plan-nombre.md si es necesario

# 5. Crear issues en GitHub
/master-plan:deploy detailed-plan-nombre.md

# Luego trabajar cada issue creado individualmente
```

### Issue Específico
```bash
# 1. Planificar
/issue:plan 123

# 2. Revisar y pulir issue-plan-123.md si es necesario

# 3. Iniciar trabajo  
/issue:start-work issue-plan-123.md

# 4. Implementar
# Ejecutar plan: Copiar contenido de .claude/artifact-temp/issue-plan-123.md
# y pasarlo al contexto para que Claude lo ejecute

# 5. Durante el desarrollo
/issue:commit  # Commits inteligentes
/issue:save-progress  # Actualizar plan con progreso (periódicamente)

# 6. Pausar trabajo (opcional)
/clear  # Limpiar contexto de Claude
# O cerrar Claude si necesitas parar

# 7. Retomar trabajo
# "Continuemos con la implementación del issue #123"
# Adjuntar: .claude/artifact-temp/issue-plan-123.md (ya tiene el progreso actualizado)

# 8. Finalizar y crear PR
/issue:submit-work

# 9. Validar antes del merge
/issue:validate-pr {pr-number}
```

## Archivos de Trabajo

Los comandos generan planes ejecutables en `.claude/artifact-temp/` (del proyecto):
- `draft-plan-nombre.md` - Borrador de master plan
- `detailed-plan-nombre.md` - Plan maestro detallado
- `issue-plan-123.md` - Plan detallado para implementar
- `current-work.json` - Tracking del trabajo actual

**💡 Proceso**: Los outputs se pueden revisar y pulir antes de usarlos como input del siguiente comando. Para ejecutar un plan con AI, copia el contenido del archivo `.md` y pégalo en el contexto.

**📄 Master Plan Draft**: Puedes incluir referencias a documentación existente o pegar documentos con especificaciones de la funcionalidad.

**🔄 Save Progress**: Actualiza el plan existente con una sección de progreso (no crea archivos nuevos). El plan queda listo para retomar trabajo con contexto completo.

**↩️ Retomar Trabajo**: Después de `/clear` o cerrar Claude, usa: *"Continuemos con la implementación del issue #123"* + adjuntar el plan actualizado.

## Características

- **Automático**: Detecta contexto del repositorio y GitHub
- **Inteligente**: Genera commits y PRs basados en cambios reales  
- **Integrado**: Maneja estados de issues y project boards
- **Flexible**: Funciona con cualquier repositorio sin configuración