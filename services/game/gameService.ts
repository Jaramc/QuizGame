/**
 * Servicio para gestionar sesiones de juego y resultados
 * MODO LOCAL: Usa AsyncStorage en lugar de Firestore
 */

import { db } from '@/config/firebase';
import type {
    GameMode,
    GameResult,
    GameSession,
    Question,
    QuestionCategory,
    QuestionDifficulty,
    UserAnswer,
    UserStats,
} from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePlayerRanking } from '../ranking';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where
} from 'firebase/firestore';

const GAMES_COLLECTION = 'games';
const STATS_COLLECTION = 'userStats';
const LOCAL_STATS_KEY = '@quizgame_user_stats';
const LOCAL_SESSIONS_KEY = '@quizgame_game_sessions';
const USER_STORAGE_KEY = '@quizgame_user';

/**
 * Crear una nueva sesión de juego (LOCAL)
 */
export const createGameSession = async (
  userId: string,
  mode: GameMode,
  questions: Question[],
  category?: QuestionCategory,
  difficulty?: QuestionDifficulty
): Promise<string> => {
  try {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSession = {
      id: sessionId,
      userId,
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

    // Guardar sesión en AsyncStorage
    await AsyncStorage.setItem(
      `${LOCAL_SESSIONS_KEY}_${sessionId}`,
      JSON.stringify(session)
    );

    console.log('✅ Sesión de juego creada localmente:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw new Error('No se pudo iniciar la partida');
  }
};

/**
 * Obtener sesión de juego (LOCAL)
 */
const getLocalSession = async (sessionId: string): Promise<GameSession | null> => {
  try {
    const stored = await AsyncStorage.getItem(`${LOCAL_SESSIONS_KEY}_${sessionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        startTime: new Date(parsed.startTime),
        endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting local session:', error);
    return null;
  }
};

/**
 * Guardar sesión actualizada (LOCAL)
 */
const saveLocalSession = async (session: GameSession): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `${LOCAL_SESSIONS_KEY}_${session.id}`,
      JSON.stringify(session)
    );
  } catch (error) {
    console.error('Error saving local session:', error);
    throw new Error('No se pudo guardar la sesión');
  }
};

/**
 * Guardar respuesta del usuario (LOCAL)
 */
export const saveUserAnswer = async (
  gameId: string,
  answer: UserAnswer,
  newScore: number,
  newStreak: number,
  maxStreak: number
): Promise<void> => {
  try {
    const session = await getLocalSession(gameId);
    
    if (!session) {
      throw new Error('Sesión de juego no encontrada');
    }

    // Actualizar sesión
    session.answers.push(answer);
    session.score = newScore;
    session.streak = newStreak;
    session.maxStreak = maxStreak;
    session.currentQuestionIndex += 1;

    await saveLocalSession(session);
    console.log('✅ Respuesta guardada localmente');
  } catch (error) {
    console.error('Error saving answer:', error);
    throw new Error('No se pudo guardar la respuesta');
  }
};

/**
 * Finalizar partida y guardar resultado (LOCAL)
 */
export const finishGame = async (
  gameId: string
): Promise<GameResult> => {
  try {
    const session = await getLocalSession(gameId);

    if (!session) {
      throw new Error('Sesión de juego no encontrada');
    }

    const endTime = new Date();
    const startTime = session.startTime;

    // Calcular estadísticas
    const totalTime = endTime.getTime() - startTime.getTime();
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = session.answers.length - correctAnswers;
    const accuracy = session.answers.length > 0
      ? (correctAnswers / session.answers.length) * 100
      : 0;
    const averageTimePerQuestion = session.answers.length > 0
      ? session.answers.reduce((sum, a) => sum + a.timeSpent, 0) / session.answers.length
      : 0;

    // Crear resultado
    const result: GameResult = {
      id: gameId,
      userId: session.userId,
      mode: session.mode,
      category: session.category,
      difficulty: session.difficulty,
      totalQuestions: session.questions.length,
      correctAnswers,
      incorrectAnswers,
      score: session.score,
      accuracy,
      maxStreak: session.maxStreak,
      totalTime,
      averageTimePerQuestion,
      createdAt: endTime,
    };

    // Actualizar sesión
    session.status = 'finished';
    session.endTime = endTime;
    await saveLocalSession(session);

    // Actualizar estadísticas del usuario
    const updatedStats = await updateUserStats(result);
    
    // Actualizar ranking global
    // Obtener username del usuario almacenado
    try {
      const userDataStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        await updatePlayerRanking(
          session.userId,
          userData.username || 'Usuario',
          updatedStats.totalPoints,
          updatedStats.totalWins,
          updatedStats.accuracy,
          updatedStats.level,
          updatedStats.maxStreak
        );
      }
    } catch (rankingError) {
      console.error('Error updating ranking:', rankingError);
      // No lanzar error, solo registrar
    }

    console.log('✅ Juego finalizado localmente');
    return result;
  } catch (error) {
    console.error('Error finishing game:', error);
    throw new Error('No se pudo finalizar la partida');
  }
};

/**
 * Actualizar estadísticas del usuario (LOCAL)
 */
const updateUserStats = async (result: GameResult): Promise<UserStats> => {
  try {
    // Obtener estadísticas actuales
    const currentStats = await getUserStats(result.userId);
    
    const totalGames = currentStats.totalGames + 1;
    const isWin = result.accuracy >= 70;
    const totalWins = currentStats.totalWins + (isWin ? 1 : 0);

    // Calcular nueva precisión global
    const totalAccuracy = currentStats.totalGames > 0
      ? ((currentStats.accuracy * currentStats.totalGames) + result.accuracy) / totalGames
      : result.accuracy;

    // Actualizar racha
    const newStreak = isWin ? currentStats.currentStreak + 1 : 0;
    const newMaxStreak = Math.max(currentStats.maxStreak, result.maxStreak, newStreak);

    // Actualizar categorías
    const categoryKey = (result.category || 'art') as QuestionCategory; // Usar 'art' por defecto
    const gamesPerCategory: Partial<Record<QuestionCategory, number>> = {
      ...currentStats.gamesPerCategory,
      [categoryKey]: (currentStats.gamesPerCategory[categoryKey] || 0) + 1,
    };
    
    const currentCategoryAccuracy = currentStats.winRatePerCategory[categoryKey] || 0;
    const currentCategoryGames = currentStats.gamesPerCategory[categoryKey] || 0;
    const newCategoryAccuracy = currentCategoryGames > 0
      ? ((currentCategoryAccuracy * currentCategoryGames) + result.accuracy) / (gamesPerCategory[categoryKey] || 1)
      : result.accuracy;
    
    const winRatePerCategory: Partial<Record<QuestionCategory, number>> = {
      ...currentStats.winRatePerCategory,
      [categoryKey]: newCategoryAccuracy,
    };

    // Calcular nuevo nivel (cada 1000 puntos = 1 nivel)
    const totalPoints = currentStats.totalPoints + result.score;
    const newLevel = Math.floor(totalPoints / 1000) + 1;

    const updatedStats: UserStats = {
      userId: result.userId,
      totalGames,
      totalWins,
      totalPoints,
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      accuracy: totalAccuracy,
      level: newLevel,
      experiencePoints: totalPoints,
      gamesPerCategory,
      winRatePerCategory,
      questionsCreated: currentStats.questionsCreated,
      updatedAt: new Date(),
    };

    // Guardar en AsyncStorage
    await AsyncStorage.setItem(
      `${LOCAL_STATS_KEY}_${result.userId}`,
      JSON.stringify(updatedStats)
    );

    console.log('✅ Estadísticas actualizadas localmente');
    
    // Retornar las estadísticas actualizadas para usarlas en el ranking
    return updatedStats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas del usuario (LOCAL)
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const stored = await AsyncStorage.getItem(`${LOCAL_STATS_KEY}_${userId}`);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        updatedAt: new Date(parsed.updatedAt),
      };
    }
    
    // Retornar estadísticas iniciales
    return {
      userId,
      totalGames: 0,
      totalWins: 0,
      totalPoints: 0,
      currentStreak: 0,
      maxStreak: 0,
      accuracy: 0,
      level: 1,
      experiencePoints: 0,
      gamesPerCategory: {},
      winRatePerCategory: {},
      questionsCreated: 0,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    // Retornar estadísticas vacías en caso de error
    return {
      userId,
      totalGames: 0,
      totalWins: 0,
      totalPoints: 0,
      currentStreak: 0,
      maxStreak: 0,
      accuracy: 0,
      level: 1,
      experiencePoints: 0,
      gamesPerCategory: {},
      winRatePerCategory: {},
      questionsCreated: 0,
      updatedAt: new Date(),
    };
  }
};

/**
 * Obtener historial de partidas del usuario
 */
export const getUserGameHistory = async (
  userId: string,
  limitCount: number = 10
): Promise<GameResult[]> => {
  try {
    const q = query(
      collection(db, GAMES_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'finished'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as GameResult[];
  } catch (error) {
    console.error('Error getting game history:', error);
    return [];
  }
};

/**
 * Obtener ranking global
 */
export const getGlobalRanking = async (limitCount: number = 10): Promise<Array<{
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  accuracy: number;
}>> => {
  try {
    const q = query(
      collection(db, STATS_COLLECTION),
      orderBy('totalPoints', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      userId: doc.id,
      username: doc.data().username || 'Usuario',
      totalPoints: doc.data().totalPoints || 0,
      level: doc.data().level || 1,
      accuracy: doc.data().accuracy || 0,
    }));
  } catch (error) {
    console.error('Error getting global ranking:', error);
    return [];
  }
};
