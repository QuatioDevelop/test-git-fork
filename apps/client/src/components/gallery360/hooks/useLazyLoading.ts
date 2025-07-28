import { useEffect, useRef, useState, RefObject } from 'react'

interface UseLazyLoadingProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface LazyLoadingResult {
  isIntersecting: boolean
  hasBeenVisible: boolean
  ref: RefObject<HTMLElement | null>
}

export function useLazyLoading({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseLazyLoadingProps = {}): LazyLoadingResult {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume visible
      setIsIntersecting(true)
      setHasBeenVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting

        setIsIntersecting(isVisible)

        if (isVisible && !hasBeenVisible) {
          setHasBeenVisible(true)
        }

        // Disconnect observer if triggerOnce is true and element has been visible
        if (triggerOnce && isVisible && hasBeenVisible) {
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasBeenVisible])

  return {
    isIntersecting,
    hasBeenVisible,
    ref
  }
}

// Hook for loading multiple images with lazy loading
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useImageLazyLoading(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  const loadImage = (url: string) => {
    if (loadedImages.has(url) || failedImages.has(url) || loadingImages.has(url)) {
      return
    }

    setLoadingImages(prev => new Set(prev).add(url))

    const img = new Image()
    
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(url))
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }

    img.onerror = () => {
      setFailedImages(prev => new Set(prev).add(url))
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }

    img.src = url
  }

  const preloadImage = (url: string) => {
    if (!url) return
    loadImage(url)
  }

  const isImageLoaded = (url: string) => loadedImages.has(url)
  const isImageFailed = (url: string) => failedImages.has(url)
  const isImageLoading = (url: string) => loadingImages.has(url)

  return {
    loadedImages,
    failedImages,
    loadingImages,
    preloadImage,
    isImageLoaded,
    isImageFailed,
    isImageLoading
  }
}

// Combined hook for gallery lazy loading
export function useGalleryLazyLoading(
  imageUrls: string[],
  currentIndex: number,
  preloadRange: number = 2
) {
  const {
    preloadImage,
    isImageLoaded,
    isImageFailed,
    isImageLoading,
    loadedImages,
    failedImages
  } = useImageLazyLoading(imageUrls)

  // Preload images around current index
  useEffect(() => {
    const urlsToPreload: string[] = []

    // Current image
    if (imageUrls[currentIndex]) {
      urlsToPreload.push(imageUrls[currentIndex])
    }

    // Images in range around current index
    for (let i = 1; i <= preloadRange; i++) {
      const prevIndex = (currentIndex - i + imageUrls.length) % imageUrls.length
      const nextIndex = (currentIndex + i) % imageUrls.length

      if (imageUrls[prevIndex]) {
        urlsToPreload.push(imageUrls[prevIndex])
      }
      if (imageUrls[nextIndex]) {
        urlsToPreload.push(imageUrls[nextIndex])
      }
    }

    // Load all URLs in range
    urlsToPreload.forEach(url => {
      if (url) {
        preloadImage(url)
      }
    })
  }, [currentIndex, imageUrls, preloadRange, preloadImage])

  return {
    isImageLoaded,
    isImageFailed,
    isImageLoading,
    preloadImage,
    loadedImagesCount: loadedImages.size,
    failedImagesCount: failedImages.size,
    totalImages: imageUrls.length
  }
}