// Configuración centralizada de salas del evento
export const ROOMS_CONFIG = {
  // Salas interactivas principales (con control de horario)
  INTERACTIVE_ROOMS: [
    {
      id: 'sala1',
      name: 'El Poder del Patrocinio',
      shortName: 'El Poder del\nPatrocinio',
      route: '/sala1',
      description: 'Aquí encontrarás un video del presidente desde Vimeo',
      type: 'interactive' as const,
    },
    {
      id: 'sala2',
      name: 'Conocimiento',
      shortName: 'Conocimiento',
      route: '/sala2',
      description: 'Aquí encontrarás microcursos integrados con Genially',
      type: 'interactive' as const,
    },
    {
      id: 'sala3',
      name: 'Ideas en Acción',
      shortName: 'Ideas en\nAcción',
      route: '/sala3',
      description: 'Aquí encontrarás un sistema de foro para publicar ideas con texto e imágenes',
      type: 'interactive' as const,
    },
    {
      id: 'sala4',
      name: 'Salón de la Fama',
      shortName: 'Salón de\nla Fama',
      route: '/sala4',
      description: 'Aquí encontrarás una galería 360 navegable con videos por país desde Vimeo',
      type: 'interactive' as const,
    },
    {
      id: 'sala5',
      name: 'Inspiración',
      shortName: 'Inspiración',
      route: '/sala5',
      description: 'Aquí encontrarás streaming en vivo desde Vimeo con chat en tiempo real',
      type: 'interactive' as const,
    },
  ],
  
  // Salas transversales (siempre disponibles)
  TRANSVERSAL_ROOMS: [
    {
      id: 'soporte',
      name: 'Central de Soporte',
      shortName: 'Central de\nSoporte',
      route: '/soporte',
      description: 'Aquí encontrarás FAQ y formulario de contacto para consultas',
      type: 'transversal' as const,
    },
    {
      id: 'videos',
      name: 'Central de Videos',
      shortName: 'Central de\nVideos',
      route: '/videos',
      description: 'Aquí encontrarás enlaces a videos externos organizados por categorías',
      type: 'transversal' as const,
    },
    {
      id: 'musical',
      name: 'Encuentro Musical',
      shortName: 'Encuentro\nMusical',
      route: '/musica',
      description: 'Aquí encontrarás enlaces directos a listas de Spotify',
      type: 'transversal' as const,
    },
    {
      id: 'literario',
      name: 'Rincón Literario',
      shortName: 'Rincón\nLiterario',
      route: '/literario',
      description: 'Aquí encontrarás enlaces a contenido bibliográfico y recomendaciones de lecturas',
      type: 'transversal' as const,
    },
  ],
} as const

// Helper para obtener todas las salas
export const getAllRooms = () => [
  ...ROOMS_CONFIG.INTERACTIVE_ROOMS,
  ...ROOMS_CONFIG.TRANSVERSAL_ROOMS,
]

// Helper para obtener una sala por ID
export const getRoomConfigById = (roomId: string) => {
  return getAllRooms().find(room => room.id === roomId)
}

// Helper para obtener una sala por ruta
export const getRoomConfigByRoute = (route: string) => {
  return getAllRooms().find(room => room.route === route)
}

// Tipo para las salas
export type RoomConfig = 
  | typeof ROOMS_CONFIG.INTERACTIVE_ROOMS[number]
  | typeof ROOMS_CONFIG.TRANSVERSAL_ROOMS[number]

export type RoomType = 'interactive' | 'transversal'

// IDs de salas válidos
export type RoomId = RoomConfig['id']

// Rutas de salas válidas
export type RoomRoute = RoomConfig['route']