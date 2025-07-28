# Arquitectura Aplicación Cliente - Esencia Fest 2025

## STACK TECNOLÓGICO CORE

### **Framework Base**
- **Next.js 15** + React 19 + TypeScript
- **Static Export** (NO SSR) - Deploy a S3 como SPA
- **Client-side only** rendering

### **Styling & UI**
- **Tailwind CSS v4** + CSS variables optimizadas
- **shadcn/ui** - Copy-paste components approach
- **SuraSans** - Fuentes corporativas SURA como sistema tipográfico principal
- **Design System centralizado** - Tokens de diseño con temas client/admin ([Ver documentación](/apps/shared/src/styles/README.md))
- **Lucide React** para iconografía

### **Data Management**
- **TanStack Query v5** para data fetching + cache
- **React Context** para estados globales
- **localStorage** primary + API sync

### **Librerías Especializadas**
- **react-konva** - Canvas interactivo ciudadela responsive
- **CSS 3D Transforms** - Galería cilíndrica infinita (Sala 4)
- **@vimeo/player** - Video tracking y completion
- **TanStack Virtual** - Infinite scroll foro

## ARQUITECTURA ESTÁTICA (NO SSR)

### **Build Process**
```bash
next build && next export
```
- Output: Static HTML/CSS/JS → S3 buckets
- Client-side hydration completa
- API calls desde browser a api.esenciafest.com

### **Routing**
- Next.js App Router para estructura
- Client-side navigation
- Dynamic imports para code splitting

### **Data Fetching**
- TanStack Query maneja server state
- No getServerSideProps ni getStaticProps
- Todas las llamadas API desde cliente

## MÓDULOS PRINCIPALES

### **Autenticación y Rutas Protegidas**
- **JWT almacenado en localStorage** con refresh token en cookies
- **React Context** para user state global
- **RouteGuard Component**: Sistema de protección de rutas compatible con static export
  - Configuración centralizada en `routes.ts` (público/privado por defecto)
  - **Preservación automática de redirecciones**: `/login?redirect=/ruta-destino`
  - **Performance optimizada**: ~50ms verificación auth (vs ~1000ms middleware)
  - **React Hooks compliance**: Sin conditional hooks, safe para React Strict Mode
- **Auth verification** optimizada sin llamadas API innecesarias
- **Rutas públicas temporales**: `/`, `/login`, `/register`
- **Rutas privadas por defecto**: Todas las demás rutas requieren autenticación

### **Ciudadela Virtual**
- react-konva canvas responsive 16:9
- Estados: available/locked/completed
- Modal overlays para contenido dinámico

### **Foro Social**
- TanStack Query useInfiniteQuery con filtrado avanzado
- shadcn Card components + Filter/Sort UI
- **Cache invalidation inteligente** para moderación en tiempo real
- Optimistic updates likes/comments
- **Componentes de filtrado**: ordenar por fecha, likes, comentarios
- **Validación profanidad cliente-side** con feedback inmediato
- **Manejo graceful** de posts que desaparecen por moderación

### **Salas Específicas**
- **Sala 1**: @vimeo/player + completion tracking
- **Sala 2**: Genially embed + fallback
- **Sala 4**: CSS 3D cylindrical gallery infinita
- **Sala 5**: Chat iframe + Vimeo live

## ESTRUCTURA DIRECTORIOS

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # shadcn components + Design System
│   │   ├── BrandButton.tsx    # Botón con temas client/admin + SuraSans
│   │   ├── BrandHeader.tsx    # Header con tipografía corporativa
│   │   ├── Card.tsx           # Componentes shadcn migrados a design tokens
│   │   ├── Input.tsx          # Inputs con SuraSans y colores consistentes
│   │   └── Spinner.tsx        # Loading component con colores de marca
│   ├── layout/            # Layout components
│   │   └── RouteGuard.tsx # Sistema protección rutas
│   ├── auth/              # Autenticación
│   │   ├── AuthProvider.tsx # Context y hooks
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── ciudadela/         # Konva components
│   ├── foro/              # Social feed
│   │   ├── PostCard.tsx   # Componente individual post
│   │   ├── PostFilters.tsx # Filtros y ordenamiento
│   │   ├── PostForm.tsx   # Creación posts con validación
│   │   └── ModerationBanner.tsx # Notificaciones moderación
│   ├── admin/             # Panel moderación
│   │   ├── ModerationPanel.tsx
│   │   ├── PostModerationTable.tsx
│   │   └── ModerationLogs.tsx
│   └── salas/             # Sala-specific
├── config/
│   └── routes.ts          # Configuración rutas públicas/privadas
├── hooks/                 # Custom hooks
│   ├── useProfanityFilter.ts # Validación client-side
│   ├── usePostModeration.ts  # Manejo moderación
│   └── useCacheInvalidation.ts # TanStack Query optimizado
├── lib/                   # Utils, API, auth
│   ├── profanity-filter.ts # Librería filtro local
│   └── moderation-utils.ts # Utilidades moderación
└── types/                 # TypeScript definitions
    └── moderation.ts      # Tipos sistema moderación
```

## RESPONSIVE STRATEGY

### **Ciudadela Canvas**
- Aspect ratio 16:9 fijo
- Scale automático preservando proporciones
- Franjas en mobile (portrait)

### **Foro & Components**
- Tailwind breakpoints estándar
- shadcn responsive components
- Mobile-first approach

## MANEJO DE ESTADOS

### **Global State - Context API Pattern**

**Arquitectura de Contextos Especializados:**
```typescript
// Composición de contextos independientes
UserContext: user, updateUser, clearUser, isLoading
RoomsContext: rooms, isRoomAvailable, getRoomById, lastSyncTime  
ProgressContext: progress, markRoomCompleted, isRoomCompleted
GlobalStateProvider: Combina todos los contextos anteriores
```

**Hook Unified Global State:**
```typescript
const {
  user, rooms, progress,           // Data
  isLoading, error, isReady,       // Combined states  
  updateUser, markRoomCompleted,   // Actions
  isRoomAvailable, getRoomById     // Computed values
} = useGlobalState()
```

**Características del sistema:**
- **Context Composition Pattern**: Contextos especializados vs. monolítico
- **localStorage Persistence**: State persistente entre sesiones
- **Auto-sync**: Rooms context sincroniza cada 30 segundos con backend
- **Local State Management**: Room visit tracking y completion offline-first
- **Development Tools**: StateDebugger component para testing y debugging

### **Server State**
- TanStack Query para API data con cache inteligente
- **Cache invalidation específica** por tipo de moderación
- **Refetch automático** cuando posts son moderados
- Optimistic updates para likes/comments
- **Polling selectivo**: 30s para posts, 10s para moderación activa
- **Query keys estructuradas** para invalidación granular:
  ```typescript
  ['posts', { sort: 'date', status: 'active', page: 1 }]
  ['posts', { sort: 'likes', status: 'active', page: 1 }]
  ['admin', 'moderation', { dateRange, action }]
  ```

### **Performance Optimization Hooks**
```typescript
// Debounce hook - retrasa ejecución hasta que cesan las llamadas
const debouncedSearch = useDebounce(searchTerm, 300)

// Throttle hook - limita frecuencia máxima de ejecución  
const throttledUpdate = useThrottle(updateFunction, 1000)
```

**Utilidades implementadas:**
- **useDebounce**: Optimiza búsquedas y validaciones de formularios
- **useThrottle**: Controla frecuencia de actualizaciones de estado
- **Memoization patterns**: useCallback y useMemo en contextos para evitar re-renders
- **Query optimization**: Stale time y refetch intervals configurados por uso

### **Local Persistence**
- localStorage primary para progreso
- Sync con API background
- Fallback funcional si API falla

## PERFORMANCE OPTIMIZATIONS

### **Code Splitting**
- Dynamic imports por sala
- Lazy loading componentes pesados
- Canvas SSR disabled

### **Caching Strategy**
- TanStack Query cache inteligente
- CloudFront CDN para assets
- localStorage para user data

### **Bundle Optimization**
- Tree shaking automático
- Next.js bundle analyzer
- Compress assets build time

## INTEGRACIONES EXTERNAS

### **Vimeo**
- Player API para tracking
- Completion events
- Responsive embeds

### **Chat**
- iframe chat.quatio.co
- PostMessage communication
- User count updates

### **CSS 3D Transforms (Sala 4 - Galería Cilíndrica)**
- **Approach**: CSS 3D nativo vs Three.js para mejor performance móvil
- **Arquitectura**: Carrusel cilíndrico infinito con marcos de imágenes
- **Navegación**: Touch/swipe + keyboard controls
- **Performance**: Hardware-accelerated, 60fps en móviles
- **Hotspots**: DOM overlays para información de proyectos
- **Tecnologías**: `transform-style: preserve-3d`, `perspective`, `rotateY()`
- **Lazy Loading**: Intersection Observer para imágenes fuera de vista

### **Genially**
- HTML embed primary
- Fallback a enlace externo
- Completion tracking via postMessage

### **Filtro de Profanidad**
- **Cliente-side**: Librería JavaScript local para feedback inmediato
- **Servidor-side**: Validación definitiva en API
- **Lista configurable**: Administrable desde panel admin
- **Scoring system**: Nivel de severidad por palabra/frase

## TESTING STRATEGY (BÁSICA)

### **Setup Mínimo**
```bash
npm install -D vitest @testing-library/react
npm install -D playwright
```

### **Tests Esenciales**
- **Unit**: Componentes críticos (login, video player)
- **Integration**: Flows principales (ciudadela navigation)
- **E2E**: Happy path completo (login → complete sala)

### **Automated Testing**
- GitHub Actions on push
- Playwright para smoke tests
- Lighthouse CI para performance

### **Manual Testing**
- Multi-device responsive
- Cross-browser compatibility
- Network conditions simulation

## DEPLOYMENT ARCHITECTURE

### **Static Assets**
- S3 buckets por subdomain
- CloudFront distribution
- HTTPS via CloudFlare

### **Client Distribution**
```
esenciafest.com → S3 frontend bucket
admin.esenciafest.com → S3 admin bucket
assets.esenciafest.com → S3 assets bucket
```

### **API Communication**
- REST calls a api.esenciafest.com
- CORS configurado para dominios
- JWT Authorization header

## FALLBACK STRATEGIES

### **Canvas Issues**
- CSS/DOM positioning backup
- Detect canvas support
- Graceful degradation

### **External Services**
- Vimeo fallback a enlace directo
- Chat fallback a formulario
- Genially fallback a enlace externo

### **Network Issues**
- Offline messaging
- Retry mechanisms
- Cache-first approach

## CONSIDERATIONS

### **No SSR Implications**
- SEO limitado (no crítico para evento privado)
- Faster development cycle
- Client-side routing completo
- API dependency total

### **Security**
- Client-side JWT (temporal event)
- HTTPS everywhere
- CORS properly configured
- No sensitive data client-side

### **Performance Targets**
- FCP < 1.5s
- Canvas 60fps
- Infinite scroll smooth
- 500 concurrent users support

---

*Arquitectura SPA estática optimizada para timeline crítico y stack 2025*