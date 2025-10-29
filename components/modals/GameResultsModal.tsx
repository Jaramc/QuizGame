/**
 * Modal de resultados del juego
 * Muestra puntuación, precisión y estadísticas
 */

import { Colors } from '@/styles/colors';
import type { GameSession } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useEffect } from 'react';

interface GameResultsModalProps {
  visible: boolean;
  session: GameSession | null;
  onPlayAgain: () => void;
  onViewRanking: () => void;
  onClose: () => void;
}

export function GameResultsModal({
  visible,
  session,
  onPlayAgain,
  onViewRanking,
  onClose,
}: GameResultsModalProps) {
  if (!session) return null;

  // Calcular estadísticas basadas en respuestas dadas (no en total de preguntas)
  const totalAnswered = session.answers.length;
  const correctAnswers = session.answers.filter(a => a.isCorrect).length;
  const accuracy = totalAnswered > 0 
    ? Math.round((correctAnswers / totalAnswered) * 100) 
    : 0;
  const score = session.score;

  // Debug solo cuando el modal se muestra
  useEffect(() => {
    if (visible) {
      console.log('🎉 ===== MODAL DE RESULTADOS MOSTRADO =====');
      console.log('📊 Estadísticas del juego:');
      console.log('  Total respondidas:', totalAnswered);
      console.log('  Correctas:', correctAnswers);
      console.log('  Precisión:', accuracy + '%');
      console.log('  Puntuación:', score);
      console.log('  Racha máxima:', session.maxStreak);
      console.log('  Respuestas:', session.answers.map(a => ({
        isCorrect: a.isCorrect,
        points: a.pointsEarned
      })));
      console.log('==========================================');
    }
  }, [visible]);

  // Determinar mensaje según rendimiento
  const getMessage = () => {
    if (accuracy >= 90) return '¡Excelente! 🏆';
    if (accuracy >= 70) return '¡Muy bien! 🎯';
    if (accuracy >= 50) return '¡Buen intento! 💪';
    return '¡Sigue practicando! 📚';
  };

  const getScoreColor = () => {
    if (accuracy >= 90) return Colors.success;
    if (accuracy >= 70) return Colors.primary;
    if (accuracy >= 50) return Colors.accent;
    return Colors.error;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />

        <Animatable.View
          animation="zoomIn"
          duration={500}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Animatable.View
              animation="bounceIn"
              delay={300}
              style={styles.iconContainer}
            >
              <Ionicons 
                name={accuracy >= 70 ? "trophy" : "ribbon"} 
                size={64} 
                color={getScoreColor()} 
              />
            </Animatable.View>

            <Animatable.Text
              animation="fadeInDown"
              delay={400}
              style={styles.title}
            >
              {getMessage()}
            </Animatable.Text>
            
            <Animatable.Text
              animation="fadeInDown"
              delay={500}
              style={styles.subtitle}
            >
              Juego Terminado
            </Animatable.Text>
          </View>

          {/* Score */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            style={[styles.scoreCard, { borderColor: getScoreColor() }]}
          >
            <Text style={styles.scoreLabel}>Puntuación Final</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
              {score}
            </Text>
            <Text style={styles.scoreSubtext}>puntos</Text>
          </Animatable.View>

          {/* Stats */}
          <Animatable.View
            animation="fadeInUp"
            delay={700}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.success }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correctas</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary }]}>
                <Ionicons name="analytics" size={24} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Precisión</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accent }]}>
                <Ionicons name="flame" size={24} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{session.maxStreak}</Text>
              <Text style={styles.statLabel}>Mejor racha</Text>
            </View>
          </Animatable.View>

          {/* Actions */}
          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={styles.actions}
          >
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onPlayAgain}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Jugar de Nuevo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onViewRanking}
              activeOpacity={0.8}
            >
              <Ionicons name="trophy-outline" size={24} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Ver Ranking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Volver al Menú</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  scoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 16,
    color: Colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  actions: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    color: Colors.textLight,
    fontSize: 16,
  },
});
