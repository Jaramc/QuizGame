/**
 * Pantalla de Login
 * Permite al usuario autenticarse
 */

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuth } from '@/hooks/useAuth';
import { authStyles } from '@/styles/auth.styles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

/**
 * Pantalla de Login con validaciones y animaciones
 */
export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Valida el formulario
   */
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      // La redirección se maneja en el AuthContext
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
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
            <Text style={authStyles.formTitle}>¡Bienvenido de nuevo!</Text>
            <Text style={authStyles.formSubtitle}>
              Inicia sesión para continuar jugando
            </Text>

            {/* Formulario */}
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
              autoComplete="password"
            />

            {/* Olvidaste contraseña */}
            <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
              <Text
                style={authStyles.linkButton}
                onPress={() => Alert.alert('Información', 'Función próximamente')}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </View>

            {/* Botón de login */}
            <AuthButton
              title="Iniciar Sesión"
              variant="primary"
              onPress={handleLogin}
              isLoading={isLoading}
            />

            {/* Divider */}
            <View style={authStyles.dividerContainer}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>o</Text>
              <View style={authStyles.dividerLine} />
            </View>

            {/* Link a registro */}
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>¿No tienes cuenta?</Text>
              <Text
                style={authStyles.linkButton}
                onPress={() => router.push('/auth/register')}
              >
                Regístrate
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
