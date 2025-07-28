import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandButton } from './brand-button'
import { colors } from '../../styles/tokens/colors'

describe('BrandButton', () => {
  it('should render with default props', () => {
    render(<BrandButton>Click me</BrandButton>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveStyle(`background-color: ${colors.client.primary}`) // default client variant
    expect(button).toHaveClass('px-4') // default md size
  })

  it('should render with client variant', () => {
    render(<BrandButton variant="client">Client Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle(`background-color: ${colors.client.primary}`)
    expect(button).toHaveStyle('font-family: SuraSans, Geist Sans, ui-sans-serif, system-ui, sans-serif')
  })

  it('should render with admin variant', () => {
    render(<BrandButton variant="admin">Admin Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle(`background-color: ${colors.admin.primary}`)
    expect(button).toHaveStyle('font-family: SuraSans, Geist Sans, ui-sans-serif, system-ui, sans-serif')
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<BrandButton size="sm">Small</BrandButton>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1', 'text-sm')

    rerender(<BrandButton size="md">Medium</BrandButton>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<BrandButton size="lg">Large</BrandButton>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('should apply custom className', () => {
    render(<BrandButton className="custom-class">Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<BrandButton onClick={handleClick}>Click me</BrandButton>)
    const button = screen.getByRole('button')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<BrandButton disabled>Disabled Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<BrandButton ref={ref}>Button with ref</BrandButton>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should have correct base classes', () => {
    render(<BrandButton>Button</BrandButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'rounded-md',
      'font-medium',
      'transition-colors',
      'duration-200',
      'shadow-md'
    )
  })
})