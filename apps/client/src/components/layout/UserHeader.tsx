'use client'

import React from 'react';
import { BrandButton } from '@sura-esenciafest/shared';
import { useAuthContext } from '@/components/auth/AuthProvider';

export function UserHeader() {
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout.mutate(true);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="absolute top-0 right-0 p-4 z-50">
      <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
        <span className="text-sm text-gray-700">
          Hola, {user.name}
        </span>
        <BrandButton
          variant="client"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          {logout.isPending ? 'Saliendo...' : 'Cerrar sesión'}
        </BrandButton>
      </div>
    </header>
  );
}