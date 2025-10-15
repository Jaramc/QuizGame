/**
 * Servicio para gestionar preguntas
 * MODO LOCAL: Usa AsyncStorage en lugar de Firestore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/config/firebase';
import { getLocalQuestions } from '@/data/localQuestions';
import type {
    CreateQuestionDTO,
    Question,
    QuestionCategory,
    QuestionDifficulty
} from '@/types/game';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

const QUESTIONS_COLLECTION = 'questions';
const LOCAL_QUESTIONS_KEY = '@quizgame_user_questions';

/**
 * Crear una nueva pregunta (LOCAL)
 * Guarda en AsyncStorage en lugar de Firestore
 */
export const createQuestion = async (
  questionData: CreateQuestionDTO,
  userId: string
): Promise<string> => {
  try {
    // Generar ID único
    const questionId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newQuestion: Question = {
      id: questionId,
      ...questionData,
      createdBy: userId,
      createdAt: new Date(),
      language: 'es',
      points: calculatePoints(questionData.difficulty),
      isPublic: questionData.isPublic ?? false,
    };

    // Obtener preguntas existentes
    const existingQuestions = await getUserQuestionsLocal(userId);
    
    // Agregar nueva pregunta
    existingQuestions.push(newQuestion);
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem(
      `${LOCAL_QUESTIONS_KEY}_${userId}`,
      JSON.stringify(existingQuestions)
    );
    
    console.log('✅ Pregunta guardada localmente:', questionId);
    return questionId;
  } catch (error) {
    console.error('Error creating question locally:', error);
    throw new Error('No se pudo crear la pregunta');
  }
};

/**
 * Obtener preguntas del usuario desde AsyncStorage
 */
const getUserQuestionsLocal = async (userId: string): Promise<Question[]> => {
  try {
    const stored = await AsyncStorage.getItem(`${LOCAL_QUESTIONS_KEY}_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convertir fechas de string a Date
      return parsed.map((q: any) => ({
        ...q,
        createdAt: new Date(q.createdAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting local questions:', error);
    return [];
  }
};

/**
 * Calcular puntos según dificultad
 */
const calculatePoints = (difficulty: QuestionDifficulty): number => {
  const pointsMap = {
    easy: 10,
    medium: 20,
    hard: 30,
  };
  return pointsMap[difficulty];
};

/**
 * Obtener una pregunta por ID
 */
export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      } as Question;
    }
    return null;
  } catch (error) {
    console.error('Error getting question:', error);
    throw new Error('No se pudo obtener la pregunta');
  }
};

/**
 * Obtener preguntas filtradas
 */
export const getQuestions = async (
  filters?: {
    category?: QuestionCategory;
    difficulty?: QuestionDifficulty;
    createdBy?: string;
    isPublic?: boolean;
    limitCount?: number;
  }
): Promise<Question[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters?.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }
    if (filters?.createdBy) {
      constraints.push(where('createdBy', '==', filters.createdBy));
    }
    if (filters?.isPublic !== undefined) {
      constraints.push(where('isPublic', '==', filters.isPublic));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(collection(db, QUESTIONS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Question[];
  } catch (error) {
    console.error('Error getting questions:', error);
    throw new Error('No se pudieron obtener las preguntas');
  }
};

/**
 * Obtener preguntas para un juego
 * MODO LOCAL: Usa solo preguntas locales (sin Firestore)
 */
export const getQuestionsForGame = async (
  category: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10,
  userId?: string
): Promise<Question[]> => {
  // 🎯 USAR SOLO PREGUNTAS LOCALES
  console.log('📚 Cargando preguntas locales...');
  const localQuestions = getLocalQuestions(category, difficulty, count);
  return localQuestions;

  // TODO: Implementar integración con Firestore en el futuro
  // try {
  //   const publicQuestions = await getQuestions({
  //     category,
  //     difficulty,
  //     isPublic: true,
  //     limitCount: count * 2,
  //   });
  //   ...
  // } catch (error) {
  //   return getLocalQuestions(category, difficulty, count);
  // }
};

/**
 * Mezclar array (Fisher-Yates shuffle)
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Obtener preguntas creadas por el usuario (LOCAL)
 */
export const getUserQuestions = async (userId: string): Promise<Question[]> => {
  try {
    // Obtener preguntas locales del usuario
    const localQuestions = await getUserQuestionsLocal(userId);
    return localQuestions;
  } catch (error) {
    console.error('Error getting user questions:', error);
    return [];
  }
};

/**
 * Actualizar una pregunta (LOCAL)
 */
export const updateQuestion = async (
  questionId: string,
  updates: Partial<CreateQuestionDTO>,
  userId: string
): Promise<void> => {
  try {
    const questions = await getUserQuestionsLocal(userId);
    const index = questions.findIndex(q => q.id === questionId);
    
    if (index === -1) {
      throw new Error('Pregunta no encontrada');
    }
    
    // Actualizar pregunta
    questions[index] = {
      ...questions[index],
      ...updates,
      points: updates.difficulty ? calculatePoints(updates.difficulty) : questions[index].points,
    };
    
    // Guardar cambios
    await AsyncStorage.setItem(
      `${LOCAL_QUESTIONS_KEY}_${userId}`,
      JSON.stringify(questions)
    );
    
    console.log('✅ Pregunta actualizada localmente');
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('No se pudo actualizar la pregunta');
  }
};

/**
 * Eliminar una pregunta (LOCAL)
 */
export const deleteQuestion = async (questionId: string, userId: string): Promise<void> => {
  try {
    const questions = await getUserQuestionsLocal(userId);
    const filtered = questions.filter(q => q.id !== questionId);
    
    // Guardar cambios
    await AsyncStorage.setItem(
      `${LOCAL_QUESTIONS_KEY}_${userId}`,
      JSON.stringify(filtered)
    );
    
    console.log('✅ Pregunta eliminada localmente');
  } catch (error) {
    console.error('Error deleting question:', error);
    throw new Error('No se pudo eliminar la pregunta');
  }
};

/**
 * Contar preguntas por categoría
 */
export const countQuestionsByCategory = async (
  category: QuestionCategory
): Promise<number> => {
  try {
    const questions = await getQuestions({ category, isPublic: true });
    return questions.length;
  } catch (error) {
    console.error('Error counting questions:', error);
    return 0;
  }
};

/**
 * Verificar si el usuario puede editar/eliminar una pregunta
 */
export const canUserModifyQuestion = async (
  questionId: string,
  userId: string
): Promise<boolean> => {
  try {
    const question = await getQuestionById(questionId);
    return question?.createdBy === userId;
  } catch (error) {
    return false;
  }
};
