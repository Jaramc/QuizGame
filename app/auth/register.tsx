/**
 * Pantalla de Registro
 * Permite crear una nueva cuenta
 */

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useRegisterForm } from '@/hooks/useRegisterForm';
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
 * Pantalla de Registro con validaciones
 */
export default function RegisterScreen() {
  const {
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
  } = useRegisterForm();

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
