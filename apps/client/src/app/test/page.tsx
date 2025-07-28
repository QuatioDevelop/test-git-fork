'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@sura-esenciafest/shared'
import { FeatureValidationChecklist } from '@/components/debug/FeatureValidationChecklist'
import { CheckCircle2, AlertCircle, LogOut } from 'lucide-react'
import { useAuthContext } from '@/components/auth/AuthProvider'

export default function TestPage() {
  const { logout } = useAuthContext()

  const handleLogout = () => {
    logout.mutate(true)
  }

  // Guardar que el usuario viene de /test para navegación de regreso
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('testPageOrigin', '/test')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Página de Validación
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Instrucciones</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Utiliza el checklist para validar cada funcionalidad</li>
                <li>• Los items con auto-verificación se marcarán automáticamente</li>
                <li>• Marca manualmente los items que pruebes</li>
                <li>• Reporta cualquier problema encontrado</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <FeatureValidationChecklist />
      </div>
    </div>
  )
}