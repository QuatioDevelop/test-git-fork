import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandButton } from './brand-button'

describe('Admin BrandButton', () => {
  it('should render with default client variant', () => {
    render(<BrandButton>Admin Button</BrandButton>)
    const button = screen.getByRole('button', { name: 'Admin Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600') // default client variant
  })

  it('should render with admin variant styling', () => {
    render(<BrandButton variant="admin">Admin Panel Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-700', 'hover:bg-blue-800') // admin blue theme
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<BrandButton onClick={handleClick}>Click me</BrandButton>)
    const button = screen.getByRole('button')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply admin theme correctly', () => {
    render(<BrandButton variant="admin" size="lg">Large Admin Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-700', 'px-6', 'py-3', 'text-lg')
  })

  it('should be accessible', () => {
    render(<BrandButton aria-label="Admin action button">Submit</BrandButton>)
    const button = screen.getByRole('button', { name: 'Admin action button' })
    expect(button).toBeInTheDocument()
  })
})