import { ReactNode } from 'react'
import { Metadata } from 'next'

interface SalasLayoutProps {
  children: ReactNode
}

// Basic metadata for the salas section
export const metadata: Metadata = {
  title: 'Salas - Esencia Fest 2025',
  description: 'Explora las salas interactivas del evento Esencia Fest 2025',
}

export default function SalasLayout({ children }: SalasLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}