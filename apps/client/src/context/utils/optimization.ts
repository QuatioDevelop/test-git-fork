import React, { useRef, useCallback, useEffect } from 'react'

// Debounce hook for optimizing frequent updates
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for rate limiting
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall.current

    if (timeSinceLastCall >= delay) {
      lastCall.current = now
      callback(...args)
    } else {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
      timeout.current = setTimeout(() => {
        lastCall.current = Date.now()
        callback(...args)
      }, delay - timeSinceLastCall)
    }
  }, [callback, delay]) as T
}

// Local storage sync optimization
export const useLocalStorageSync = <T>(
  key: string,
  value: T,
  options: {
    debounce?: number
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  } = {}
) => {
  const {
    debounce = 500,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options

  const debouncedValue = useDebounce(value, debounce)

  useEffect(() => {
    if (debouncedValue !== null && debouncedValue !== undefined) {
      try {
        localStorage.setItem(key, serialize(debouncedValue))
      } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error)
      }
    }
  }, [key, debouncedValue, serialize])

  const loadFromStorage = useCallback((): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? deserialize(item) : null
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error)
      return null
    }
  }, [key, deserialize])

  return { loadFromStorage }
}