# Diseño de APIs - Esencia Fest 2025

## ENDPOINTS POR AUTENTICACIÓN

### **🌐 PÚBLICOS** 
*(Sin autenticación)*
- `POST /auth`
- `GET /health`

### **🔑 USUARIOS JWT**
*(Token usuario regular)*
- `GET /rooms/status`
- `GET /rooms/{id}/content` 
- `GET /user/progress`
- `PUT /user/progress/{salaId}`
- `DELETE /user/delete`
- `POST /logs/activity`
- `POST /upload/presigned`
- Endpoints foro: `GET|POST /posts/*`

### **👨‍💼 ADMIN COGNITO**
*(Token administrador)*
- `GET /admin/stats`
- `PUT /admin/rooms/{id}/content`
- `PUT /admin/rooms/{id}/schedule`
- `GET /admin/logs`
- `PUT /admin/domains`

## ENDPOINTS PRINCIPALES

### **Autenticación (Públicos)**

#### `POST /auth`
**Uso:** Login/registro único transparente

**Input completo (registro):**
```json
{
  "email": "usuario@empresa.com",
  "name": "Juan",
  "lastname": "Pérez",
  "country": "Colombia",
  "negocio": "Negocio 1"
}
```

**Input mínimo (login):**
```json
{
  "email": "usuario@empresa.com"
}
```

**Respuestas:**

**200 - Login exitoso:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "isNew": false
  }
}
```

**201 - Registro exitoso:**
```json
{
  "token": "jwt_token_here", 
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "isNew": true
  }
}
```

**400 - Registro requerido:**
```json
{
  "error": "registration_required",
  "message": "User not found, please provide name, lastname, country and negocio"
}
```

**403 - Dominio no autorizado:**
```json
{
  "error": "domain_not_allowed", 
  "message": "Email domain not in whitelist"
}
```

#### `GET /health`
**Uso:** Health check sistema

### **Salas y Progreso (JWT)**

#### `GET /rooms/status`
**Uso:** Estados todas las salas para dashboard principal
**Output:**
```json
{
  "sala1": {
    "openAt": "2025-08-18T10:00:00Z",
    "manualOverride": null
  },
  "sala2": {
    "openAt": "2025-08-19T10:00:00Z",
    "manualOverride": "closed"
  },
  "sala3": {
    "openAt": "2025-08-18T12:00:00Z",
    "manualOverride": "open"
  }
}
```

**Campos:**
- `openAt`: Fecha/hora programada de apertura (ISO 8601)
- `manualOverride`: Control manual - `null` (automático), `"open"` (forzar abierta), `"closed"` (forzar cerrada)

#### `GET /rooms/{id}/content`
**Uso:** Contenido dinámico sala (URLs, configuración)
**Ejemplos:**

**Sala 1 (Video):**
```json
{
  "type": "video",
  "title": "El Poder del Patrocinio",
  "vimeoUrl": "https://vimeo.com/..."
}
```

**Sala 2 (Genially):**
```json
{
  "type": "course", 
  "title": "Conocimiento",
  "genially": {
    "embedCode": "<div class='genially-embed'...",
    "fallbackUrl": "https://genially.com/..."
  }
}
```

**Sala 5 (Chat + Streaming):**
```json
{
  "type": "live",
  "title": "Inspiración", 
  "streaming": {
    "liveUrl": "https://vimeo.com/live/...",
    "recordedUrl": "https://vimeo.com/recorded/..."
  },
  "chatUrl": "https://chat.quatio.co/sala5"
}
```

#### `GET /user/progress`
**Uso:** Salas completadas por usuario
**Output:**
```json
{
  "completed": ["sala1", "sala3"]
}
```

#### `PUT /user/progress/{salaId}`
**Uso:** Marcar sala como completada
**Input:**
```json
{
  "status": "completed"
}
```

#### `DELETE /user/delete`
**Uso:** Auto-eliminación de cuenta del usuario autenticado
**Headers:** `Authorization: Bearer <jwt_token>`
**Respuestas:**

**200 - Eliminación exitosa:**
```json
{
  "message": "User deleted successfully"
}
```

**401 - Token inválido:**
```json
{
  "error": "unauthorized",
  "message": "Authorization header required"
}
```

### **Logs y Métricas (JWT)**

#### `POST /logs/activity`
**Uso:** Registrar eventos específicos (tiempo en sala, aperturas múltiples)
**Input:**
```json
{
  "action": "room_enter|video_start|time_spent",
  "salaId": "sala1",
  "metadata": {
    "duration": 120,
    "timestamp": "2025-08-18T10:05:00Z"
  }
}
```

### **Uploads (JWT)**

#### `POST /upload/presigned`
**Uso:** Generar URL para upload directo S3
**Input:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg"
}
```
**Output:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "publicUrl": "https://assets.esenciafest.com/uploads/uuid-image.jpg"
}
```

### **Foro - Ideas en Acción (JWT)**

#### `GET /posts`
**Uso:** Lista paginada posts con filtrado y ordenamiento avanzado
**Query:** `?page=1&limit=20&since=timestamp&sort=date|likes|comments&order=desc|asc&status=active`
**Headers:** `X-Total-Count`, `X-Page-Count`
**Output:**
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "userId": "user-uuid",
      "content": "Mi idea innovadora...",
      "images": ["https://assets.esenciafest.com/uploads/..."],
      "status": "active",
      "likesCount": 15,
      "commentsCount": 8,
      "createdAt": "2025-08-18T10:30:00Z",
      "user": {
        "name": "Juan Pérez",
        "country": "Colombia"
      }
    }
  ]
}
```

#### `POST /posts`
**Uso:** Crear nuevo post con validación de profanidad
**Input:**
```json
{
  "content": "Mi idea innovadora...",
  "images": ["https://assets.esenciafest.com/uploads/..."]
}
```
**Validaciones:**
- Filtro de profanidad automático
- Límite de caracteres
- Validación de imágenes

#### `GET /posts/{id}/comments`
**Uso:** Comentarios de post específico (solo activos)
**Query:** `?status=active`

#### `POST /posts/{id}/comments`
**Uso:** Comentar post con validación de profanidad
**Input:**
```json
{
  "content": "Excelente idea, me parece que..."
}
```

#### `POST /posts/{id}/like`
**Uso:** Like/unlike post (solo posts activos)

#### `PUT /posts/{id}/status`
**Uso:** Cambiar estado de post (solo para propietario)
**Input:**
```json
{
  "status": "deleted"
}
```

### **Admin Panel (Cognito)**

#### `GET /admin/posts`
**Uso:** Lista todos los posts con estados para moderación
**Query:** `?page=1&limit=50&status=all|active|banned|deleted&sort=date&order=desc`
**Output:**
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "userId": "user-uuid",
      "content": "Contenido del post...",
      "status": "active",
      "createdAt": "2025-08-18T10:30:00Z",
      "bannedAt": null,
      "bannedBy": null,
      "banReason": null,
      "user": {
        "name": "Juan Pérez",
        "email": "juan@empresa.com",
        "country": "Colombia"
      }
    }
  ],
  "total": 245
}
```

#### `PUT /admin/posts/{id}/ban`
**Uso:** Banear/ocultar post específico
**Input:**
```json
{
  "reason": "Contenido inapropiado",
  "action": "ban"
}
```
**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post-uuid",
    "status": "banned",
    "bannedAt": "2025-08-18T15:30:00Z",
    "bannedBy": "admin-user-id",
    "banReason": "Contenido inapropiado"
  }
}
```

#### `PUT /admin/posts/{id}/restore`
**Uso:** Restaurar post baneado
**Input:**
```json
{
  "reason": "Apelación aprobada"
}
```

#### `GET /admin/moderation/logs`
**Uso:** Historial completo de acciones de moderación
**Query:** `?page=1&limit=50&action=ban|restore|delete&dateFrom=2025-08-18&dateTo=2025-08-20`
**Output:**
```json
{
  "logs": [
    {
      "id": "log-uuid",
      "action": "ban",
      "targetType": "post",
      "targetId": "post-uuid",
      "adminId": "admin-uuid",
      "reason": "Contenido inapropiado",
      "timestamp": "2025-08-18T15:30:00Z",
      "metadata": {
        "originalContent": "Texto original...",
        "targetUserId": "user-uuid"
      }
    }
  ]
}
```

#### `PUT /admin/comments/{id}/ban`
**Uso:** Moderar comentarios específicos
**Input:**
```json
{
  "reason": "Lenguaje ofensivo",
  "action": "ban"
}
```

#### `PUT /admin/rooms/{id}/content`
**Uso:** Actualizar contenido dinámico sala
**Input:**
```json
{
  "type": "video",
  "title": "Nuevo título",
  "vimeoUrl": "https://vimeo.com/updated"
}
```

#### `PUT /admin/domains`
**Uso:** Gestionar dominios autorizados
**Input:**
```json
{
  "domains": ["@sura.com.co", "@bancoldex.com", "@nuevaempresa.com"]
}
```

#### `GET /admin/stats`
**Uso:** Estadísticas tiempo real
**Output:**
```json
{
  "activeUsers": 245,
  "totalRegistered": 1850,
  "progressBySala": {
    "sala1": { "completed": 120, "inProgress": 25 }
  }
}
```

#### `PUT /admin/rooms/{id}/override`
**Uso:** Control manual de disponibilidad de salas
**Input:**
```json
{
  "override": "open" | "closed" | null
}
```
**Output:**
```json
{
  "roomId": "sala1",
  "manualOverride": "open",
  "updatedAt": "2025-07-16T10:30:00Z"
}
```

#### `PUT /admin/rooms/{id}/schedule`
**Uso:** Configurar horarios de apertura de salas
**Input:**
```json
{
  "openAt": "2025-08-18T10:00:00Z"
}
```
**Output:**
```json
{
  "roomId": "sala1", 
  "openAt": "2025-08-18T10:00:00Z",
  "updatedAt": "2025-07-16T10:30:00Z"
}
```

#### `GET /admin/logs`
**Uso:** Logs agregados por actividad/país

### Subdominio API
`api.esenciafest.com` - Todos los endpoints REST

---
*API diseñada para timeline crítico 25 jul - 18 ago*