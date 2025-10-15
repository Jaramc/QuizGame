/**
 * Tipos para el sistema de preguntas y juego
 */

/**
 * Dificultad de la pregunta
 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Categorías disponibles
 */
export type QuestionCategory = 
  | 'art' 
  | 'science' 
  | 'sports' 
  | 'entertainment' 
  | 'geography' 
  | 'history';

/**
 * Tipo de pregunta
 */
export type QuestionType = 'multiple-choice' | 'true-false';

/**
 * Interfaz de una pregunta
 */
export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  timeLimit?: number; // en segundos
  points: number;
  createdBy?: string; // userId del creador (para preguntas personalizadas)
  createdAt: Date;
  isPublic: boolean; // Si la pregunta está disponible para todos
  language: string; // 'es', 'en', etc.
}

/**
 * Datos para crear una pregunta nueva
 */
export interface CreateQuestionDTO {
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  timeLimit?: number;
  isPublic?: boolean;
}

/**
 * Modo de juego
 */
export type GameMode = 'classic' | 'timed' | 'multiplayer';

/**
 * Estado del juego
 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

/**
 * Respuesta del usuario a una pregunta
 */
export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // en milisegundos
  pointsEarned: number;
}

/**
 * Sesión de juego activa
 */
export interface GameSession {
  id: string;
  userId: string;
  mode: GameMode;
  category?: QuestionCategory; // opcional si es modo mixto
  difficulty?: QuestionDifficulty;
  questions: Question[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  score: number;
  lives: number;
  streak: number; // racha actual de respuestas correctas
  maxStreak: number; // racha máxima en esta sesión
  startTime: Date;
  endTime?: Date;
  status: GameStatus;
}

/**
 * Resultado de una partida completada
 */
export interface GameResult {
  id: string;
  userId: string;
  mode: GameMode;
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  accuracy: number; // porcentaje
  maxStreak: number;
  totalTime: number; // en milisegundos
  averageTimePerQuestion: number;
  createdAt: Date;
}

/**
 * Estadísticas del usuario
 */
export interface UserStats {
  userId: string;
  totalGames: number;
  totalWins: number;
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
  accuracy: number; // porcentaje global
  level: number;
  experiencePoints: number;
  gamesPerCategory: {
    [key in QuestionCategory]?: number;
  };
  winRatePerCategory: {
    [key in QuestionCategory]?: number;
  };
  questionsCreated: number; // preguntas personalizadas creadas
  updatedAt: Date;
}

/**
 * Configuración del juego
 */
export interface GameConfig {
  questionsPerGame: number;
  pointsPerCorrectAnswer: number;
  pointsPerIncorrectAnswer: number;
  timeLimitPerQuestion: number; // en segundos
  lives: number;
  allowSkip: boolean;
  showCorrectAnswer: boolean;
}

/**
 * Categoría con metadata
 */
export interface CategoryInfo {
  id: QuestionCategory;
  name: string;
  icon: string; // nombre del ícono de Ionicons
  color: string;
  description: string;
  totalQuestions: number;
}
