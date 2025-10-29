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
  
  const allOptions = [
    questionData.correctAnswer,
    ...questionData.incorrectAnswers
  ].sort(() => Math.random() - 0.5);

  const question: Question = {
    id: questionId,
    question: questionData.question,
    options: allOptions,
    correctAnswer: questionData.correctAnswer,
    incorrectAnswers: questionData.incorrectAnswers,
    category: questionData.category,
    difficulty: questionData.difficulty,
    type: questionData.type || 'multiple-choice',
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
  console.log('💾 Pregunta guardada offline:', questionId);
  
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
    // Crear array de opciones mezclando respuesta correcta e incorrectas
    const allOptions = [
      questionData.correctAnswer,
      ...questionData.incorrectAnswers
    ].sort(() => Math.random() - 0.5); // Mezclar aleatoriamente

    const newQuestion = {
      question: questionData.question,
      options: allOptions, // Campo requerido por Firestore rules
      correctAnswer: questionData.correctAnswer,
      category: questionData.category,
      difficulty: questionData.difficulty,
      isPublic: questionData.isPublic ?? false,
      createdBy: userId,
      createdAt: Timestamp.now(),
      language: 'es',
      points: calculatePoints(questionData.difficulty),
      // Guardar también incorrectAnswers para compatibilidad
      incorrectAnswers: questionData.incorrectAnswers,
      type: questionData.type || 'multiple-choice',
    };

    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), newQuestion);
    console.log('✅ Pregunta guardada en Firestore:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error guardando en Firestore:', error.message);
    console.warn('💾 Guardando offline...');
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
      const data: any = docSnap.data();
      const incorrectAnswers = data.incorrectAnswers ?? (
        Array.isArray(data.options) ? data.options.filter((o: string) => o !== data.correctAnswer) : []
      );

      return {
        id: docSnap.id,
        ...data,
        incorrectAnswers,
        createdAt: data.createdAt?.toDate(),
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
    console.log('🔎 Consultando Firestore con filtros:', JSON.stringify(filters));
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
    
    // NO usar orderBy para evitar índices compuestos complejos
    // Las preguntas se mezclarán aleatoriamente de todos modos
    
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount * 3)); // Pedir más para compensar falta de orden
    }

    const q = query(collection(db, QUESTIONS_COLLECTION), ...constraints);
    console.log('⏳ Ejecutando query en Firestore...');
    const querySnapshot = await getDocs(q);
    console.log(`📊 Query exitosa: ${querySnapshot.size} documentos encontrados`);

    const questions = querySnapshot.docs.map(doc => {
      const data: any = doc.data();
      const incorrectAnswers = data.incorrectAnswers ?? (
        Array.isArray(data.options) ? data.options.filter((o: string) => o !== data.correctAnswer) : []
      );

      return {
        id: doc.id,
        ...data,
        incorrectAnswers,
        createdAt: data.createdAt?.toDate(),
      } as Question;
    });

    // Ordenar en el cliente por createdAt descendente
    questions.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });

    // Aplicar limit si es necesario
    const limitedQuestions = filters?.limitCount 
      ? questions.slice(0, filters.limitCount)
      : questions;

    if (limitedQuestions.length > 0) {
      await saveToOfflineCache(limitedQuestions);
      console.log(`💾 ${limitedQuestions.length} preguntas guardadas en caché`);
    }

    return limitedQuestions;
  } catch (error: any) {
    console.error('❌ ERROR en getQuestions:', error.message);
    console.error('📋 Código de error:', error.code);
    
    if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
      console.error('⚠️ Query requiere índice. Intentando sin orderBy...');
      // Ya no usamos orderBy, así que este error no debería ocurrir
    }
    
    console.log('📦 Intentando usar caché offline...');
    const cached = await getFromOfflineCache();
    if (cached) {
      console.log(`✅ ${cached.length} preguntas recuperadas del caché`);
      return cached;
    }
    
    console.error('❌ No hay caché disponible');
    throw error;
  }
};

/**
 * Función principal para obtener preguntas para jugar
 * DEPRECADO: Usar getQuestionsForPublicModes() o getUserQuestions() directamente
 * Esta función se mantiene por compatibilidad
 */
export const getQuestionsForGame = async (
  category: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10,
  userId?: string
): Promise<Question[]> => {
  // Usar la nueva función optimizada para modos públicos
  return getQuestionsForPublicModes(category, difficulty, count);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

/**
 * ========================================
 * FUNCIONES ESPECÍFICAS PARA MODOS DE JUEGO
 * ========================================
 */

/**
 * Modo 1 y 2: Clásico y Contrarreloj
 * Obtiene preguntas PÚBLICAS de Firestore con estrategia progresiva
 * Fallback a preguntas locales si no hay suficientes en Firestore
 */
export const getQuestionsForPublicModes = async (
  category?: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10
): Promise<Question[]> => {
  console.log('🎮 [MODO PÚBLICO] Cargando preguntas para Clásico/Contrarreloj');
  console.log(`   Categoría: ${category || 'todas'}, Dificultad: ${difficulty || 'todas'}, Cantidad: ${count}`);

  const accumulatedQuestions = new Map<string, Question>();

  const addUniqueQuestions = (questions: Question[]) => {
    questions.forEach(q => {
      if (!accumulatedQuestions.has(q.id)) {
        accumulatedQuestions.set(q.id, q);
      }
    });
  };

  try {
    // INTENTO 1: Filtros exactos (categoría + dificultad + públicas)
    if (category && difficulty) {
      console.log('📡 Intento 1: Categoría + Dificultad exactas');
      const exactQuestions = await getQuestions({
        category,
        difficulty,
        isPublic: true,
        limitCount: count
      });
      addUniqueQuestions(exactQuestions);
      console.log(`   ✅ ${exactQuestions.length} preguntas encontradas`);
    }

    // INTENTO 2: Solo categoría (si aún faltan preguntas)
    if (category && accumulatedQuestions.size < count) {
      console.log('📡 Intento 2: Solo categoría');
      const categoryQuestions = await getQuestions({
        category,
        isPublic: true,
        limitCount: count * 2
      });
      addUniqueQuestions(categoryQuestions);
      console.log(`   ✅ ${categoryQuestions.length} preguntas encontradas (total acumulado: ${accumulatedQuestions.size})`);
    }

    // INTENTO 3: Solo dificultad (si aún faltan preguntas)
    if (difficulty && accumulatedQuestions.size < count) {
      console.log('📡 Intento 3: Solo dificultad');
      const difficultyQuestions = await getQuestions({
        difficulty,
        isPublic: true,
        limitCount: count * 2
      });
      addUniqueQuestions(difficultyQuestions);
      console.log(`   ✅ ${difficultyQuestions.length} preguntas encontradas (total acumulado: ${accumulatedQuestions.size})`);
    }

    // INTENTO 4: Todas las preguntas públicas (último recurso en Firestore)
    if (accumulatedQuestions.size < count) {
      console.log('📡 Intento 4: Todas las preguntas públicas');
      const allPublicQuestions = await getQuestions({
        isPublic: true,
        limitCount: count * 3
      });
      addUniqueQuestions(allPublicQuestions);
      console.log(`   ✅ ${allPublicQuestions.length} preguntas encontradas (total acumulado: ${accumulatedQuestions.size})`);
    }

    // Convertir a array, mezclar y limitar
    let finalQuestions = Array.from(accumulatedQuestions.values());
    finalQuestions = shuffleArray(finalQuestions).slice(0, count);

    // FALLBACK: Completar con preguntas locales si es necesario
    if (finalQuestions.length < count) {
      console.log(`⚠️ Solo ${finalQuestions.length} preguntas en Firestore, completando con locales`);
      const localQuestions = getLocalQuestions();
      let localFiltered = localQuestions;

      if (category) {
        localFiltered = localFiltered.filter(q => q.category === category);
      }
      if (difficulty) {
        localFiltered = localFiltered.filter(q => q.difficulty === difficulty);
      }

      const needed = count - finalQuestions.length;
      const localToAdd = shuffleArray(localFiltered).slice(0, needed);
      finalQuestions = [...finalQuestions, ...localToAdd];
      console.log(`   ✅ ${localToAdd.length} preguntas locales agregadas`);
    }

    console.log(`✅ [MODO PÚBLICO] ${finalQuestions.length} preguntas listas`);
    return finalQuestions;

  } catch (error) {
    console.error('❌ Error cargando preguntas públicas:', error);
    
    // FALLBACK TOTAL: Solo preguntas locales
    console.log('🔄 Usando solo preguntas locales como fallback');
    let localQuestions = getLocalQuestions();
    
    if (category) {
      localQuestions = localQuestions.filter(q => q.category === category);
    }
    if (difficulty) {
      localQuestions = localQuestions.filter(q => q.difficulty === difficulty);
    }
    
    return shuffleArray(localQuestions).slice(0, count);
  }
};

/**
 * Modo 3: Mis Preguntas
 * Obtiene preguntas PRIVADAS del usuario autenticado
 * NO usa fallback local (requiere autenticación)
 */
export const getUserQuestions = async (
  userId: string,
  category?: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10
): Promise<Question[]> => {
  console.log('🔒 [MIS PREGUNTAS] Cargando preguntas del usuario');
  console.log(`   UserId: ${userId}, Categoría: ${category || 'todas'}, Dificultad: ${difficulty || 'todas'}`);

  try {
    const questions = await getQuestions({
      createdBy: userId,
      isPublic: false,
      category,
      difficulty,
      limitCount: count
    });

    console.log(`✅ [MIS PREGUNTAS] ${questions.length} preguntas encontradas`);
    return shuffleArray(questions).slice(0, count);

  } catch (error) {
    console.error('❌ Error cargando preguntas del usuario:', error);
    return [];
  }
};

/**
 * Obtiene el conteo de preguntas privadas del usuario
 * Útil para validar si puede jugar el Modo 3 (requiere mínimo 10)
 */
export const getUserQuestionsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('createdBy', '==', userId),
      where('isPublic', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;

  } catch (error) {
    console.error('❌ Error contando preguntas del usuario:', error);
    return 0;
  }
};

/**
 * Verifica si el usuario tiene suficientes preguntas para jugar Modo 3
 */
export const canPlayMyQuestionsMode = async (
  userId: string,
  minRequired: number = 10
): Promise<{ canPlay: boolean; count: number; message: string }> => {
  const count = await getUserQuestionsCount(userId);
  
  return {
    canPlay: count >= minRequired,
    count,
    message: count >= minRequired
      ? `Tienes ${count} preguntas disponibles`
      : `Necesitas crear al menos ${minRequired - count} preguntas más (tienes ${count}/${minRequired})`
  };
};
