/**
 * Pantalla de bienvenida
 * Primera pantalla que ve el usuario con animaciones
 */

import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { authStyles } from '@/styles/auth.styles';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

/**
 * Pantalla de Bienvenida
 * Muestra logo y opciones para Login/Register
 */
export default function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al home
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={authStyles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={authStyles.welcomeContainer}>
        {/* Logo animado */}
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={authStyles.logoContainer}
        >
          <View style={authStyles.logo}>
            <Text style={authStyles.logoText}>Q</Text>
          </View>
          
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={authStyles.welcomeTitle}
          >
            QuizGame
          </Animatable.Text>
          
          <Animatable.Text
            animation="fadeInUp"
            delay={700}
            style={authStyles.welcomeSubtitle}
          >
            Desafía tu conocimiento y divié rtete
          </Animatable.Text>
        </Animatable.View>

        {/* Botones */}
        <Animatable.View
          animation="fadeInUp"
          delay={900}
          style={{ width: '100%', paddingHorizontal: 20 }}
        >
          <AuthButton
            title="Iniciar Sesión"
            variant="primary"
            onPress={() => router.push('/auth/login')}
          />
          
          <AuthButton
            title="Crear Cuenta"
            variant="secondary"
            onPress={() => router.push('/auth/register')}
          />
        </Animatable.View>

        {/* Footer */}
        <Animatable.Text
          animation="fadeIn"
          delay={1200}
          style={[authStyles.linkText, { marginTop: 40 }]}
        >
          ¿Ya tienes una cuenta?{' '}
          <Text
            style={authStyles.linkButton}
            onPress={() => router.push('/auth/login')}
          >
            Inicia sesión
          </Text>
        </Animatable.Text>
      </View>
    </SafeAreaView>
  );
}
