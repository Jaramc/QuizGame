/**
 * Modal de éxito para registro de cuenta
 * Con animaciones llamativas y confetti effect
 */

import { Colors } from '@/styles/colors';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  username: string;
  onContinue: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  username,
  onContinue,
}) => {
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkmarkAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(0);
      });

      // Secuencia de animaciones
      Animated.sequence([
        // Fade in del overlay
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale in del modal
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Checkmark aparece
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animation
      setTimeout(() => {
        confettiAnims.forEach((anim, index) => {
          const randomX = (Math.random() - 0.5) * width;
          const randomRotate = Math.random() * 720;

          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: height,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: randomX,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: randomRotate,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.delay(1000),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        });
      }, 500);
    }
  }, [visible]);

  if (!visible) return null;

  const confettiColors = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    Colors.success,
    '#FF6B9D',
    '#C44569',
  ];

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor:
                  confettiColors[index % confettiColors.length],
                left: width / 2,
                top: height * 0.3,
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Checkmark Circle */}
          <Animated.View
            style={[
              styles.checkmarkCircle,
              {
                transform: [{ scale: checkmarkAnim }],
              },
            ]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>

          {/* Success Text */}
          <Text style={styles.title}>¡Cuenta Creada!</Text>
          <Text style={styles.subtitle}>
            Bienvenido, <Text style={styles.username}>{username}</Text>
          </Text>
          <Text style={styles.message}>
            Tu cuenta ha sido creada exitosamente. 🎉
          </Text>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continuar al Login</Text>
          </TouchableOpacity>

          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  checkmark: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  username: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.05,
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    opacity: 0.05,
    bottom: -30,
    left: -30,
  },
});
