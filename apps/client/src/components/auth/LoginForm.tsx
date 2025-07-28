'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Input, BrandButton } from '@sura-esenciafest/shared'
import { loginSchema, LoginFormData } from './schemas'
import { useAuth, handleAuthError } from './services'

interface LoginFormProps {
  onNeedRegister?: (email: string) => void
  onLoginSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onNeedRegister, 
  onLoginSuccess 
}) => {
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login.mutateAsync(data)
      onLoginSuccess?.()
    } catch (err: unknown) {
      const authError = handleAuthError(err)
      
      // Handle registration required error
      if (authError.type === 'registration_required') {
        onNeedRegister?.(data.email)
        return
      }
      
      setError(authError.message)
    }
  }

  return (
    <Card className="w-full mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center pb-6 px-8 pt-8">
        <CardTitle className="text-xl font-medium text-gray-800">Iniciar Sesión</CardTitle>
        <p className="text-gray-500 text-sm mt-2">Ingresa tu email para continuar</p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className={`border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 ${
                errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <BrandButton
            type="submit"
            variant="client"
            size="lg"
            className="w-full mt-6 font-medium transition-all duration-200 hover:shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
          </BrandButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ¿Primera vez en Esencia Fest?{' '}
            <button
              type="button"
              onClick={() => onNeedRegister?.(getValues('email') || '')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}