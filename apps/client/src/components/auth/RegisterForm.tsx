'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Input, BrandButton } from '@sura-esenciafest/shared'
import { registerSchema, RegisterFormData, COUNTRIES, NEGOCIO_OPTIONS } from './schemas'
import { useAuth, handleAuthError } from './services'

interface RegisterFormProps {
  defaultEmail?: string
  isAutoRedirect?: boolean
  onRegisterSuccess?: () => void
  onBackToLogin?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  defaultEmail = '',
  isAutoRedirect = false,
  onRegisterSuccess,
  onBackToLogin 
}) => {
  const [error, setError] = useState<string | null>(null)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: defaultEmail,
      country: 'Colombia', // Default country
      negocio: 'Negocio 1' // Default negocio
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser.mutateAsync(data)
      onRegisterSuccess?.()
    } catch (err: unknown) {
      const authError = handleAuthError(err)
      setError(authError.message)
    }
  }

  return (
    <Card className="w-full mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center pb-6 px-8 pt-8">
        <CardTitle className="text-xl font-medium text-gray-800">
          {isAutoRedirect ? 'Completar Registro' : 'Crear Cuenta'}
        </CardTitle>
        <p className="text-gray-500 text-sm mt-2">
          {isAutoRedirect 
            ? 'Parece que es la primera vez que ingresas, completa estos datos para continuar' 
            : 'Únete a Esencia Fest 2025'
          }
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className={`border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 ${
                errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
              readOnly={!!defaultEmail}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Juan"
                {...register('name')}
                className={`border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 ${
                  errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastname" className="text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <Input
                id="lastname"
                type="text"
                placeholder="Pérez"
                {...register('lastname')}
                className={`border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 ${
                  errors.lastname ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              {errors.lastname && (
                <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="negocio" className="text-sm font-medium text-gray-700">
              Negocio
            </label>
            <select
              id="negocio"
              {...register('negocio')}
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                errors.negocio ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            >
              {NEGOCIO_OPTIONS.map((negocio) => (
                <option key={negocio} value={negocio}>
                  {negocio}
                </option>
              ))}
            </select>
            {errors.negocio && (
              <p className="text-red-500 text-xs mt-1">{errors.negocio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-gray-700">
              País
            </label>
            <select
              id="country"
              {...register('country')}
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                errors.country ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <BrandButton
              type="submit"
              variant="client"
              size="lg"
              className="w-full font-medium transition-all duration-200 hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </BrandButton>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Volver al Login
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}