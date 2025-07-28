'use client'

import React, { useState, useEffect } from 'react'
import { Video, Globe, MessageSquare, Lock, Check } from 'lucide-react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface ChecklistItem {
  id: string
  label: string
  description?: string
  checked: boolean
  status: 'pending' | 'success'
  category: string
  icon?: React.ReactNode
  testLink?: string
  autoCheck?: () => boolean | Promise<boolean>
}

export function FeatureValidationChecklist() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])

  // Load checklist from sessionStorage or initialize
  useEffect(() => {
    const baseItems: ChecklistItem[] = [
      // Authentication - Solo verificar que está autenticado
      {
        id: 'auth-status',
        label: 'Usuario autenticado',
        description: 'Proceso de registro/login completado',
        checked: false,
        status: 'pending',
        category: 'Autenticación',
        icon: <Lock className="w-4 h-4" />,
        autoCheck: () => Boolean(isAuthenticated && user?.email)
      },

      // Room Content - Solo salas con contenido funcional
      {
        id: 'sala1-vimeo',
        label: 'Sala 1 - Video Vimeo reproduce',
        description: 'Video se carga y reproduce correctamente',
        checked: false,
        status: 'pending',
        category: 'Contenido de Salas',
        icon: <Video className="w-4 h-4" />,
        testLink: '/sala1'
      },
      {
        id: 'sala2-genially',
        label: 'Sala 2 - Contenido Genially carga',
        description: 'Iframe de Genially se muestra correctamente',
        checked: false,
        status: 'pending',
        category: 'Contenido de Salas',
        icon: <Globe className="w-4 h-4" />,
        testLink: '/sala2'
      },
      {
        id: 'sala5-vimeo-chat',
        label: 'Sala 5 - Video + Chat funciona',
        description: 'Video Vimeo y funcionalidad de chat',
        checked: false,
        status: 'pending',
        category: 'Contenido de Salas',
        icon: <MessageSquare className="w-4 h-4" />,
        testLink: '/sala5'
      }
    ]

    // Load saved checklist state from sessionStorage
    if (typeof window !== 'undefined') {
      const savedChecklist = sessionStorage.getItem('validation-checklist')
      if (savedChecklist) {
        try {
          const savedState = JSON.parse(savedChecklist)
          // Merge saved state with base items, preserving icons and functions
          const mergedItems = baseItems.map(baseItem => {
            const savedItem = savedState.find((s: { id: string }) => s.id === baseItem.id)
            return savedItem ? {
              ...baseItem,
              checked: savedItem.checked,
              status: savedItem.status as 'pending' | 'success'
            } : baseItem
          })
          setChecklistItems(mergedItems)
          return
        } catch (error) {
          console.warn('Error loading saved checklist:', error)
        }
      }
    }

    setChecklistItems(baseItems)
  }, [isAuthenticated, user])

  // Run automatic checks
  useEffect(() => {
    const runAutoChecks = async () => {
      const updatedItems = await Promise.all(
        checklistItems.map(async (item) => {
          if (item.autoCheck) {
            try {
              const result = await item.autoCheck()
              return {
                ...item,
                checked: result,
                status: result ? 'success' as const : 'pending' as const
              }
            } catch (error) {
              console.error(`Error checking ${item.id}:`, error)
              return {
                ...item,
                status: 'pending' as const
              }
            }
          }
          return item
        })
      )
      setChecklistItems(updatedItems)
    }

    if (checklistItems.length > 0) {
      runAutoChecks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistItems.length, isAuthenticated, user])

  const toggleItem = (id: string) => {
    setChecklistItems(items => {
      const updatedItems = items.map(item =>
        item.id === id
          ? { 
              ...item, 
              checked: !item.checked,
              status: !item.checked ? ('success' as const) : ('pending' as const)
            }
          : item
      )
      
      // Save to sessionStorage
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const saveableItems = updatedItems.map(({ icon, autoCheck, ...item }) => item)
        sessionStorage.setItem('validation-checklist', JSON.stringify(saveableItems))
      }
      
      return updatedItems
    })
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const categorizedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  const totalItems = checklistItems.length
  const completedItems = checklistItems.filter(item => item.checked).length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Validación de Funcionalidades</h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progreso de validación</span>
          <span className="text-sm font-medium text-gray-900">{completedItems}/{totalItems} ({completionPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items by Category */}
      <div className="space-y-6">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              {items[0]?.icon}
              {category}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {getStatusIcon(item.status)}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-900 cursor-pointer">
                        {item.label}
                      </label>
                      {item.testLink && (
                        <button
                          onClick={() => item.testLink && router.push(item.testLink)}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Probar
                        </button>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">Resumen de validación:</p>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>{checklistItems.filter(i => i.status === 'success').length} funcionalidades verificadas</span>
          </div>
        </div>
      </div>
    </div>
  )
}