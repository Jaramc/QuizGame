/**
 * Pantalla de bienvenida con Splash Screen
 * Primera pantalla que ve el usuario con logo animado
 */

import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { authStyles } from '@/styles/auth.styles';
import { Colors, Gradients } from '@/styles/colors';
import { welcomeStyles } from '@/styles/welcome.styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

/**
 * Pantalla de Bienvenida con Splash Screen
 */
export default function WelcomeScreen() {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Si ya está autenticado, redirigir a modal (temporal)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/modal');
    }
  }, [isAuthenticated]);

  // Mostrar splash por 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Pantalla de Splash con logo animado
  if (showSplash) {
    return (
      <LinearGradient
        colors={Gradients.primary as any}
        style={welcomeStyles.splashContainer}
      >
        <StatusBar barStyle="light-content" />
        
        {/* Logo animado */}
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={welcomeStyles.logoWrapper}
        >
          {/* Círculos decorativos */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            style={[welcomeStyles.circleOuter, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          />
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            delay={500}
            style={[welcomeStyles.circleMiddle, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}
          />
          
          {/* Logo principal */}
          <View style={welcomeStyles.logoContainer}>
            <Animatable.Text
              animation="fadeIn"
              delay={500}
              style={welcomeStyles.logoQuestion}
            >
              ?
            </Animatable.Text>
          </View>
        </Animatable.View>

        {/* Título animado */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={1000}
        >
          <Text style={welcomeStyles.splashTitle}>QuizGame</Text>
          <Text style={welcomeStyles.splashSubtitle}>¡Pon a prueba tu conocimiento!</Text>
        </Animatable.View>

        {/* Loading indicator */}
        <Animatable.View
          animation="fadeIn"
          delay={1200}
          duration={1000}
          style={welcomeStyles.loadingContainer}
        >
          <Animatable.View
            animation="rotate"
            iterationCount="infinite"
            duration={1500}
            easing="linear"
            style={welcomeStyles.loadingCircle}
          />
        </Animatable.View>
      </LinearGradient>
    );
  }

  // Pantalla principal de bienvenida
  return (
    <SafeAreaView style={authStyles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={authStyles.welcomeContainer}>
        {/* Logo con animación de entrada */}
        <Animatable.View
          animation="zoomIn"
          duration={800}
          style={authStyles.logoContainer}
        >
          <LinearGradient
            colors={Gradients.primary as any}
            style={authStyles.logo}
          >
            <Text style={authStyles.logoText}>?</Text>
          </LinearGradient>
          
          <Animatable.Text
            animation="fadeInUp"
            delay={300}
            style={authStyles.welcomeTitle}
          >
            QuizGame
          </Animatable.Text>
          
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={authStyles.welcomeSubtitle}
          >
            Desafía tu conocimiento y diviértete
          </Animatable.Text>
        </Animatable.View>

        {/* Características con iconos */}
        <Animatable.View
          animation="fadeInUp"
          delay={700}
          style={welcomeStyles.featuresContainer}
        >
          <View style={welcomeStyles.feature}>
            <Ionicons name="albums" size={32} color={Colors.category.art} style={welcomeStyles.featureIcon} />
            <Text style={welcomeStyles.featureText}>6 Categorías</Text>
          </View>
          <View style={welcomeStyles.feature}>
            <Ionicons name="trophy" size={32} color={Colors.category.sports} style={welcomeStyles.featureIcon} />
            <Text style={welcomeStyles.featureText}>Competitivo</Text>
          </View>
          <View style={welcomeStyles.feature}>
            <Ionicons name="flash" size={32} color={Colors.category.science} style={welcomeStyles.featureIcon} />
            <Text style={welcomeStyles.featureText}>Rápido</Text>
          </View>
        </Animatable.View>

        {/* Botones */}
        <Animatable.View
          animation="fadeInUp"
          delay={900}
          style={{ width: '100%', paddingHorizontal: 20 }}
        >
          <AuthButton
            title="Comenzar"
            variant="primary"
            onPress={() => router.push('/auth/login')}
          />
          
          <View style={authStyles.linkContainer}>
            <Text style={authStyles.linkText}>¿Primera vez?</Text>
            <Text
              style={authStyles.linkButton}
              onPress={() => router.push('/auth/register')}
            >
              Crear cuenta
            </Text>
          </View>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
}
