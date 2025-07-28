# Drivers Arquitectónicos - Esencia Fest 2025

## PRIORIZACIÓN Y ANÁLISIS DE DRIVERS

| **Prioridad** | **Driver Arquitectónico** | **Categoría** | **Impacto en Arquitectura** |
|---------------|---------------------------|---------------|------------------------------|
| **CRÍTICO** | Timeline crítico (25 jul - 18 ago) | Negocio | • Serverless<br>• MVP fases<br>• No over-engineering |
| **CRÍTICO** | Concurrencia 500 usuarios simultáneos | Performance | • Plataforma propia de chat<br>• Pruebas de carga previas<br>• Serverless alta respuesta |
| **CRÍTICO** | Dependencias externas | Riesgo | • Fallbacks<br>• Timeouts<br>• Validación MVP1 |
| **CRÍTICO** | Escalabilidad 7,000 usuarios registrados | Performance | • Arquitectura serverless<br>• CDN<br>• Arquitectura desacoplada cliente/servidor |
| **ALTO** | Conectividad multi-región (6 países) | Performance | • CDN principalmente |
| **ALTO** | Posicionamiento interactivo responsive | Técnico | • MVP clave para validación<br>• Integración con React y estados |
| **ALTO** | Chat tiempo real con moderación | Funcional | • chat.quatio.co embebido<br>• Desarrollo independiente del proyecto<br>• Iframe integration |
| **ALTO** | Manejo zonas horarias múltiples | Funcional | • Configuración centralizada<br>• UTC |
| **MEDIO** | Contenido multimedia del cliente | Riesgo | • Vimeo + three.js<br>• Fallback reproductor m3u8/múltiples formatos |
| **MEDIO** | Optimización conexiones variables | Performance | • Infraestructura serverless<br>• Lazy loading (carga diferida) |
| **MEDIO** | Sistema logs y métricas | Funcional | • DynamoDB<br>• Eventos asíncronos |
| **MEDIO** | Almacenamiento local progreso | Funcional | • LocalStorage + sync backend |
| **BAJO** | Disponibilidad durante evento | Calidad | • Configuración básica |
| **BAJO** | Usabilidad responsive 16:9 | Calidad | • react-konva canvas responsive |
| **BAJO** | Seguridad básica (SSL, DDoS) | Restricción | • CloudFlare<br>• Certificados |
| **BAJO** | Políticas corporativas | Negocio | • Configuración dominios<br>• Privacidad |
| **BAJO** | Stack tecnológico preferido | Técnico | • Next.js 15<br>• TanStack Query v5<br>• shadcn/ui<br>• react-konva |

## ATRIBUTOS DE CALIDAD

### Performance
- **Objetivo**: Experiencia de usuario óptima, plataforma liviana y responsiva
- **Criterios**: Carga rápida de contenido multimedia, navegación fluida en ciudadela virtual
- **Chat en tiempo real**: Latencia máxima 2 segundos para 500 usuarios simultáneos

### Disponibilidad
- **Objetivo**: Plataforma disponible durante toda la semana del evento
- **Recuperación**: Resolución rápida de incidentes sin SLA específico
- **Monitoreo**: Detección proactiva de problemas

### Usabilidad
- **Objetivo**: Experiencia de usuario óptima sin especificaciones técnicas detalladas
- **Responsive**: Relación de aspecto fija 16:9 con franjas adaptativas

### Seguridad
- **SSL**: Certificado obligatorio
- **Protección DDoS**: Infraestructura preparada para ataques de denegación de servicio
- **Privacidad**: No almacenar información crítica, evitar envío de correos

## RESTRICCIONES TÉCNICAS

### Tecnologías Obligatorias
- **Vimeo**: Plataforma de video requerida por el cliente
- **Genially**: Para microcursos integrados

### Stack Tecnológico
*Detalle completo en [06-arquitectura-aplicacion-cliente.md](06-arquitectura-aplicacion-cliente.md)*

- **Next.js 15** + React 19 + TypeScript
- **TanStack Query v5** + shadcn/ui + react-konva
- **AWS SAM** + DynamoDB + S3 + CloudFront

### Escalabilidad
- **Usuarios registrados**: Hasta 7,000
- **Concurrencia streaming**: 500 usuarios simultáneos
- **Distribución global**: 6 países con CDN optimizado

## RESTRICCIONES DE NEGOCIO

### Timeline Crítico
- **25 Julio**: Página en construcción + lista de dominios para whitelist
- **18 Agosto**: Semana del evento

### Políticas Corporativas
- No almacenar información crítica
- Evitar envío de correos (prevención suplantación)
- Usar plataformas aprobadas (Vimeo)

## RIESGOS TÉCNICOS PRINCIPALES

### Dependencias Externas
- **Vimeo**: Disponibilidad y performance de videos
- **Genially**: Funcionalidad de embebido para microcursos
- **Mitigación**: MVP temprano con todas las integraciones para validación

### Concurrencia y Performance
- **Pico esperado**: 500 usuarios simultáneos en streaming
- **Mitigación**: Arquitectura serverless con auto-escalado + validación en MVP

### Conectividad Multi-región
- **Desafío**: Conectividad variable entre 6 países
- **Mitigación**: CDN global (CloudFront) + pruebas de whitelist en MVP

### Contenido Multimedia del Cliente
- **Riesgo**: Integración de elementos animados (GIFs) no validados
- **Mitigación**: MVP con GIFs de prueba y validación de performance

### Posicionamiento Interactivo Responsive
- **Desafío**: Elementos de ciudadela mantienen posición relativa fija pero son independientes e interactivos
- **Complejidad**: Animaciones sincronizadas con estados de React
- **Riesgo**: Solución no estándar web, requiere librerías especializadas
- **Mitigación**: Validación en MVP Fase 1 con elementos animados de prueba

## ESTRATEGIA DE MITIGACIÓN

**Enfoque**: Desarrollo por fases con MVPs progresivos
- **Fase 1**: Validación técnica de integraciones críticas
- **Fase 2**: Estructura sólida del sistema para desarrollo acelerado
- **Fase 3**: Prototipo funcional completo listo para producción

*Detalle completo en documento plan-implementacion.md*

## ESCENARIOS DE CALIDAD CLAVE

1. **Streaming Concurrente**: 500 usuarios simultáneos en chat con latencia < 2 segundos
2. **Carga Multimedia**: Videos de Vimeo reproducibles sin buffering en conexiones lentas
3. **Navegación Global**: Usuarios desde 6 países acceden sin degradación significativa
4. **Recuperación**: Incidentes resueltos en tiempo mínimo durante evento crítico
5. **Métricas No Intrusivas**: Sistema de logs para participación sin impactar performance del usuario

---
*Drivers definidos para proyecto Esencia Fest 2025*