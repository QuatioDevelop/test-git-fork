import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CiudadelaCanvas from './ciudadela-canvas'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock contexts
vi.mock('@/context/RoomsContext', () => ({
  useRooms: () => ({
    isRoomAvailable: vi.fn(() => true),
    rooms: [],
    setRooms: vi.fn(),
  }),
}))

vi.mock('@/context/ProgressContext', () => ({
  useProgress: () => ({
    isRoomCompleted: vi.fn(() => false),
    progress: {},
    setProgress: vi.fn(),
  }),
}))

// Mock react-konva components
vi.mock('react-konva', () => ({
  Stage: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="konva-stage" {...props}>
      {children}
    </div>
  ),
  Layer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="konva-layer">
      {children}
    </div>
  ),
  Rect: ({ fill, ...props }: { fill?: string } & Record<string, unknown>) => (
    <div data-testid="konva-rect" data-fill={fill} {...props} />
  ),
  Text: ({ text, ...props }: { text?: string } & Record<string, unknown>) => (
    <div data-testid="konva-text" {...props}>
      {text}
    </div>
  ),
}))

describe('CiudadelaCanvas', () => {
  beforeEach(() => {
    // Mock window.addEventListener and removeEventListener
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})
  })

  it('should render with default dimensions', () => {
    render(<CiudadelaCanvas />)
    
    const stage = screen.getByTestId('konva-stage')
    expect(stage).toBeInTheDocument()
  })

  it('should render with custom dimensions', () => {
    render(<CiudadelaCanvas width={1000} height={800} />)
    
    const stage = screen.getByTestId('konva-stage')
    expect(stage).toBeInTheDocument()
  })

  it('should contain all room texts', () => {
    render(<CiudadelaCanvas />)
    
    expect(screen.getByText(/El Poder del/)).toBeInTheDocument()
    expect(screen.getByText(/Patrocinio/)).toBeInTheDocument()
    expect(screen.getByText('Conocimiento')).toBeInTheDocument()
    expect(screen.getByText(/Ideas en/)).toBeInTheDocument()
    expect(screen.getByText(/Acción/)).toBeInTheDocument()
    expect(screen.getByText(/Salón de/)).toBeInTheDocument()
    expect(screen.getByText(/la Fama/)).toBeInTheDocument()
    expect(screen.getByText('Inspiración')).toBeInTheDocument()
    expect(screen.getByText('¡Bienvenido a la Ciudadela Virtual de SURA Esencia Fest 2025!')).toBeInTheDocument()
  })

  it('should have container with correct classes', () => {
    const { container } = render(<CiudadelaCanvas />)
    
    const canvasContainer = container.firstChild as HTMLElement
    expect(canvasContainer).toHaveClass('w-full', 'h-96', 'bg-gradient-to-br')
  })

  it('should render Konva stage and layer', () => {
    render(<CiudadelaCanvas />)
    
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument()
  })
})