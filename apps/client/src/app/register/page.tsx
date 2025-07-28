'use client'

import { useRouter } from 'next/navigation'
import { EsenciaFestLogo } from '@sura-esenciafest/shared'
import { RegisterForm } from '../../components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  
  // Check if coming from login redirect
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const emailFromLogin = searchParams.get('email') || ''
  const isAutoRedirect = !!emailFromLogin

  const handleRegisterSuccess = () => {
    // Redirect to intended page or home
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/'
    router.push(redirectUrl)
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-12">
        <EsenciaFestLogo className="h-12 w-auto opacity-90" />
      </div>

      {/* Register form */}
      <div className="w-full max-w-md">
        <RegisterForm
          defaultEmail={emailFromLogin}
          isAutoRedirect={isAutoRedirect}
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-400">
        <p>© 2025 SURA - Esencia Fest</p>
      </div>
    </div>
  )
}