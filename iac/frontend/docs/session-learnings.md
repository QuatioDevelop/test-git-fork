# Sesión 2024-12-02 - Implementación de CloudFront

## Estado Actual y Próximos Pasos

### Estado Actual
- ✅ S3 Bucket configurado y funcionando
- ✅ CloudFront template desplegado
- ✅ Estructura de archivos y parámetros reorganizada
- ✅ Scripts de eliminación mejorados
- ❌ Pruebas de CloudFront pendientes
- ❌ Archivos de prueba no subidos al bucket

### Tarea Inmediata
Completar pruebas de CloudFront:
1. Subir archivos de prueba:
   - `test/index.html`
   - `test/404.html`
   - `test/403.html`
2. Verificar funcionalidad HTTPS
3. Probar comportamiento de caché
4. Validar páginas de error

### Archivos Principales Relevantes
- CloudFront Template: `templates/nested/cloudfront.yaml`
- Parámetros Ambiente: `environments/dev.json`
- Archivos de Prueba: `test/*.html`

## Decisiones Pendientes
1. **Monitoreo**:
   - Definir métricas críticas a monitorear
   - Establecer umbrales de alertas
   - Determinar periodicidad de revisión

2. **Validaciones**:
   - Confirmar si los TTLs configurados son apropiados
   - Verificar si se necesitan headers de seguridad adicionales
   - Evaluar necesidad de WAF en esta fase

3. **Optimizaciones**:
   - Considerar ajustes en la configuración de caché por tipo de contenido
   - Evaluar necesidad de compresión adicional
   - Revisar configuración de logs

## Detalles Técnicos Aprendidos

### CloudFront Configuration
1. **Price Classes y Edge Locations**:
   - Price Class 200 incluye Norteamérica, Europa, Asia, Medio Oriente, África y Sudamérica
   - Para Colombia, las edge locations más relevantes están en São Paulo y Bogotá
   - No es necesario usar Price Class All (que incluye Australia/NZ) si el público objetivo está en LATAM

2. **Origin Configuration**:
   - Para S3 Website endpoints, se debe usar CustomOrigin en lugar de S3Origin
   - El formato del dominio es importante: `${BucketName}.s3-website-${AWS::Region}.amazonaws.com`
   - Se requiere `OriginProtocolPolicy: http-only` para S3 website endpoints

3. **Cache Behaviors**:
   - DefaultTTL: 3600 (1 hora) es un buen punto de partida para contenido HTML
   - MaxTTL: 86400 (1 día) previene cachés demasiado largos
   - Compress: true habilita tanto Brotli como GZIP automáticamente

### CloudFormation Best Practices
1. **Exports**:
   - Los exports deben mantenerse en los stacks anidados y no en el principal
   - Los nombres de exports deben incluir ProjectName y Environment para evitar conflictos
   - Los exports no se pueden sobrescribir, requieren eliminar el stack anterior

2. **Stack Dependencies**:
   - Usar DependsOn para asegurar el orden correcto de creación
   - Los parámetros entre stacks deben pasarse usando !GetAtt para referencias dinámicas

### Errores y Soluciones
1. **Eliminación de Recursos**:
   - Buckets con versionamiento requieren eliminar todas las versiones antes del bucket
   - Buckets de logs suelen no tener versionamiento y requieren un enfoque diferente
   - Error "Invalid version id specified" ocurre al intentar eliminar versiones en buckets no versionados

2. **CloudFront Errors**:
   - Error 404 con "NoSuchKey" en error.html indica falta de archivos de error personalizados
   - La propagación de cambios en CloudFront puede tomar 15-20 minutos

## Consideraciones de Diseño
1. **Estructura de Archivos**:
   - Parámetros de ambiente consolidados en JSON por ambiente
   - Evitar subdirectorios innecesarios en environments/
   - Templates anidados para mejor modularización

2. **Seguridad y Performance**:
   - ViewerProtocolPolicy: redirect-to-https para forzar HTTPS
   - Compresión habilitada por defecto para mejor rendimiento
   - Cache behaviors configurados según tipo de contenido

## Scripts y Automatización
1. **Mejoras en Scripts**:
   - Verificar tipo de bucket antes de intentar limpiarlo
   - Manejar diferentes estrategias para buckets versionados y no versionados
   - Mejorar manejo de errores y logging

2. **Parámetros y Variables**:
   - Usar archivos JSON unificados por ambiente
   - Incluir tags consistentes en todos los recursos
   - Mantener nombres de recursos coherentes

## Guía de Archivos del Proyecto

### Archivos de Configuración
- `.env`: Archivo de variables de entorno activas
- `.env.example`: Plantilla de variables de entorno requeridas
- `.gitignore`: Lista de archivos y directorios excluidos del control de versiones

### Directorios Principales
- `docs/`: Documentación del proyecto
  - `architecture.md`: Documentación detallada de la arquitectura
  - `session-learnings.md`: (Este archivo) Registro de aprendizajes y decisiones
- `environments/`: Configuraciones por ambiente
  - `dev.json`: Parámetros para ambiente de desarrollo
- `scripts/`: Scripts de automatización para despliegue y mantenimiento
- `templates/`: Plantillas de CloudFormation
  - `main.yaml`: Template principal que orquesta los stacks anidados
  - `nested/`: Templates modulares para cada componente
    - `s3.yaml`: Configuración de buckets S3
    - `cloudfront.yaml`: Configuración de distribución CloudFront
- `test/`: Archivos de prueba para validar la infraestructura

### Archivos de Seguimiento
- `PROGRESS.md`: Registro detallado del avance del proyecto
- `README.md`: Documentación principal del proyecto

## Próximos Pasos Técnicos
1. Completar pruebas de CloudFront
2. Implementar monitoreo con CloudWatch
3. Configurar alarmas para métricas clave
4. Considerar agregar WAF para seguridad adicional
5. Implementar pruebas automatizadas de la infraestructura