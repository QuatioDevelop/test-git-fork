'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { BrandButton } from '@sura-esenciafest/shared';

export function AdminHeader() {
  const { user, logout, isLoading } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Panel Administrativo
            </h1>
            <span className="ml-2 text-sm text-gray-500">
              Esencia Fest 2025
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">
                  {user.signInDetails?.loginId || 'Admin'}
                </span>
              </div>
            )}
            
            <BrandButton
              variant="admin"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
            </BrandButton>
          </div>
        </div>
      </div>
    </header>
  );
}