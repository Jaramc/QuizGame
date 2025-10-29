/**
 * Servicio de Ranking
 * Gestiona el ranking global de jugadores
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const RANKING_KEY = '@quizgame_ranking';

export interface RankingPlayer {
  userId: string;
  username: string;
  totalPoints: number;
  totalWins: number;
  accuracy: number;
  level: number;
  maxStreak: number;
  updatedAt: Date;
}

/**
 * Actualizar entrada del jugador en el ranking
 */
export const updatePlayerRanking = async (
  userId: string,
  username: string,
  totalPoints: number,
  totalWins: number,
  accuracy: number,
  level: number,
  maxStreak: number
): Promise<void> => {
  try {
    const ranking = await getRanking();
    
    // Buscar si el jugador ya existe
    const existingIndex = ranking.findIndex(p => p.userId === userId);
    
    const playerData: RankingPlayer = {
      userId,
      username,
      totalPoints,
      totalWins,
      accuracy,
      level,
      maxStreak,
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      // Actualizar datos existentes
      ranking[existingIndex] = playerData;
    } else {
      // Agregar nuevo jugador
      ranking.push(playerData);
    }

    // Ordenar por puntos (descendente)
    ranking.sort((a, b) => b.totalPoints - a.totalPoints);

    // Guardar ranking actualizado
    await AsyncStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    
    console.log(`✅ Ranking actualizado para ${username} con ${totalPoints} puntos`);
  } catch (error) {
    console.error('Error updating player ranking:', error);
  }
};

/**
 * Obtener ranking completo
 */
export const getRanking = async (): Promise<RankingPlayer[]> => {
  try {
    const stored = await AsyncStorage.getItem(RANKING_KEY);
    
    if (stored) {
      const ranking = JSON.parse(stored);
      return ranking.map((player: any) => ({
        ...player,
        updatedAt: new Date(player.updatedAt),
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting ranking:', error);
    return [];
  }
};

/**
 * Obtener top N jugadores
 */
export const getTopPlayers = async (limit: number = 10): Promise<RankingPlayer[]> => {
  try {
    const ranking = await getRanking();
    return ranking.slice(0, limit);
  } catch (error) {
    console.error('Error getting top players:', error);
    return [];
  }
};

/**
 * Obtener posición de un jugador
 */
export const getPlayerPosition = async (userId: string): Promise<number | null> => {
  try {
    const ranking = await getRanking();
    const position = ranking.findIndex(p => p.userId === userId);
    
    return position >= 0 ? position + 1 : null; // +1 porque los índices empiezan en 0
  } catch (error) {
    console.error('Error getting player position:', error);
    return null;
  }
};

/**
 * Obtener datos del jugador en el ranking
 */
export const getPlayerRankingData = async (userId: string): Promise<RankingPlayer | null> => {
  try {
    const ranking = await getRanking();
    const player = ranking.find(p => p.userId === userId);
    
    return player || null;
  } catch (error) {
    console.error('Error getting player ranking data:', error);
    return null;
  }
};

/**
 * Limpiar ranking (solo para desarrollo)
 */
export const clearRanking = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RANKING_KEY);
    console.log('✅ Ranking limpiado');
  } catch (error) {
    console.error('Error clearing ranking:', error);
  }
};
