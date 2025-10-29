/**
 * Pantalla principal del juego
 * Muestra preguntas y maneja la lógica del juego
 */

import { GameResultsModal } from '@/components/modals';
import { useGame } from '@/contexts/game';
import { useAuth } from '@/hooks/auth';
import { Colors } from '@/styles/colors';
import type { GameMode, Question, QuestionCategory, QuestionDifficulty } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameScreen() {
  const params = useLocalSearchParams<{
    mode: string;
    category: string;
    difficulty: string;
    questions: string;
  }>();
  
  const { user } = useAuth();
  const { session, currentQuestion, isLoading, startGame, answerQuestion, endGame } = useGame();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(15); // 15 segundos para modo contrarreloj
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const hasShownResultsRef = useRef(false); // Usar ref para evitar re-renders
  const hasInitializedRef = useRef(false); // Evitar inicializar múltiples veces

  const mode = params.mode as GameMode;
  const isTimed = mode === 'timed';
  const TIMER_DURATION = 15; // 15 segundos por pregunta

  // Iniciar juego - SOLO UNA VEZ
  useEffect(() => {
    // Evitar inicializar múltiples veces
    if (hasInitializedRef.current) {
      console.log('⚠️ Intento de reinicializar juego bloqueado');
      return;
    }

    const initGame = async () => {
      try {
        hasInitializedRef.current = true;
        console.log('🎮 Inicializando juego...');
        
        // Si tenemos preguntas precargadas, usarlas
        let questions: Question[] | undefined;
        if (params.questions) {
          questions = JSON.parse(params.questions);
        }

        const userId = user?.id;
        await startGame(
          mode,
          params.category as QuestionCategory,
          params.difficulty as QuestionDifficulty,
          userId,
          questions // Pasar las preguntas precargadas
        );
        setQuestionStartTime(Date.now());
      } catch (error: any) {
        console.error('Error starting game:', error);
        router.back();
      }
    };

    initGame();
  }, []);

  // Timer para modo contrarreloj
  useEffect(() => {
    if (!isTimed || !currentQuestion || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(''); // Tiempo agotado - respuesta incorrecta
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isAnswered, isTimed]);

  // Reset al cambiar de pregunta
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(TIMER_DURATION);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion]);

  // Verificar fin del juego - Mostrar modal INMEDIATAMENTE
  useEffect(() => {
    if (session?.status === 'finished' && !hasShownResultsRef.current) {
      console.log('🎯 Detectado fin de juego - Mostrando modal AHORA!');
      hasShownResultsRef.current = true;
      setShowResultsModal(true);
    }
  }, [session?.status]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered || !currentQuestion) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    const timeSpent = Date.now() - questionStartTime;

    // Determinar si es la última pregunta
    const isLastQuestion = session && 
      (session.currentQuestionIndex + 1 >= session.questions.length || 
       (answer !== currentQuestion.correctAnswer && session.lives <= 1));

    // Reducir delay si es la última pregunta
    const feedbackDelay = isLastQuestion ? 800 : 1500;

    setTimeout(async () => {
      await answerQuestion(answer, timeSpent);
    }, feedbackDelay);
  };

  const handleGameEnd = () => {
    setShowResultsModal(true);
  };

  // Renderizar modal si el juego está terminado (incluso sin currentQuestion)
  if (session?.status === 'finished' || showResultsModal) {
    console.log('📱 Renderizando pantalla de resultados. showModal:', showResultsModal, 'session:', !!session);
    return (
      <SafeAreaView style={styles.safeArea}>
        {showResultsModal && session && (
          <GameResultsModal
            visible={showResultsModal}
            session={session}
            onPlayAgain={async () => {
              setShowResultsModal(false);
              hasShownResultsRef.current = false;
              hasInitializedRef.current = false;
              await endGame();
              router.back();
            }}
            onViewRanking={async () => {
              setShowResultsModal(false);
              hasShownResultsRef.current = false;
              hasInitializedRef.current = false;
              await endGame();
              router.replace('/(dashboard)/ranking');
            }}
            onClose={async () => {
              setShowResultsModal(false);
              hasShownResultsRef.current = false;
              hasInitializedRef.current = false;
              await endGame();
              router.replace('/(dashboard)');
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  if (isLoading || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite" duration={1000}>
            <Ionicons name="game-controller" size={64} color={Colors.primary} />
          </Animatable.View>
          <Text style={styles.loadingText}>Cargando preguntas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mezclar respuestas
  const allAnswers = [
    currentQuestion.correctAnswer,
    ...currentQuestion.incorrectAnswers,
  ].sort(() => Math.random() - 0.5);

  const progress =
    ((session?.currentQuestionIndex || 0) / (session?.questions.length || 1)) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={20} color={Colors.accent} />
              <Text style={styles.statText}>{session?.score || 0}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color={Colors.error} />
              <Text style={styles.statText}>{session?.streak || 0}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color={Colors.error} />
              <Text style={styles.statText}>{session?.lives || 3}</Text>
            </View>

            {isTimed && (
              <View style={[styles.statItem, styles.timerContainer]}>
                <Ionicons 
                  name="timer" 
                  size={20} 
                  color={timeLeft < 6 ? Colors.error : Colors.primary} 
                />
                <Text style={[
                  styles.statText, 
                  timeLeft < 6 && styles.urgentText
                ]}>
                  {timeLeft}s
                </Text>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.questionCounter}>
            Pregunta {(session?.currentQuestionIndex || 0) + 1} de{' '}
            {session?.questions.length || 10}
          </Text>
        </View>

        {/* Pregunta */}
        <Animatable.View
          animation="fadeInDown"
          duration={600}
          style={styles.questionContainer}
        >
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>
        </Animatable.View>

        {/* Respuestas */}
        <View style={styles.answersContainer}>
          {allAnswers.map((answer, index) => {
            const isCorrect = answer === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === answer;
            const showCorrect = isAnswered && isCorrect;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            let backgroundColor = Colors.card;
            let borderColor = Colors.border;

            if (showCorrect) {
              backgroundColor = Colors.success;
              borderColor = Colors.success;
            } else if (showIncorrect) {
              backgroundColor = Colors.error;
              borderColor = Colors.error;
            }

            return (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                duration={600}
                delay={index * 100}
              >
                <TouchableOpacity
                  style={[
                    styles.answerButton,
                    { backgroundColor, borderColor },
                  ]}
                  onPress={() => handleAnswer(answer)}
                  disabled={isAnswered}
                  activeOpacity={0.8}
                >
                  <View style={styles.answerContent}>
                    <Text
                      style={[
                        styles.answerText,
                        (showCorrect || showIncorrect) && styles.answerTextWhite,
                      ]}
                    >
                      {answer}
                    </Text>
                    {showCorrect && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                    )}
                    {showIncorrect && (
                      <Ionicons name="close-circle" size={24} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>

        {/* Puntos de la pregunta */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>
            +{currentQuestion.points} puntos
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#FFD60A',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  questionCounter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  questionContainer: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  answersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  answerButton: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  answerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  answerTextWhite: {
    color: '#FFF',
    fontWeight: '600',
  },
  pointsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
});
