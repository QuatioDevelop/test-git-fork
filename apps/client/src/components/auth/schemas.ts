import { z } from 'zod'

// Login schema - only email required
export const loginSchema = z.object({
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .min(1, 'El email es requerido'),
})

// Registration schema - all fields required for new users
export const registerSchema = z.object({
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .min(1, 'El email es requerido'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastname: z
    .string()
    .min(1, 'Los apellidos son requeridos')
    .max(50, 'Los apellidos no pueden tener más de 50 caracteres'),
  country: z
    .string()
    .min(1, 'El país es requerido'),
  negocio: z
    .string()
    .min(1, 'El negocio es requerido'),
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Specific countries for dropdown (as per mockup)
export const COUNTRIES = [
  'México',
  'Colombia',
  'Perú',
  'Chile',
  'Uruguay',
  'El Salvador',
] as const

// Negocio options
export const NEGOCIO_OPTIONS = [
  'Negocio 1',
  'Negocio 2',
  'Negocio 3',
  'Negocio 4',
  'Negocio 5',
] as const