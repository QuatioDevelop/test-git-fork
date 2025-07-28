import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EsenciaFestLogo } from './esencia-fest-logo';

describe('EsenciaFestLogo', () => {
  it('renders the logo with correct alt text', () => {
    render(<EsenciaFestLogo />);
    
    const logo = screen.getByAltText('EsenciaFest 2025 - SURA');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Esenciafest.svg');
  });

  it('applies correct size classes', () => {
    render(<EsenciaFestLogo size="sm" />);
    
    const logo = screen.getByAltText('EsenciaFest 2025 - SURA');
    expect(logo).toHaveClass('w-32');
  });

  it('applies priority loading when priority is true', () => {
    render(<EsenciaFestLogo priority={true} />);
    
    const logo = screen.getByAltText('EsenciaFest 2025 - SURA');
    expect(logo).toHaveAttribute('loading', 'eager');
  });

  it('applies lazy loading when priority is false', () => {
    render(<EsenciaFestLogo priority={false} />);
    
    const logo = screen.getByAltText('EsenciaFest 2025 - SURA');
    expect(logo).toHaveAttribute('loading', 'lazy');
  });

  it('applies custom className when provided', () => {
    render(<EsenciaFestLogo className="custom-class" />);
    
    const container = screen.getByAltText('EsenciaFest 2025 - SURA').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('works with different variants', () => {
    render(<EsenciaFestLogo variant="admin" />);
    
    const logo = screen.getByAltText('EsenciaFest 2025 - SURA');
    expect(logo).toBeInTheDocument();
  });
});