/**
 * Custom Hook para usar el contexto de autenticación
 * Facilita el acceso al contexto en cualquier componente
 */

import { AuthContext } from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/auth.types';
import { useContext } from 'react';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @throws Error si se usa fuera del AuthProvider
 * @returns AuthContextType con user, login, register, logout
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};
