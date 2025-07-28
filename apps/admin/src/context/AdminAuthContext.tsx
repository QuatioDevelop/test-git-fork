'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signOut, AuthUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

interface AdminAuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Configure Amplify on mount
  useEffect(() => {
    const cognitoConfig = {
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_ag7XaeJiq',
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '2ee9a14lggqjis6d387gu2iam9',
          identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || 'us-east-1:21d4269f-37ed-44d4-b1db-cb93e782ab4b',
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: 'code' as const,
          userAttributes: {
            email: {
              required: true,
            },
          },
          allowGuestAccess: false,
          passwordFormat: {
            minLength: 12,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: true,
          },
        },
      },
    };

    Amplify.configure(cognitoConfig);
    checkAuthState();
  }, []);

  // Check if user is already authenticated on mount
  // useEffect(() => {
  //   checkAuthState();
  // }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (authError) {
      setUser(null);
      // Don't set error for initial check - user might just not be logged in
      console.log('No authenticated user found', authError);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { isSignedIn } = await signIn({
        username: email,
        password: password,
      });

      if (isSignedIn) {
        // Get user details after successful sign in
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setUser(null);
      
      // Handle specific Cognito errors
      const cognitoError = error as { name?: string };
      if (cognitoError.name === 'NotAuthorizedException') {
        setError('Email o contraseña incorrectos');
      } else if (cognitoError.name === 'UserNotConfirmedException') {
        setError('Usuario no confirmado. Por favor, contacta al administrador.');
      } else if (cognitoError.name === 'UserNotFoundException') {
        setError('Usuario no encontrado');
      } else if (cognitoError.name === 'TooManyRequestsException') {
        setError('Demasiados intentos. Inténtalo más tarde.');
      } else {
        setError('Error de autenticación. Inténtalo de nuevo.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}