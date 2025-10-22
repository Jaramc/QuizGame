/**
 * Servicio para gestionar preguntas
 * FIRESTORE-FIRST: Firestore como base de datos principal
 * AsyncStorage SOLO para caché offline
 */

import { db } from '@/config/firebase';
import { getLocalQuestions } from '@/data/localQuestions';
import type {
  CreateQuestionDTO,
  Question,
  QuestionCategory,
  QuestionDifficulty
} from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const OFFLINE_CACHE_KEY = '@quizgame_offline_cache';
const USER_OFFLINE_KEY = '@quizgame_user_offline_questions';

const saveQuestionOffline = async (
  questionData: CreateQuestionDTO,
  userId: string
): Promise<string> => {
  const questionId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const question: Question = {
    id: questionId,
    ...questionData,
    createdBy: userId,
    createdAt: new Date(),
    language: 'es',
    points: calculatePoints(questionData.difficulty),
    isPublic: questionData.isPublic ?? false,
  };

  const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
  const offlineQuestions = stored ? JSON.parse(stored) : [];
  offlineQuestions.push(question);
  
  await AsyncStorage.setItem(USER_OFFLINE_KEY, JSON.stringify(offlineQuestions));
  console.log('Pregunta guardada offline:', questionId);
  
  return questionId;
};

const calculatePoints = (difficulty: QuestionDifficulty): number => {
  const pointsMap = {
    easy: 10,
    medium: 20,
    hard: 30,
  };
  return pointsMap[difficulty];
};

const saveToOfflineCache = async (questions: Question[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      OFFLINE_CACHE_KEY,
      JSON.stringify({
        questions,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Error guardando caché offline:', error);
  }
};

const getFromOfflineCache = async (): Promise<Question[] | null> => {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    if (!stored) return null;
    
    const { questions } = JSON.parse(stored);
    const parsed = questions.map((q: any) => ({
      ...q,
      createdAt: new Date(q.createdAt),
    }));
    
    return parsed;
  } catch (error) {
    console.error('Error leyendo caché offline:', error);
    return null;
  }
};

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
    console.log('Pregunta guardada en Firestore:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error guardando en Firestore:', error.message);
    console.warn('Guardando offline...');
    return await saveQuestionOffline(questionData, userId);
  }
};

export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  try {
    if (questionId.startsWith('offline-')) {
      const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
      if (stored) {
        const offlineQuestions: Question[] = JSON.parse(stored);
        return offlineQuestions.find(q => q.id === questionId) || null;
      }
      return null;
    }

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
    return null;
  }
};

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

    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Question[];

    if (questions.length > 0) {
      await saveToOfflineCache(questions);
    }

    return questions;
  } catch (error: any) {
    console.error('Error getting questions from Firestore:', error.message);
    
    if (error?.message?.includes('index')) {
      console.warn('Falta crear índice en Firestore');
      console.warn('Abre el enlace del error en Firebase Console');
      throw error;
    }
    
    const cached = await getFromOfflineCache();
    if (cached) {
      console.log('Usando caché offline');
      return cached;
    }
    
    throw error;
  }
};

export const getQuestionsForGame = async (
  category: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10,
  userId?: string
): Promise<Question[]> => {
  try {
    console.log('Cargando preguntas desde Firestore...');
    
    const publicQuestions = await getQuestions({
      category,
      difficulty,
      isPublic: true,
      limitCount: count * 2,
    });

    if (userId) {
      try {
        const userQuestions = await getQuestions({
          category,
          difficulty,
          createdBy: userId,
          limitCount: count,
        });
        publicQuestions.push(...userQuestions);
      } catch (error) {
        console.warn('No se pudieron cargar preguntas del usuario');
      }
    }

    const shuffled = shuffleArray(publicQuestions);
    const selected = shuffled.slice(0, count);

    if (selected.length >= count) {
      console.log(`${selected.length} preguntas cargadas desde Firestore`);
      return selected;
    }
    
    if (selected.length > 0) {
      console.log(`Solo ${selected.length} en Firestore, completando con locales`);
      const localNeeded = count - selected.length;
      const localQuestions = getLocalQuestions(category, difficulty, localNeeded);
      return [...selected, ...localQuestions];
    }

    throw new Error('No questions in Firestore');
  } catch (error: any) {
    console.warn('No se pudo conectar a Firestore');
    
    const cached = await getFromOfflineCache();
    if (cached && cached.length > 0) {
      const filtered = cached.filter(q => 
        q.category === category && 
        (!difficulty || q.difficulty === difficulty)
      );
      if (filtered.length >= count) {
        const shuffled = shuffleArray(filtered);
        console.log(`${count} preguntas desde caché offline`);
        return shuffled.slice(0, count);
      }
    }
    
    console.log('Usando preguntas locales predefinidas');
    return getLocalQuestions(category, difficulty, count);
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getUserQuestions = async (userId: string): Promise<Question[]> => {
  try {
    console.log('Cargando preguntas del usuario desde Firestore...');
    const questions = await getQuestions({
      createdBy: userId,
    });
    
    console.log(`${questions.length} preguntas del usuario cargadas`);
    return questions;
  } catch (error) {
    console.error('Error getting user questions:', error);
    
    const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
    if (stored) {
      const offlineQuestions = JSON.parse(stored);
      console.log(`${offlineQuestions.length} preguntas offline del usuario`);
      return offlineQuestions;
    }
    
    return [];
  }
};

export const updateQuestion = async (
  questionId: string,
  updates: Partial<CreateQuestionDTO>,
  userId: string
): Promise<void> => {
  try {
    if (questionId.startsWith('offline-')) {
      const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
      if (stored) {
        const offlineQuestions: Question[] = JSON.parse(stored);
        const index = offlineQuestions.findIndex(q => q.id === questionId);
        if (index !== -1) {
          offlineQuestions[index] = {
            ...offlineQuestions[index],
            ...updates,
            points: updates.difficulty ? calculatePoints(updates.difficulty) : offlineQuestions[index].points,
          };
          await AsyncStorage.setItem(USER_OFFLINE_KEY, JSON.stringify(offlineQuestions));
          console.log('Pregunta offline actualizada');
          return;
        }
      }
      throw new Error('Pregunta offline no encontrada');
    }

    const updateData = {
      ...updates,
      points: updates.difficulty ? calculatePoints(updates.difficulty) : undefined,
    };

    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );

    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, updateData);
    console.log('Pregunta actualizada en Firestore');
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('No se pudo actualizar la pregunta');
  }
};

export const deleteQuestion = async (questionId: string, userId: string): Promise<void> => {
  try {
    if (questionId.startsWith('offline-')) {
      const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
      if (stored) {
        const offlineQuestions: Question[] = JSON.parse(stored);
        const filtered = offlineQuestions.filter(q => q.id !== questionId);
        await AsyncStorage.setItem(USER_OFFLINE_KEY, JSON.stringify(filtered));
        console.log('Pregunta offline eliminada');
        return;
      }
      throw new Error('Pregunta offline no encontrada');
    }

    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);
    console.log('Pregunta eliminada de Firestore');
  } catch (error) {
    console.error('Error deleting question:', error);
    throw new Error('No se pudo eliminar la pregunta');
  }
};

export const countQuestionsByCategory = async (
  category: QuestionCategory
): Promise<number> => {
  try {
    const questions = await getQuestions({ category, isPublic: true });
    return questions.length;
  } catch (error) {
    console.error('Error counting questions:', error);
    const localQuestions = getLocalQuestions(category, undefined, 100);
    return localQuestions.length;
  }
};

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

export const syncOfflineQuestions = async (userId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(USER_OFFLINE_KEY);
    if (!stored) {
      console.log('No hay preguntas offline para sincronizar');
      return;
    }

    const offlineQuestions: Question[] = JSON.parse(stored);
    console.log(`Sincronizando ${offlineQuestions.length} preguntas offline...`);

    let synced = 0;
    for (const question of offlineQuestions) {
      try {
        const { id, createdAt, ...questionData } = question;
        const newQuestion = {
          ...questionData,
          createdAt: Timestamp.now(),
        };

        await addDoc(collection(db, QUESTIONS_COLLECTION), newQuestion);
        synced++;
      } catch (error) {
        console.error(`Error sincronizando pregunta ${question.id}:`, error);
      }
    }

    if (synced === offlineQuestions.length) {
      await AsyncStorage.removeItem(USER_OFFLINE_KEY);
      console.log(`${synced} preguntas sincronizadas y limpiadas`);
    } else {
      console.log(`Solo ${synced}/${offlineQuestions.length} sincronizadas`);
    }
  } catch (error) {
    console.error('Error sincronizando preguntas offline:', error);
  }
};
