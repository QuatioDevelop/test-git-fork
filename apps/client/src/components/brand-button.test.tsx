import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandButton } from './brand-button'

describe('Client BrandButton', () => {
  it('should render with default client variant', () => {
    render(<BrandButton>Client Button</BrandButton>)
    const button = screen.getByRole('button', { name: 'Client Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600') // default client variant
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<BrandButton onClick={handleClick}>Click me</BrandButton>)
    const button = screen.getByRole('button')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply custom styles for client app', () => {
    render(<BrandButton variant="client" size="lg">Large Client Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'px-6', 'py-3', 'text-lg')
  })
})