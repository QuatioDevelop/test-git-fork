'use client'

import React from 'react';
import { EsenciaFestLogo } from '@sura-esenciafest/shared';
import { UserHeader } from '@/components/layout/UserHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen">
        <EsenciaFestLogo size="xl" priority={true} variant="client" />
      </div>
    </div>
  );
}
