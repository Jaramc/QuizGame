/**
 * Pantalla de Registro
 * Permite crear una nueva cuenta
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { authStyles } from '@/styles/auth.styles';
import { useAuth } from '@/hooks/useAuth';

/**
 * Pantalla de Registro con validaciones
 */
export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Valida el formulario
   */
  const validate = (): boolean => {
    const newErrors: any = {};

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
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View
            animation="fadeInDown"
            duration={800}
            style={authStyles.formContainer}
          >
            {/* Header */}
            <Text style={authStyles.formTitle}>Crear Cuenta</Text>
            <Text style={authStyles.formSubtitle}>
              Únete y empieza a jugar
            </Text>

            {/* Formulario */}
            <AuthInput
              label="Nombre de Usuario"
              icon="person"
              placeholder="tucoolusername"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
              autoComplete="username"
            />

            <AuthInput
              label="Email"
              icon="mail"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <AuthInput
              label="Contraseña"
              icon="lock-closed"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              autoComplete="password-new"
            />

            <AuthInput
              label="Confirmar Contraseña"
              icon="lock-closed"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
              autoComplete="password-new"
            />

            {/* Botón de registro */}
            <AuthButton
              title="Crear Cuenta"
              variant="primary"
              onPress={handleRegister}
              isLoading={isLoading}
            />

            {/* Divider */}
            <View style={authStyles.dividerContainer}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>o</Text>
              <View style={authStyles.dividerLine} />
            </View>

            {/* Link a login */}
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>¿Ya tienes cuenta?</Text>
              <Text
                style={authStyles.linkButton}
                onPress={() => router.push('/auth/login')}
              >
                Inicia sesión
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
