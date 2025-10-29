/**
 * Context para el estado del juego
 */

import { createGameSession, finishGame, saveUserAnswer } from '@/services/game';
import { getQuestionsForGame } from '@/services/questions';
import type {
    GameMode,
    GameSession,
    Question,
    QuestionCategory,
    QuestionDifficulty,
    UserAnswer,
} from '@/types/game';
import { createContext, ReactNode, useContext, useState } from 'react';

interface GameContextType {
  session: GameSession | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  startGame: (
    mode: GameMode,
    category?: QuestionCategory,
    difficulty?: QuestionDifficulty,
    userId?: string,
    preloadedQuestions?: Question[]
  ) => Promise<void>;
  answerQuestion: (answer: string, timeSpent: number) => Promise<void>;
  endGame: () => Promise<void>;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startGame = async (
    mode: GameMode,
    category?: QuestionCategory,
    difficulty?: QuestionDifficulty,
    userId?: string,
    preloadedQuestions?: Question[]
  ) => {
    setIsLoading(true);
    try {
      // Usar preguntas precargadas o cargarlas
      let questions: Question[];
      
      if (preloadedQuestions && preloadedQuestions.length > 0) {
        console.log(`🎮 Usando ${preloadedQuestions.length} preguntas precargadas`);
        questions = preloadedQuestions;
      } else {
        console.log('📡 Cargando preguntas desde Firestore...');
        questions = await getQuestionsForGame(
          category || 'art',
          difficulty,
          10, // 10 preguntas por partida
          userId
        );
      }

      if (questions.length === 0) {
        throw new Error('No hay preguntas disponibles para esta categoría');
      }

      // Crear sesión de juego
      const sessionId = await createGameSession(
        userId || 'guest',
        mode,
        questions,
        category,
        difficulty
      );

      const newSession: GameSession = {
        id: sessionId,
        userId: userId || 'guest',
        mode,
        category,
        difficulty,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        lives: 3,
        streak: 0,
        maxStreak: 0,
        startTime: new Date(),
        status: 'playing',
      };

      setSession(newSession);
      setCurrentQuestion(questions[0]);
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async (answer: string, timeSpent: number) => {
    if (!session || !currentQuestion) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    let pointsEarned = 0;

    if (isCorrect) {
      const basePoints = currentQuestion.points;
      
      // Bonus por tiempo en modo contrarreloj
      if (session.mode === 'timed') {
        const TIMER_DURATION = 15; // 15 segundos
        const timeSpentSeconds = timeSpent / 1000;
        const timeRemaining = Math.max(0, TIMER_DURATION - timeSpentSeconds);
        const timeBonus = Math.round((timeRemaining / TIMER_DURATION) * basePoints);
        
        pointsEarned = basePoints + timeBonus;
        console.log(`⏱️ Tiempo restante: ${timeRemaining.toFixed(1)}s | Bonus: +${timeBonus} pts | Total: ${pointsEarned}`);
      } else {
        pointsEarned = basePoints;
      }
    }

    // Crear objeto de respuesta
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeSpent,
      pointsEarned,
    };

    // Actualizar racha
    const newStreak = isCorrect ? session.streak + 1 : 0;
    const newMaxStreak = Math.max(session.maxStreak, newStreak);
    const newScore = session.score + pointsEarned;
    const newLives = isCorrect ? session.lives : session.lives - 1;

    // Guardar respuesta en Firestore
    await saveUserAnswer(
      session.id,
      userAnswer,
      newScore,
      newStreak,
      newMaxStreak
    );

    // Actualizar sesión local
    const updatedSession: GameSession = {
      ...session,
      answers: [...session.answers, userAnswer],
      score: newScore,
      streak: newStreak,
      maxStreak: newMaxStreak,
      lives: newLives,
      currentQuestionIndex: session.currentQuestionIndex + 1,
    };

    // Si hay más preguntas y vidas, mostrar siguiente
    if (
      updatedSession.currentQuestionIndex < updatedSession.questions.length &&
      newLives > 0
    ) {
      setSession(updatedSession);
      setCurrentQuestion(updatedSession.questions[updatedSession.currentQuestionIndex]);
    } else {
      // Juego terminado - actualizar status ANTES de setSession
      updatedSession.status = 'finished';
      console.log('🏁 Juego terminado!');
      console.log('  Preguntas respondidas:', updatedSession.answers.length);
      console.log('  Preguntas correctas:', updatedSession.answers.filter(a => a.isCorrect).length);
      console.log('  Puntuación final:', updatedSession.score);
      setSession(updatedSession);
      setCurrentQuestion(null);
    }
  };

  const endGame = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      await finishGame(session.id);
      setSession(null);
      setCurrentQuestion(null);
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setSession(null);
    setCurrentQuestion(null);
  };

  return (
    <GameContext.Provider
      value={{
        session,
        currentQuestion,
        isLoading,
        startGame,
        answerQuestion,
        endGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
