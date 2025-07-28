# Requerimientos Funcionales - Esencia Fest 2025

## SISTEMA DE AUTENTICACIÓN

**Requerimientos Funcionales:**
- Login con correo corporativo únicamente
- Registro con campos: nombre, apellido, correo corporativo, rol, cargo, país
- Validación de dominios corporativos autorizados
- Almacenar y recuperar progreso individual por usuario entre sesiones
- Sistema de logs de actividad de usuario para métricas

**Logs de Usuario:**
- Registro de eventos: login, acceso a salas, completado de actividades, tiempo de permanencia
- Estructura: timestamp, userID, acción, sala, país, datos adicionales
- Almacenamiento para consultas posteriores de métricas

## PLATAFORMA PRINCIPAL (CIUDADELA VIRTUAL)

**Requerimientos Funcionales:**
- Sistema de activación de salas por días específicos
- Seguimiento de progreso individual en la sesión de usuario con estados: completado, disponible, apagado
- Barra de progreso general del evento
- Diseño responsive con relación de aspecto fija (16:9), mostrando franjas en dispositivos que no cumplan esta relación de aspecto (móvil con rotación forzada)
- Integración de elementos animados suministrados por el cliente

## SALA 1: EL PODER DEL PATROCINIO (Día 1)

**Requerimientos Funcionales:**
- Reproducción de video del presidente desde Vimeo
- Integración directa con cuenta de Vimeo del cliente

- Marcado automático de completado al finalizar el video

## SALA 2: CONOCIMIENTO (Día 1)

**Requerimientos Funcionales:**
- Integración con Genially para microcursos
- Opción de embebido o enlace externo a Genially
- Seguimiento de completado del microcurso

**Pendiente por confirmar:**
- Validar si es posible detectar el estado de completado del microcurso desde el embebido de Genially

## SALA 3: IDEAS EN ACCIÓN (Día 2)

**Requerimientos Funcionales:**
- Sistema de foro/colaboración desarrollado internamente
- Publicación de ideas con texto e imágenes
- Comentarios en publicaciones
- Sistema de likes/reacciones
- Identificación automática del usuario (sin doble registro)
- Visualización en tiempo real con auto-refresh cada 30 segundos o manual, incluyendo fecha de última actualización
- Carga de archivos (imágenes principalmente, videos opcional)
- **Filtro de profanidad automático** para posts y comentarios con validación tanto cliente como servidor
- **Sistema de moderación con estados**: posts pueden ser marcados como "activo", "baneado" o "eliminado" sin borrado físico
- **Filtrado y ordenamiento avanzado**: posts por fecha, cantidad de likes, cantidad de comentarios
- **Capacidad de moderación granular**: ocultar posts individuales manteniendo auditoría completa
- **Manejo de cambios en tiempo real**: clientes deben actualizar automáticamente cuando contenido es moderado

**Requerimientos No Funcionales:**
- Optimización de carga de imágenes
- **Cache invalidation eficiente** para cambios de moderación en tiempo real
- **Auditoría completa** de todas las acciones de moderación con timestamps y responsables

## SALA 4: SALÓN DE LA FAMA (Día 3)

**Requerimientos Funcionales:**
- Galería 360 navegable
- Reproducción de videos por país desde Vimeo
- 1-2 videos por país máximo
- Navegación con arrastre (escritorio y móvil)
- Vista modal de videos individuales

## SALA 5: INSPIRACIÓN (Día 4)

**Requerimientos Funcionales:**
- Streaming en vivo desde enlace de Vimeo
- Chat en tiempo real desarrollado internamente
- Contador regresivo antes del evento
- Grabación disponible post-evento
- Identificación de usuarios en chat
- Funciones de moderación (baneo, eliminación de mensajes)

**Requerimientos No Funcionales:**
- Soporte para 500 usuarios simultáneos en chat
- Respuesta en tiempo real para chat

## SALAS TRANSVERSALES (Siempre activas)

### Central de Soporte
**Requerimientos Funcionales:**
- FAQ predeterminadas
- Formulario de contacto para consultas no resueltas

### Central de Videos
**Requerimientos Funcionales:**
- Enlaces a videos externos (YouTube, Vimeo)
- Organización por categorías

### Encuentro Musical
**Requerimientos Funcionales:**
- Enlaces directos a listas de Spotify
- Instrucciones para acceso en diferentes plataformas

### Rincón Literario
**Requerimientos Funcionales:**
- Enlaces a contenido bibliográfico
- Recomendaciones de lecturas

## REQUERIMIENTOS GENERALES DE SISTEMA

**Información del Evento:**
- Fecha del evento: semana del 18 de agosto
- Participantes: 6 países

**Requerimientos Funcionales:**
- Manejo de activación de salas considerando múltiples zonas horarias (definir hora específica como 5 AM Colombia = 7 AM Chile/Argentina)

**Requerimientos No Funcionales:**
- Dominio activo para 25 de julio (fecha límite)
- Lista blanca de dominios para firewalls corporativos
- Almacenamiento local de progreso de usuario
- Compatibilidad multi-país y multi-zona horaria
- Escalabilidad para 7,000 usuarios registrados
- Optimización para conexiones de diferentes velocidades (específicamente para videos)

## PANEL DE ADMINISTRACIÓN

**Requerimientos Funcionales:**
- Configuración dinámica de contenido por sala
- Gestión de dominios corporativos autorizados
- Programación de activación de salas por fecha/hora
- Estadísticas en tiempo real: usuarios activos, progreso por sala
- Panel de logs de actividad agregados
- **Moderación avanzada de contenido foro**: sistema de ban/ocultar con estados, filtro de profanidad, y auditoría completa
- **Panel de moderación granular**: capacidad de moderar posts individuales, ver historial de moderación, y revertir acciones

**Requerimientos No Funcionales:**
- Autenticación robusta (AWS Cognito)
- Acceso restringido a personal autorizado
- Interface responsive para gestión móvil

## CONSIDERACIONES IMPORTANTES

- **Proyecto cerrado:** No se tendrá integración con sistemas de autenticación existentes del cliente
- **Diseños:** El cliente suministra todos los diseños gráficos y elementos visuales
- **Contenido multimedia:** El cliente provee todos los videos y contenidos que se integrarán en la plataforma

---
*Documento generado a partir de notas de reunión del proyecto Esencia Fest 2025*