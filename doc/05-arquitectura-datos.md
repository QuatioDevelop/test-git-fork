# Arquitectura de Datos - Esencia Fest 2025

## DISEÑO FINAL: HÍBRIDO OPTIMIZADO

### Tabla Principal (Single Table Design)
**`EsenciaFest-Main-2025`**  
Datos operacionales OLTP con access patterns relacionados

### Tabla Separada (Time Series) 
**`EsenciaFest-ActivityLogs-2025-08`**  
Logs de actividad optimizados para time series analytics

## ACCESS PATTERNS DEFINIDOS

### **Operacionales (Tabla Principal)**
1. `GetUser(email)` - Login/registro
2. `GetUserProgress(userId)` - Salas completadas  
3. `UpdateUserProgress(userId, salaId)` - Marcar completado
4. `GetAllRoomsStatus()` - Dashboard principal
5. `GetRoomContent(roomId)` - Contenido específico sala
6. `UpdateRoomContent(roomId)` - Admin actualiza contenido
7. `GetAllPosts(limit, lastKey, sort, status)` - **Lista paginada posts con filtrado avanzado**
8. `GetPostComments(postId)` - Comentarios de post (solo activos)
9. `CreatePost(userId, content)` - **Nuevo post con validación profanidad**
10. `CreateComment(postId, userId, content)` - **Nuevo comentario con validación profanidad**
11. `GetUserPosts(userId)` - Posts por usuario
12. **`GetPostsByStatus(status, sort, order)` - Posts filtrados por estado para moderación**
13. **`UpdatePostStatus(postId, status, reason, adminId)` - Cambiar estado de post (ban/restore)**
14. **`GetModerationLogs(dateRange, action)` - Historial de acciones de moderación**
15. **`GetPostsSortedByLikes()` - Posts ordenados por cantidad de likes**
16. **`GetPostsSortedByComments()` - Posts ordenados por cantidad de comentarios**

### **Analytics (Tabla Logs)**
17. `LogActivity(userId, action, metadata)` - Registrar evento
18. `GetUserLogs(userId, dateRange)` - Logs por usuario/fecha
19. `GetActivityByCountry(country, date)` - Admin analytics
20. **`LogModerationAction(adminId, action, targetId, reason)` - Registrar acciones de moderación**

## TABLA PRINCIPAL - SINGLE TABLE DESIGN

### **Primary Key Structure**
```
PK (Partition Key): String
SK (Sort Key): String  
```

### **Entity Patterns**

#### **Users**
```
PK: USER#email@domain.com
SK: PROFILE
- name, country, role, createdAt
- progress: ["sala1", "sala3"]
```

#### **Room Status** 
```
PK: ROOM#STATUS
SK: ROOM#sala1
- openAt, manualOverride, createdAt, updatedAt
```
**Campos simplificados:**
- `openAt`: Fecha/hora programada de apertura (ISO 8601)
- `manualOverride`: Control manual - `null` (automático), `"open"` (forzar abierta), `"closed"` (forzar cerrada)

#### **Room Content**
```
PK: ROOM#sala1
SK: CONTENT#v1
- type, title, vimeoUrl, openAt
- GSI1PK: CONTENT#ACTIVE, GSI1SK: sala1
```

#### **Forum Posts (Adjacency List)**
```
PK: POST#postId
SK: POST#postId
- userId, content, images[], createdAt, likes, commentsCount
- **status: "active" | "banned" | "deleted"**
- **bannedAt, bannedBy, banReason** (para auditoría)
- **profanityScore** (resultado filtro automático)
- GSI2PK: POSTS#${status}, GSI2SK: ${createdAt} (filtrado por estado)
- GSI3PK: POSTS#SORTED, GSI3SK: ${likes}#${createdAt} (ordenamiento por likes)

PK: POST#postId
SK: COMMENT#commentId  
- userId, content, createdAt
- **status: "active" | "banned" | "deleted"**
- **bannedAt, bannedBy, banReason**
- **profanityScore**
```

#### **Admin Config**
```
PK: CONFIG#domains
SK: CONFIG#domains
- whitelist: ["@sura.com.co", "@bancoldex.com"]

PK: CONFIG#schedule
SK: CONFIG#schedule
- salaOpenTimes: {...}

**PK: CONFIG#profanity**
**SK: CONFIG#profanity**
**- blacklist: ["palabra1", "palabra2"]**
**- severity: { "palabra1": "high", "palabra2": "medium" }**
**- autoModerationThreshold: 0.8**
```

#### **Moderation Logs**
```
**PK: MODLOG#${date}**
**SK: ${timestamp}#${adminId}#${actionId}**
**- action: "ban" | "restore" | "delete"**
**- targetType: "post" | "comment"**
**- targetId, reason, adminId**
**- originalContent (para auditoría)**
**- metadata: { userId, postId, etc }**
```

### **Global Secondary Indexes**

#### **GSI1 - Entity Groupings**
```
GSI1PK: Entity type groupings
GSI1SK: Sort criteria

Ejemplos:
- GSI1PK: POSTS#ACTIVE, GSI1SK: 2025-08-18T10:30:00Z
- GSI1PK: CONTENT#ACTIVE, GSI1SK: sala1  
- GSI1PK: USER#Colombia, GSI1SK: 2025-08-18
```

#### **GSI2 - Posts por Estado (Moderación)**
```
GSI2PK: POSTS#${status} 
GSI2SK: ${createdAt}

Permite:
- Filtrar posts por estado (active, banned, deleted)
- Ordenar por fecha de creación
- Paginación eficiente para admin panel
```

#### **GSI3 - Posts por Popularidad**
```
GSI3PK: POSTS#SORTED
GSI3SK: ${likesCount}#${createdAt}

Permite:
- Ordenar posts por cantidad de likes
- Empate resuelto por fecha de creación
- Feed "más populares" eficiente
```

#### **GSI4 - Posts por Comentarios**
```
GSI4PK: POSTS#COMMENTS
GSI4SK: ${commentsCount}#${createdAt}

Permite:
- Ordenar posts por cantidad de comentarios
- Feed "más discutidos"
- Métricas de engagement
```

## TABLA SEPARADA - ACTIVITY LOGS

### **Time Series Optimized**
```
Tabla: EsenciaFest-ActivityLogs-2025-08

PK: USER#userId#shard{0-9}
SK: 2025-08-18T10:30:00Z#eventId
- action, salaId, country, metadata
- ttl: timestamp + 90 días
```

### **Write Sharding**
- 10 shards por usuario para high throughput
- Distribución uniforme de writes
- Queries paralelas para agregación

### **Analytics Pipeline**
```
DynamoDB Logs → Streams → Lambda → S3 → Athena
```

## CONFIGURACIÓN DE CAPACIDAD

### **Tabla Principal**
- **Modo**: On-demand (tráfico impredecible durante evento)
- **Estimado**: 7K usuarios, 500 concurrentes
- **Patterns**: Read-heavy con bursts

### **Tabla Logs**  
- **Modo**: On-demand (write spikes durante actividades)
- **TTL**: Automático después 90 días
- **Estimado**: 100K eventos/día durante evento

## ALMACENES COMPLEMENTARIOS

### **S3 + CloudFront** 
```
esenciafest-frontend/ - App builds
esenciafest-admin/ - Admin panel builds  
esenciafest-assets/ - Uploads usuarios
```

### **LocalStorage (Cliente)**
```javascript
// Sync cada 30s durante evento
{
  token: "jwt_here",
  progress: ["sala1", "sala3"],
  lastSync: timestamp
}
```

## JUSTIFICACIÓN DEL DISEÑO

### **Single Table Benefits**
- ✅ Single query per access pattern
- ✅ Costo base 1 tabla vs 5 tablas
- ✅ Latencia optimizada (pre-joined data)
- ✅ Escalabilidad unlimited

### **Logs Separation Benefits**  
- ✅ Throughput independiente (write-heavy vs read-heavy)
- ✅ TTL específico para time series
- ✅ Analytics pipeline dedicado
- ✅ Hot partitions evitados

### **Hybrid Approach** 
- OLTP optimizado: Tabla principal
- Time series optimizado: Tabla logs
- Analytics ready: Streams → S3 → Athena

## VOLÚMENES ESTIMADOS

- **Tabla principal**: ~15MB (users + content + posts)
- **Tabla logs**: ~50MB/día durante evento
- **S3 assets**: 2-5GB uploads usuarios
- **LocalStorage**: <1MB por usuario

## ESTRATEGIA DE BACKUP

- **Point-in-time recovery**: Activado en ambas tablas
- **S3 versionado**: Activado para assets críticos  
- **Cross-region replication**: No requerido (evento temporal)

---
*Arquitectura híbrida optimizada para OLTP + Time Series Analytics*