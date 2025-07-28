import React from 'react';
import { cn } from '../../lib/utils';

interface EsenciaFestLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  variant?: 'client' | 'admin';
}

const sizeClasses = {
  sm: 'w-32 h-auto sm:w-40',
  md: 'w-48 h-auto sm:w-56 md:w-64',
  lg: 'w-64 h-auto sm:w-72 md:w-80 lg:w-96',
  xl: 'w-80 h-auto sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]'
};

export function EsenciaFestLogo({ 
  className, 
  size = 'lg', 
  priority = false,
  variant = 'client'
}: EsenciaFestLogoProps) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      <img
        src="/Esenciafest.svg"
        alt="EsenciaFest 2025 - SURA"
        className={cn(
          sizeClasses[size],
          'object-contain',
          'drop-shadow-lg',
          'hover:scale-105 transition-transform duration-300',
          'max-w-full', // Ensure it doesn't overflow on small screens
          'filter contrast-110 brightness-105' // Enhance logo visibility
        )}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}