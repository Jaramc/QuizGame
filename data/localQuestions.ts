/**
 * Preguntas locales - Datos de ejemplo para el juego
 * Se usan cuando no hay preguntas en Firestore
 */

import type { Question, QuestionCategory, QuestionDifficulty } from '@/types/game';

export const localQuestions: Omit<Question, 'id' | 'createdBy' | 'createdAt'>[] = [
  // ARTE - FÁCIL
  {
    category: 'art',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Quién pintó la Mona Lisa?',
    correctAnswer: 'Leonardo da Vinci',
    incorrectAnswers: ['Pablo Picasso', 'Vincent van Gogh', 'Miguel Ángel'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'art',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿De qué color es el cielo en "La noche estrellada" de Van Gogh?',
    correctAnswer: 'Azul',
    incorrectAnswers: ['Verde', 'Rojo', 'Amarillo'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // ARTE - MEDIO
  {
    category: 'art',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿En qué museo se encuentra la obra "La última cena"?',
    correctAnswer: 'Santa Maria delle Grazie en Milán',
    incorrectAnswers: ['Museo del Louvre', 'Museo del Prado', 'Galería Uffizi'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'art',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Qué movimiento artístico fundó Pablo Picasso?',
    correctAnswer: 'Cubismo',
    incorrectAnswers: ['Surrealismo', 'Impresionismo', 'Expresionismo'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // ARTE - DIFÍCIL
  {
    category: 'art',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿Quién pintó "El jardín de las delicias"?',
    correctAnswer: 'El Bosco',
    incorrectAnswers: ['Brueghel el Viejo', 'Jan van Eyck', 'Rembrandt'],
    points: 30,
    isPublic: true,
    language: 'es',
  },

  // CIENCIA - FÁCIL
  {
    category: 'science',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Cuál es el planeta más grande del sistema solar?',
    correctAnswer: 'Júpiter',
    incorrectAnswers: ['Saturno', 'Tierra', 'Marte'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'science',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
    correctAnswer: '206',
    incorrectAnswers: ['195', '215', '180'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // CIENCIA - MEDIO
  {
    category: 'science',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Qué científico propuso la teoría de la relatividad?',
    correctAnswer: 'Albert Einstein',
    incorrectAnswers: ['Isaac Newton', 'Stephen Hawking', 'Nikola Tesla'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'science',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Cuál es el elemento químico con símbolo Au?',
    correctAnswer: 'Oro',
    incorrectAnswers: ['Plata', 'Aluminio', 'Argón'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // CIENCIA - DIFÍCIL
  {
    category: 'science',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿Qué partícula subatómica fue descubierta en el CERN en 2012?',
    correctAnswer: 'Bosón de Higgs',
    incorrectAnswers: ['Quark top', 'Neutrino tau', 'Gravitón'],
    points: 30,
    isPublic: true,
    language: 'es',
  },

  // DEPORTES - FÁCIL
  {
    category: 'sports',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿En qué deporte se usa una raqueta y una pelota amarilla?',
    correctAnswer: 'Tenis',
    incorrectAnswers: ['Bádminton', 'Squash', 'Ping pong'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'sports',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Cuántos jugadores hay en un equipo de fútbol?',
    correctAnswer: '11',
    incorrectAnswers: ['10', '12', '9'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // DEPORTES - MEDIO
  {
    category: 'sports',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿En qué país se celebraron los primeros Juegos Olímpicos modernos?',
    correctAnswer: 'Grecia',
    incorrectAnswers: ['Francia', 'Estados Unidos', 'Inglaterra'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'sports',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Quién tiene el récord de más medallas olímpicas?',
    correctAnswer: 'Michael Phelps',
    incorrectAnswers: ['Usain Bolt', 'Simone Biles', 'Carl Lewis'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // DEPORTES - DIFÍCIL
  {
    category: 'sports',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿En qué año ganó Maradona el Mundial con Argentina?',
    correctAnswer: '1986',
    incorrectAnswers: ['1982', '1990', '1978'],
    points: 30,
    isPublic: true,
    language: 'es',
  },

  // ENTRETENIMIENTO - FÁCIL
  {
    category: 'entertainment',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Quién es el personaje principal de Harry Potter?',
    correctAnswer: 'Harry Potter',
    incorrectAnswers: ['Ron Weasley', 'Hermione Granger', 'Albus Dumbledore'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'entertainment',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Qué película de Disney tiene como protagonista a un león llamado Simba?',
    correctAnswer: 'El Rey León',
    incorrectAnswers: ['Tarzán', 'Bambi', 'Madagascar'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // ENTRETENIMIENTO - MEDIO
  {
    category: 'entertainment',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Quién dirigió la película "Titanic"?',
    correctAnswer: 'James Cameron',
    incorrectAnswers: ['Steven Spielberg', 'Martin Scorsese', 'Christopher Nolan'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'entertainment',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Cuántas películas hay en la saga principal de Star Wars?',
    correctAnswer: '9',
    incorrectAnswers: ['7', '8', '10'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // ENTRETENIMIENTO - DIFÍCIL
  {
    category: 'entertainment',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿Qué actor interpretó a Joker en "The Dark Knight"?',
    correctAnswer: 'Heath Ledger',
    incorrectAnswers: ['Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto'],
    points: 30,
    isPublic: true,
    language: 'es',
  },

  // GEOGRAFÍA - FÁCIL
  {
    category: 'geography',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Cuál es la capital de Francia?',
    correctAnswer: 'París',
    incorrectAnswers: ['Londres', 'Madrid', 'Roma'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'geography',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿En qué continente está Brasil?',
    correctAnswer: 'América del Sur',
    incorrectAnswers: ['América del Norte', 'Europa', 'África'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // GEOGRAFÍA - MEDIO
  {
    category: 'geography',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Cuál es el río más largo del mundo?',
    correctAnswer: 'Amazonas',
    incorrectAnswers: ['Nilo', 'Yangtsé', 'Misisipi'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'geography',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Cuántos países conforman América Central?',
    correctAnswer: '7',
    incorrectAnswers: ['5', '8', '6'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // GEOGRAFÍA - DIFÍCIL
  {
    category: 'geography',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿Cuál es la capital de Kazajistán?',
    correctAnswer: 'Astaná',
    incorrectAnswers: ['Almatý', 'Taskent', 'Biskek'],
    points: 30,
    isPublic: true,
    language: 'es',
  },

  // HISTORIA - FÁCIL
  {
    category: 'history',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿En qué año llegó Cristóbal Colón a América?',
    correctAnswer: '1492',
    incorrectAnswers: ['1500', '1482', '1510'],
    points: 10,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'history',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: '¿Quién fue el primer presidente de Estados Unidos?',
    correctAnswer: 'George Washington',
    incorrectAnswers: ['Abraham Lincoln', 'Thomas Jefferson', 'Benjamin Franklin'],
    points: 10,
    isPublic: true,
    language: 'es',
  },

  // HISTORIA - MEDIO
  {
    category: 'history',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿En qué año cayó el Muro de Berlín?',
    correctAnswer: '1989',
    incorrectAnswers: ['1985', '1991', '1987'],
    points: 20,
    isPublic: true,
    language: 'es',
  },
  {
    category: 'history',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: '¿Quién fue el líder de la Revolución Cubana?',
    correctAnswer: 'Fidel Castro',
    incorrectAnswers: ['Che Guevara', 'Hugo Chávez', 'Salvador Allende'],
    points: 20,
    isPublic: true,
    language: 'es',
  },

  // HISTORIA - DIFÍCIL
  {
    category: 'history',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: '¿En qué año comenzó la Guerra de los 100 años?',
    correctAnswer: '1337',
    incorrectAnswers: ['1337', '1300', '1350'],
    points: 30,
    isPublic: true,
    language: 'es',
  },
];

/**
 * Obtener preguntas locales filtradas
 */
export const getLocalQuestions = (
  category?: QuestionCategory,
  difficulty?: QuestionDifficulty,
  count: number = 10
): Question[] => {
  let filtered = localQuestions;

  // Filtrar por categoría
  if (category) {
    filtered = filtered.filter(q => q.category === category);
  }

  // Filtrar por dificultad
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // Mezclar preguntas
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  // Tomar solo la cantidad necesaria
  const selected = shuffled.slice(0, count);

  // Agregar IDs temporales y datos faltantes
  return selected.map((q, index) => ({
    ...q,
    id: `local-${category}-${difficulty}-${index}`,
    createdBy: 'system',
    createdAt: new Date(),
  }));
};
