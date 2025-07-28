'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EsenciaFestLogo } from '@sura-esenciafest/shared'
import { LoginForm } from '../../components/auth/LoginForm'
import { RegisterForm } from '../../components/auth/RegisterForm'

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)
  const [registerEmail, setRegisterEmail] = useState('')
  const [isAutoRedirect, setIsAutoRedirect] = useState(false)
  const router = useRouter()

  const handleNeedRegister = (email: string) => {
    setRegisterEmail(email)
    setIsAutoRedirect(true)
    setShowRegister(true)
  }

  const handleAuthSuccess = () => {
    // Redirect to intended page or home
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/'
    router.push(redirectUrl)
  }

  const handleBackToLogin = () => {
    setShowRegister(false)
    setRegisterEmail('')
    setIsAutoRedirect(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-12">
        <EsenciaFestLogo className="h-12 w-auto opacity-90" />
      </div>

      {/* Auth forms */}
      <div className="w-full max-w-md">
        {showRegister ? (
          <RegisterForm
            defaultEmail={registerEmail}
            isAutoRedirect={isAutoRedirect}
            onRegisterSuccess={handleAuthSuccess}
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          <LoginForm
            onNeedRegister={handleNeedRegister}
            onLoginSuccess={handleAuthSuccess}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-400">
        <p>© 2025 SURA - Esencia Fest</p>
      </div>
    </div>
  )
}