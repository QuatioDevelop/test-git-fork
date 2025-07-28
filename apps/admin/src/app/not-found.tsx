'use client'

import React from 'react';
import { BrandButton } from '@sura-esenciafest/shared';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La página que buscas no existe en el panel de administración.
        </p>
        <BrandButton
          variant="admin"
          size="lg"
          onClick={() => window.location.href = '/'}
        >
          Volver al inicio
        </BrandButton>
      </div>
    </div>
  );
}