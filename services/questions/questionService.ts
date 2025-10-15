/**
 * Servicio para gestionar preguntas en Firestore
 */

import { db } from '@/config/firebase';
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

/**
 * Crear una nueva pregunta
 */
export const createQuestion = async (
  questionData: CreateQuestionDTO,
  userId: string
): Promise<string> => {
  try {
    const newQuestion = {
      ...questionData,
      createdBy: userId,
      createdAt: Timestamp.now(),
      language: 'es',
      points: calculatePoints(questionData.difficulty),
      isPublic: questionData.isPublic ?? false,
    };

    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), newQuestion);
    return docRef.id;
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('No se pudo crear la pregunta');
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
 * Mezcla preguntas públicas y del usuario
 */
export const getQuestionsForGame = async (
  category: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10,
  userId?: string
): Promise<Question[]> => {
  try {
    // Obtener preguntas públicas
    const publicQuestions = await getQuestions({
      category,
      difficulty,
      isPublic: true,
      limitCount: count * 2, // Obtenemos más para poder mezclar
    });

    // Si hay userId, obtener también sus preguntas privadas
    let userQuestions: Question[] = [];
    if (userId) {
      userQuestions = await getQuestions({
        category,
        difficulty,
        createdBy: userId,
        isPublic: false,
        limitCount: count,
      });
    }

    // Combinar y mezclar
    const allQuestions = [...publicQuestions, ...userQuestions];
    const shuffled = shuffleArray(allQuestions);

    // Retornar solo la cantidad solicitada
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting game questions:', error);
    throw new Error('No se pudieron cargar las preguntas del juego');
  }
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
 * Obtener preguntas creadas por el usuario
 */
export const getUserQuestions = async (userId: string): Promise<Question[]> => {
  try {
    return await getQuestions({ createdBy: userId });
  } catch (error) {
    console.error('Error getting user questions:', error);
    throw new Error('No se pudieron obtener tus preguntas');
  }
};

/**
 * Actualizar una pregunta
 */
export const updateQuestion = async (
  questionId: string,
  updates: Partial<CreateQuestionDTO>
): Promise<void> => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, {
      ...updates,
      points: updates.difficulty ? calculatePoints(updates.difficulty) : undefined,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('No se pudo actualizar la pregunta');
  }
};

/**
 * Eliminar una pregunta
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);
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
