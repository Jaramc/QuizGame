/**
 * Context de Autenticación
 * Maneja el estado global del usuario y las operaciones de auth
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AuthState, 
  AuthContextType, 
  LoginCredentials, 
  RegisterCredentials 
} from '@/types/auth.types';

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// Constantes
const STORAGE_KEY = '@quizgame_user';

/**
 * Provider de Autenticación
 * Envuelve la app y provee el contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Carga el usuario desde AsyncStorage
   */
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        const user: User = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Función de Login
   * Por ahora simula autenticación, pero se puede conectar a API
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // Simulación de validación (reemplazar con API real)
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (credentials.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear usuario mock
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        username: credentials.email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Actualizar estado
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Función de Registro
   * Valida y crea nuevo usuario
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      // Validaciones
      if (!credentials.username || !credentials.email || !credentials.password) {
        throw new Error('Todos los campos son requeridos');
      }

      if (credentials.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Email inválido');
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear usuario
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        username: credentials.username,
        createdAt: new Date().toISOString(),
      };

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Actualizar estado
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Función de Logout
   * Limpia el estado y el storage
   */
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
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
