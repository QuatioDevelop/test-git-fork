# Plan para Issue #63: feat: Implementar CDN para contenido Genially y assets multimedia

## 📊 Progreso Actual (Actualizado: 2025-07-17 11:28:15)

### ✅ Trabajo Completado
- **Commits realizados**: 1
- **Archivos modificados**: 2  
- **Rama de trabajo**: `feature/issue-63-cdn-assets-infrastructure`

#### Commits recientes:
- 67bdb62 chore: bump version to 0.3.11 for issue #63 development

#### Archivos trabajados:
- package-lock.json
- package.json

### 🔄 Trabajo en Progreso
#### Cambios unstaged (en desarrollo):
- iac/backend/dev.toml
- iac/backend/src/package.json
- iac/backend/template.yaml

### 📋 Progreso de Implementación (Issue #63)
#### ✅ Completado:
- [x] Configuración inicial de la rama
- [x] Bump de versión a 0.3.11
- [x] Análisis de dependencias existentes en iac/backend/src/
- [x] Implementación de S3 Assets Bucket en SAM template
- [x] Implementación de CloudFront Distribution
- [x] Configuración de IAM Policies para S3 y Lambda
- [x] Creación de Lambda function para presigned URLs (`presigned-urls.js`)
- [x] Actualización de SAM template con nueva función
- [x] Agregado de dependencias @aws-sdk/client-s3 y @aws-sdk/s3-request-presigner
- [x] Configuración de capabilities CAPABILITY_NAMED_IAM en dev.toml
- [x] Validación de SAM template (sam validate)
- [x] Build de SAM application exitoso
- [x] Debugging y corrección de errores de deployment:
  - [x] S3 Bucket Policy ARN corregido
  - [x] CloudFront aliases removidos temporalmente
  - [x] Lambda IAM Policy ARN corregido

#### 🔄 En Progreso:
- [ ] Deploy y test en dev environment (CloudFormation rollback en curso, esperando para nuevo deploy)
- [ ] Validación de infraestructura completa (pendiente)

#### ⚠️ Errores Detectados y Corregidos:
1. **S3 Bucket Policy ARN**: Faltaba `arn:aws:s3:::` en el resource - ✅ CORREGIDO
2. **CloudFront Certificate**: No hay certificado SSL para custom domains - ✅ REMOVIDO temporalmente
3. **Lambda IAM Policy**: Resource ARN mal formateado - ✅ CORREGIDO

#### 📝 Notas de Implementación:
- Se removió temporalmente el custom domain (assets.dev.esenciafest.com) para permitir el deploy inicial
- CloudFront Distribution configurada con certificado por defecto (CloudFrontDefaultCertificate: true)
- S3 bucket con políticas de acceso para CloudFront (ARN corregido)
- Lambda function implementada con validación de tipos de archivo
- Presigned URLs configuradas para 15 minutos de expiración
- **Stack Status**: UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS (esperando finalización)

#### 🔧 Configuración Técnica:
- **S3 Bucket**: `esenciafest-2025-assets-dev`
- **CloudFront**: Distribución con SSL por defecto
- **Lambda**: `esenciafest-2025-presigned-url-dev`
- **Endpoint**: `/uploads/presigned-url`
- **Tipos permitidos**: images, videos, HTML, documents

#### 🎯 Próximos Pasos Inmediatos:
**Para completar el deployment básico:**
1. Esperar que termine el rollback de CloudFormation (UPDATE_ROLLBACK_COMPLETE)
2. Ejecutar nuevo deploy con las correcciones aplicadas
3. Validar que la infraestructura se cree correctamente
4. Probar el endpoint `/uploads/presigned-url`
5. Documentar las URLs de CloudFront resultantes

#### 🎯 Próximos Pasos para Custom Domains:
**Para agregar custom domains después del deploy inicial:**
1. Crear certificado SSL para `assets.esenciafest.com` y `*.assets.esenciafest.com` en ACM (us-east-1)
2. Modificar template para usar certificado y aliases (descomentar secciones)
3. Configurar CNAMEs en CloudFlare:
   - **Dev**: `assets.dev.esenciafest.com`
   - **Staging**: `assets.staging.esenciafest.com`
   - **Prod**: `assets.esenciafest.com`

#### 🐛 Debugging Information:
**Errores encontrados durante el deployment:**
```
AssetsBucketPolicy: Policy has invalid resource - faltaba arn:aws:s3:::
AssetsCloudFront: Certificate doesn't cover alternate domain name
PresignedUrlFunctionRole: Resource must be in ARN format
```

**Archivos modificados para corregir:**
- `iac/backend/template.yaml` - Líneas 152, 199, 392 (ARN corrections)
- `iac/backend/dev.toml` - Línea 10 (capabilities)
- `iac/backend/src/package.json` - Líneas 14-15 (S3 dependencies)

---

**Fecha de Análisis**: 2025-07-17 19:52
**Estado del Issue**: open
**Labels**: infrastructure

## Clasificación: COMPLEJO

**Criterios de Clasificación Aplicados:**
- **Nueva infraestructura AWS**: Requiere S3 + CloudFront + IAM policies
- **Integración multi-componente**: SAM template, Lambda functions, DNS configuration
- **Arquitectura serverless**: Nuevos recursos en template existente 
- **Dependencias externas**: CloudFlare DNS, SSL certificates
- **Resultado**: COMPLEJO porque involucra múltiples servicios AWS, cambios de infraestructura, y configuración multi-ambiente

## Análisis del Issue

**Descripción del Problema:**
Implementar el CDN de assets faltante (S3 + CloudFront) en el deployment SAM backend para servir contenido Genially y multimedia, completando la arquitectura planificada.

El problema técnico identificado es que Next.js development server bloquea archivos `.html` en `public/`, impidiendo servir contenido Genially desde el frontend.

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: AWS SAM + Node.js 18.x
- Infraestructura: AWS CloudFormation + S3 + CloudFront + Lambda
- Package Manager: npm 
- Arquitectura: AWS Serverless + Multi-ambiente (dev/staging/prod)

**Estado Actual:**
- Trabajo en progreso: No
- Archivos afectados: iac/backend/template.yaml, iac/backend/src/
- Issues similares: #9 (Genially validation - origen del problema)

**Impacto:**
- Frontend: Sí (GeniallyEmbed component)
- Backend: Sí (nuevo Lambda + S3 presigned URLs)
- Infraestructura: Sí (nuevos recursos AWS)

## Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| SAM Native S3+CF | 3/5 | 5/5 | 5/5 | 5/5 | 2/5 | 20/25 |
| Separate CF Stack | 4/5 | 3/5 | 5/5 | 3/5 | 3/5 | 18/25 |
| CDK Integration | 5/5 | 4/5 | 5/5 | 3/5 | 4/5 | 21/25 |

**Approach Seleccionado:** SAM Native S3+CloudFront (Score: 20/25)

**Justificación:**
Integrar S3 + CloudFront directamente en el template SAM existente mantiene consistencia arquitectural, simplifica el deployment pipeline, y aprovecha las capacidades nativas de SAM para manejar recursos de storage y CDN. Es la opción más mantenible a largo plazo.

**Tecnologías/Paquetes Recomendados:**
- **AWS::S3::Bucket**: Bucket por ambiente para assets
- **AWS::CloudFront::Distribution**: CDN global con SSL
- **AWS::S3::BucketPolicy**: Políticas para presigned URLs
- **AWS::Lambda::Function**: Generación de presigned URLs

**Consideraciones Especiales:**
- **Infraestructura**: Multi-ambiente con naming conventions (esenciafest-2025-assets-{env})
- **Performance**: CloudFront global distribution + S3 optimizations
- **Security**: Presigned URLs con time limits, CORS policies para uploads
- **Compatibility**: Integración con DNS existente en CloudFlare
- **Dependencias**: SSL certificates ya gestionados en infrastructure

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla por DEFAULT 
- **Justificación**: Issue específico con implementación secuencial clara, no requiere trabajo paralelo

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-63-cdn-assets-infrastructure`

### Sub-Issues Necesarios
No aplica - implementación secuencial en rama única

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar dependencies existentes**: Revisar iac/backend/src/package.json para AWS SDK
- [ ] **Analizar template actual**: Entender estructura de Parameters y Resources en template.yaml

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar version actual**: Current version 0.3.10 en package.json
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-63-cdn-assets-infrastructure`
- [ ] **Version bump condicional**: Incrementar a 0.4.0 solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (0.3.10 → 0.4.0)

### Implementación Core

**Infraestructura SAM Template:**
- [ ] **Agregar S3 Assets Bucket**: 
  - [ ] Configurar bucket con naming `${ProjectName}-assets-${Environment}`
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar bucket deployment básico
- [ ] **Implementar CloudFront Distribution**:
  - [ ] Configurar CDN con SSL certificate parameter
  - [ ] Configurar origins para S3 bucket  
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar CDN accesible
- [ ] **Configurar IAM Policies**:
  - [ ] S3 bucket policy para presigned URLs
  - [ ] Lambda execution role permissions
  - [ ] **[Solo si COMPLEJO] Validación intermedia**: Deploy y test básico de permissions

**Lambda Functions:**
- [ ] **Crear presigned URLs function**:
  - [ ] Implementar iac/backend/src/presigned-urls.js
  - [ ] Endpoint POST /uploads/presigned-url
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar endpoint response
- [ ] **Actualizar SAM template**:
  - [ ] Agregar PresignedUrlFunction resource
  - [ ] Configurar API Gateway routes
  - [ ] **[Solo si COMPLEJO] Commit incremental**: Validar API Gateway deployment

### Integración y Finalización

- [ ] **Deploy completo en dev**: Ejecutar `npm run backend:deploy:dev`
- [ ] **Testing de infraestructura**: Validar S3 + CloudFront + Lambda endpoints
- [ ] **Configurar DNS**: 
  - [ ] Documentar CNAME records para CloudFlare
  - [ ] Validar subdominios assets.{env}.esenciafest.com
- [ ] **Validación end-to-end**: Confirmar presigned URLs funcionando
- [ ] **[Solo si COMPLEJO] Commit de integración**: Solo si todas las validaciones pasan
- [ ] **PR final**: Hacer PR de rama principal → main
- [ ] **Cerrar issue principal**: Una vez mergeado el PR final

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Detectar comandos de prueba**: Revisar CLAUDE.md, package.json para comandos backend
- [ ] **Backend validation**: `npm run backend:validate` (SAM template validation)
- [ ] **Backend build**: `npm run backend:build` (SAM build process)
- [ ] **Backend local test**: `npm run backend:local` (si está definido)
- [ ] **Lint**: `npm run lint` (si incluye backend)
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Documentación y Validación

**Análisis de Necesidad de Documentación:**
- [ ] **¿Realmente necesita documentación?**: Sí - nuevos endpoints y deployment steps
- [ ] **Revisar documentación existente**: Actualizar doc/03-arquitectura-alto-nivel.md y CLAUDE.md
- [ ] **Evaluar redundancia**: Complementa documentación arquitectural existente
- [ ] **Principio de concisión**: Documentar endpoints y configuration, no implementación

**Validación de Comandos (SI SE DOCUMENTAN COMANDOS):**
- [ ] **CRÍTICO - Probar cada comando**: Validar comandos de deployment backend
- [ ] **Validar sintaxis**: `npm run backend:deploy:dev` debe funcionar
- [ ] **Probar en entorno real**: Verificar deployment en AWS dev environment
- [ ] **Documentar output esperado**: CloudFront URLs y bucket names
- [ ] **Verificar permisos**: AWS CLI profile requirements

**Principios de Documentación Concisa:**
- [ ] **Solo lo necesario**: Documentar nuevos endpoints y URLs de CDN
- [ ] **Actualizar vs crear**: Actualizar CLAUDE.md con nuevos comandos y URLs
- [ ] **Enfoque en casos de uso**: Cómo usar presigned URLs para uploads
- [ ] **Ejemplos reales**: URLs reales de dev environment
- [ ] **Maintenance burden**: Información que no cambia frecuentemente

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
  - [ ] **Verificar**: Revisar si ya hay version bump en la rama
  - [ ] **Incrementar solo si necesario**: Version bump final (0.3.10 → 0.4.0 al completar issue)
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa SAM validate + build
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

**Filosofía de Trabajo Incremental (Solo Issues COMPLEJOS):**
- Para issues COMPLEJOS: Cada paso de implementación debe incluir validación intermedia
- Hacer commit solo cuando la funcionalidad parcial esté funcionando  
- No avanzar al siguiente paso si hay pruebas fallidas
- Priorizar commits pequeños y funcionales vs commits grandes

*Ejemplos de pasos contextuales:*
- "Implementar S3 bucket con policies básicas para presigned URLs"
- "Configurar CloudFront distribution con SSL para assets.dev.esenciafest.com"
- "Crear Lambda function para generar presigned URLs con validación de tipos"
- "Validar deployment completo end-to-end en ambiente dev"

## Criterios de Aceptación
- [ ] S3 + CloudFront deployados con SAM template en dev environment
- [ ] Presigned URLs endpoint `/uploads/presigned-url` funcional 
- [ ] CloudFront URLs accesibles (assets.dev.esenciafest.com)
- [ ] Configuración multi-ambiente documentada (dev/staging/prod)
- [ ] Tests SAM validate + build pasan correctamente
- [ ] No hay degradación en deployment pipeline existente
- [ ] Documentación actualizada con nuevos endpoints y URLs

## Riesgos Identificados
1. **Dependency en SSL certificates**: CloudFront requiere certificados configurados - Mitigación: usar certificados existentes de frontend infrastructure
2. **CloudFlare DNS configuration**: Requiere configuración manual de CNAMEs - Mitigación: documentar CNAMEs requeridos para cada ambiente
3. **SAM template complexity**: Agregar recursos puede afectar deployments existentes - Mitigación: validar con `sam validate` antes de deploy

## Estimación
- **Complejidad**: 4/5 - Alta (nueva infraestructura AWS multi-servicio)
- **Dependencias Bloqueantes**: SSL certificates (ya existentes), CloudFlare DNS access

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #63 según este plan detallado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-63.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-63.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/63
- Documentación Consultada: doc/03-arquitectura-alto-nivel.md, doc/10-github-workflow.md
- SAM Template: iac/backend/template.yaml
- AWS Services: S3, CloudFront, Lambda, API Gateway