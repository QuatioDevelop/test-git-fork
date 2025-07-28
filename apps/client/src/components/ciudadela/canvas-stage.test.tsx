import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CanvasStage from './canvas-stage'

describe('CanvasStage', () => {
  it('should render the virtual ciudadela', () => {
    render(<CanvasStage />)
    
    // Check welcome message
    expect(screen.getByText('¡Bienvenido a la Ciudadela Virtual de SURA Esencia Fest 2025!')).toBeInTheDocument()
  })

  it('should render all room buttons', () => {
    render(<CanvasStage />)
    
    // Check all room buttons are present
    expect(screen.getByText('Sala Video')).toBeInTheDocument()
    expect(screen.getByText('Galería 360°')).toBeInTheDocument()
    expect(screen.getByText('Chat Live')).toBeInTheDocument()
    expect(screen.getByText('Plaza Central')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(<CanvasStage />)
    
    const container = screen.getByText('¡Bienvenido a la Ciudadela Virtual de SURA Esencia Fest 2025!').closest('div')?.parentElement
    expect(container).toHaveClass('w-full', 'h-96', 'bg-gradient-to-br', 'from-gray-900', 'to-black')
  })

  it('should have hover effects on room buttons', () => {
    render(<CanvasStage />)
    
    const salaVideo = screen.getByText('Sala Video')
    expect(salaVideo).toHaveClass('hover:bg-green-600', 'cursor-pointer')
    
    const galeria = screen.getByText('Galería 360°')
    expect(galeria).toHaveClass('hover:bg-orange-600', 'cursor-pointer')
    
    const chatLive = screen.getByText('Chat Live')
    expect(chatLive).toHaveClass('hover:bg-purple-600', 'cursor-pointer')
    
    const plazaCentral = screen.getByText('Plaza Central')
    expect(plazaCentral).toHaveClass('hover:bg-red-600', 'cursor-pointer')
  })
})