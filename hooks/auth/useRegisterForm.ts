/**
 * Hook personalizado para la lógica del Register
 */

import { useAuth } from './useAuth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const useRegisterForm = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Valida el formulario
   */
  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ username, email, password, confirmPassword });
      // Redirigir a modal (temporal hasta que crees tu pantalla principal)
      router.replace('/modal');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    isLoading,
    handleRegister,
  };
};
