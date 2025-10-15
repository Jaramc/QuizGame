/**
 * Pantalla de Login
 * Permite al usuario autenticarse
 */

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useLoginForm } from '@/hooks/useLoginForm';
import { authStyles } from '@/styles/auth.styles';
import { router } from 'expo-router';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Pantalla de Login con validaciones y animaciones
 */
export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    isLoading,
    handleLogin,
  } = useLoginForm();

  return (
    <SafeAreaView style={authStyles.safeArea} edges={['top', 'bottom']}>
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
                onPress={() => alert('Función próximamente')}
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
