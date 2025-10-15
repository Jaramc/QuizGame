/**
 * Context de Autenticación con Firebase
 * Maneja el estado global del usuario y las operaciones de auth
 */

import {
    logout as firebaseLogout,
    loginWithEmail,
    onAuthStateChanged,
    registerWithEmail
} from '@/services/auth/authService';
import type {
    AuthContextType,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
} from '@/types/auth';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de Autenticación con Firebase
 * Envuelve la app y provee el contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Escuchar cambios de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    // Cleanup al desmontar
    return () => unsubscribe();
  }, []);

  /**
   * Función de Login con Firebase
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const user = await loginWithEmail(credentials);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  /**
   * Función de Registro con Firebase
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const user = await registerWithEmail(credentials);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  /**
   * Función de Logout con Firebase
   */
  const logout = async (): Promise<void> => {
    try {
      await firebaseLogout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
