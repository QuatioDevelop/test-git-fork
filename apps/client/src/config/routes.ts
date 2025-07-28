// Configuración centralizada de protección de rutas
export const ROUTE_CONFIG = {
  // Rutas públicas (accesibles sin autenticación)
  PUBLIC_ROUTES: [
    '/',           // TEMPORAL: Root pública, cambiar después del evento
    '/login',
    '/register',
  ],
  
  // Rutas privadas (requieren autenticación)
  PRIVATE_ROUTES: [
    '/ciudadela-test',
    '/sala1',      // Salas interactivas del evento
    '/sala2',
    '/sala3', 
    '/sala4',
    '/sala5',
    '/soporte',    // Salas transversales
    '/videos',
    '/musica',
    '/literario',
  ],
  
  // Rutas de autenticación (redirigen si ya autenticado)
  AUTH_ROUTES: [
    '/login',
    '/register',
  ],
} as const

// Helper para normalizar rutas (remover trailing slash excepto para root)
const normalizePath = (pathname: string): string => {
  if (pathname === '/') return pathname
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

// Helper para verificar tipo de ruta
export const RouteUtils = {
  isPublicRoute: (pathname: string): boolean => {
    const normalizedPath = normalizePath(pathname)
    return (ROUTE_CONFIG.PUBLIC_ROUTES as readonly string[]).includes(normalizedPath)
  },
  
  isPrivateRoute: (pathname: string): boolean => {
    const normalizedPath = normalizePath(pathname)
    return (ROUTE_CONFIG.PRIVATE_ROUTES as readonly string[]).includes(normalizedPath)
  },
  
  isAuthRoute: (pathname: string): boolean => {
    const normalizedPath = normalizePath(pathname)
    return (ROUTE_CONFIG.AUTH_ROUTES as readonly string[]).includes(normalizedPath)
  },
  
  // Por defecto, rutas no especificadas son privadas
  // PERO las rutas públicas NO requieren auth (incluye login/register)
  requiresAuth: (pathname: string): boolean => {
    return !RouteUtils.isPublicRoute(pathname)
  },
  
  // Helper para obtener ruta de login con redirect
  getLoginUrl: (currentPath: string): string => {
    return `/login?redirect=${encodeURIComponent(currentPath)}`
  },
} as const

// Tipos para TypeScript
export type PublicRoute = typeof ROUTE_CONFIG.PUBLIC_ROUTES[number]
export type PrivateRoute = typeof ROUTE_CONFIG.PRIVATE_ROUTES[number]
export type AuthRoute = typeof ROUTE_CONFIG.AUTH_ROUTES[number]