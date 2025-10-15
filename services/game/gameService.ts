/**
 * Servicio para gestionar sesiones de juego y resultados
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
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

const GAMES_COLLECTION = 'games';
const STATS_COLLECTION = 'userStats';

/**
 * Crear una nueva sesión de juego
 */
export const createGameSession = async (
  userId: string,
  mode: GameMode,
  questions: Question[],
  category?: QuestionCategory,
  difficulty?: QuestionDifficulty
): Promise<string> => {
  try {
    const session: Omit<GameSession, 'id'> = {
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

    const docRef = await addDoc(collection(db, GAMES_COLLECTION), {
      ...session,
      startTime: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw new Error('No se pudo iniciar la partida');
  }
};

/**
 * Guardar respuesta del usuario
 */
export const saveUserAnswer = async (
  gameId: string,
  answer: UserAnswer,
  newScore: number,
  newStreak: number,
  maxStreak: number
): Promise<void> => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Sesión de juego no encontrada');
    }

    const currentAnswers = (gameDoc.data().answers || []) as UserAnswer[];

    await updateDoc(gameRef, {
      answers: [...currentAnswers, answer],
      score: newScore,
      streak: newStreak,
      maxStreak,
      currentQuestionIndex: increment(1),
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    throw new Error('No se pudo guardar la respuesta');
  }
};

/**
 * Finalizar partida y guardar resultado
 */
export const finishGame = async (
  gameId: string
): Promise<GameResult> => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Sesión de juego no encontrada');
    }

    const gameData = gameDoc.data() as Omit<GameSession, 'id'>;
    const endTime = new Date();
    const startTime = gameData.startTime instanceof Date 
      ? gameData.startTime 
      : (gameData.startTime as any).toDate();

    // Calcular estadísticas
    const totalTime = endTime.getTime() - startTime.getTime();
    const correctAnswers = gameData.answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = gameData.answers.length - correctAnswers;
    const accuracy = gameData.answers.length > 0
      ? (correctAnswers / gameData.answers.length) * 100
      : 0;
    const averageTimePerQuestion = gameData.answers.length > 0
      ? gameData.answers.reduce((sum, a) => sum + a.timeSpent, 0) / gameData.answers.length
      : 0;

    // Crear resultado
    const result: Omit<GameResult, 'id'> = {
      userId: gameData.userId,
      mode: gameData.mode,
      category: gameData.category,
      difficulty: gameData.difficulty,
      totalQuestions: gameData.questions.length,
      correctAnswers,
      incorrectAnswers,
      score: gameData.score,
      accuracy,
      maxStreak: gameData.maxStreak,
      totalTime,
      averageTimePerQuestion,
      createdAt: endTime,
    };

    // Actualizar sesión de juego
    await updateDoc(gameRef, {
      status: 'finished',
      endTime: Timestamp.now(),
    });

    // Actualizar estadísticas del usuario
    await updateUserStats(result);

    return {
      id: gameId,
      ...result,
    };
  } catch (error) {
    console.error('Error finishing game:', error);
    throw new Error('No se pudo finalizar la partida');
  }
};

/**
 * Actualizar estadísticas del usuario
 */
const updateUserStats = async (result: Omit<GameResult, 'id'>): Promise<void> => {
  try {
    const statsRef = doc(db, STATS_COLLECTION, result.userId);
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Crear estadísticas iniciales
      const initialStats: Omit<UserStats, 'userId'> = {
        totalGames: 1,
        totalWins: result.accuracy >= 70 ? 1 : 0,
        totalPoints: result.score,
        currentStreak: result.accuracy >= 70 ? 1 : 0,
        maxStreak: result.maxStreak,
        accuracy: result.accuracy,
        level: 1,
        experiencePoints: result.score,
        gamesPerCategory: result.category ? { [result.category]: 1 } : {},
        winRatePerCategory: result.category ? { [result.category]: result.accuracy } : {},
        questionsCreated: 0,
        updatedAt: new Date(),
      };

      await updateDoc(statsRef, {
        ...initialStats,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Actualizar estadísticas existentes
      const currentStats = statsDoc.data() as UserStats;
      const totalGames = currentStats.totalGames + 1;
      const isWin = result.accuracy >= 70;
      const totalWins = currentStats.totalWins + (isWin ? 1 : 0);

      // Calcular nueva precisión global
      const totalAccuracy = ((currentStats.accuracy * currentStats.totalGames) + result.accuracy) / totalGames;

      // Actualizar racha
      const newStreak = isWin ? currentStats.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(currentStats.maxStreak, result.maxStreak, newStreak);

      // Actualizar categorías
      const categoryKey = result.category as string || 'general';
      const gamesPerCategory: any = {
        ...currentStats.gamesPerCategory,
        [categoryKey]: (currentStats.gamesPerCategory[categoryKey as QuestionCategory] || 0) + 1,
      };
      
      const currentCategoryAccuracy = currentStats.winRatePerCategory[categoryKey as QuestionCategory] || 0;
      const currentCategoryGames = currentStats.gamesPerCategory[categoryKey as QuestionCategory] || 0;
      const newCategoryAccuracy = ((currentCategoryAccuracy * currentCategoryGames) + result.accuracy) / gamesPerCategory[categoryKey];
      
      const winRatePerCategory: any = {
        ...currentStats.winRatePerCategory,
        [categoryKey]: newCategoryAccuracy,
      };

      // Calcular nuevo nivel (cada 1000 puntos = 1 nivel)
      const totalPoints = currentStats.totalPoints + result.score;
      const newLevel = Math.floor(totalPoints / 1000) + 1;

      await updateDoc(statsRef, {
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
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    // No lanzamos error para no bloquear el flujo
  }
};

/**
 * Obtener estadísticas del usuario
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const statsRef = doc(db, STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      return null;
    }

    return {
      userId,
      ...statsDoc.data(),
      updatedAt: statsDoc.data().updatedAt?.toDate(),
    } as UserStats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
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
