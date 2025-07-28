'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@sura-esenciafest/shared'

interface GeniallyEmbedProps {
  /** URL del contenido Genially en el CDN */
  src: string
  /** Título del contenido para accesibilidad */
  title?: string
  /** Altura del iframe (opcional, si no se especifica usa toda la pantalla) */
  height?: number | string
  /** Usar modo pantalla completa (como la ciudadela) */
  fullScreen?: boolean
  /** Clase CSS adicional */
  className?: string
  /** Función callback cuando se carga el contenido */
  onLoad?: () => void
  /** Función callback cuando falla la carga */
  onError?: () => void
  /** Mostrar indicador de carga */
  showLoader?: boolean
}

export function GeniallyEmbed({
  src,
  title = 'Contenido Genially',
  height,
  fullScreen = false,
  className,
  onLoad,
  onError,
  showLoader = true
}: GeniallyEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // URLs del CDN para diferentes ambientes
  const getCDNUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_ASSETS_URL || 'https://assets.esenciafest.com'
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  }

  // Construir URL completa del CDN
  const fullSrc = src.startsWith('http') ? src : getCDNUrl(src)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
    console.error('Error loading Genially content:', fullSrc)
  }

  // Reintentar carga
  const handleRetry = () => {
    setIsLoading(true)
    setHasError(false)
    
    if (iframeRef.current) {
      // Forzar recarga del iframe
      iframeRef.current.src = fullSrc
    }
  }

  // Effect para manejar el timeout de carga
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        setHasError(true)
        onError?.()
        console.error('Error loading Genially content (timeout):', fullSrc)
      }
    }, 10000) // 10 segundos timeout

    return () => clearTimeout(timer)
  }, [isLoading, fullSrc, onError])

  // Effect para calcular dimensiones en modo fullScreen
  useEffect(() => {
    if (!fullScreen) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        
        // Usar el tamaño del contenedor padre (que ya está bien dimensionado por flexbox)
        const availableWidth = containerRect.width - 40 // padding
        const availableHeight = containerRect.height - 40 // padding
        
        // Aspect ratio estándar para contenido Genially (16:9)
        const aspectRatio = 16 / 9
        
        let width = availableWidth
        let height = width / aspectRatio
        
        // Si la altura calculada es mayor que la disponible, ajustar por altura
        if (height > availableHeight) {
          height = availableHeight
          width = height * aspectRatio
        }
        
        setDimensions({ width, height })
      }
    }

    // Esperar un tick para que el layout esté completamente renderizado
    const timer = setTimeout(updateDimensions, 100)
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [fullScreen])

  // Calcular altura final
  const finalHeight = fullScreen ? dimensions.height : (height || 600)


  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full',
        fullScreen ? 'flex items-center justify-center h-full' : '',
        className
      )}
    >
      {/* Loader */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando contenido...</p>
            <p className="text-sm text-gray-500 mt-1">Genially desde CDN</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 z-10">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error de carga</h3>
            <p className="text-red-600 mb-4">No se pudo cargar el contenido Genially</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
            <details className="mt-4 text-left">
              <summary className="text-sm text-red-700 cursor-pointer">Detalles técnicos</summary>
              <p className="text-xs text-red-600 mt-2 font-mono break-all">
                URL: {fullSrc}
              </p>
            </details>
          </div>
        </div>
      )}


      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={fullSrc}
        title={title}
        width={fullScreen ? dimensions.width : "100%"}
        height={finalHeight}
        style={{
          border: 'none',
          opacity: isLoading || hasError ? 0 : 1,
          maxWidth: fullScreen ? dimensions.width : '100%',
          maxHeight: fullScreen ? dimensions.height : 'none'
        }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'rounded-lg border border-gray-200 bg-white',
          'transition-opacity duration-300',
          hasError && 'opacity-0',
          isLoading && 'opacity-0',
          fullScreen ? 'shadow-2xl' : 'w-full'
        )}
      />

    </div>
  )
}