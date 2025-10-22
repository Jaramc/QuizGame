/**
 * Script de migración de preguntas locales a Firestore
 * 
 * Este script toma las 30 preguntas base de data/localQuestions.ts
 * y las sube a Firestore marcándolas como preguntas del sistema (públicas).
 * 
 * Uso:
 *   npx ts-node scripts/migrateQuestionsToFirestore.ts
 */

import { initializeApp } from 'firebase/app';
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    query,
    Timestamp,
    where
} from 'firebase/firestore';

// Configuración de Firebase (misma que en config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyB2od6Zg6m4KigUnVRhulbxE0eQK7Ab4LY",
  authDomain: "quizgame-eda3c.firebaseapp.com",
  projectId: "quizgame-eda3c",
  storageBucket: "quizgame-eda3c.firebasestorage.app",
  messagingSenderId: "1083637056661",
  appId: "1:1083637056661:web:f0320862abaccb0812c79c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Preguntas base organizadas por categoría
const questionsByCategory = {
  art: [
    {
      question: "¿Quién pintó la Mona Lisa?",
      options: ["Leonardo da Vinci", "Miguel Ángel", "Rafael", "Donatello"],
      correctAnswer: "Leonardo da Vinci",
      difficulty: "easy" as const,
      category: "art" as const,
    },
    {
      question: "¿De qué color es el cielo en 'La noche estrellada' de Van Gogh?",
      options: ["Azul oscuro con espirales", "Rojo", "Verde", "Amarillo"],
      correctAnswer: "Azul oscuro con espirales",
      difficulty: "medium" as const,
      category: "art" as const,
    },
    {
      question: "¿En qué museo se encuentra 'El David' de Miguel Ángel?",
      options: ["Galería de la Academia (Florencia)", "Museo del Louvre", "Museo del Prado", "Galería Uffizi"],
      correctAnswer: "Galería de la Academia (Florencia)",
      difficulty: "hard" as const,
      category: "art" as const,
    },
  ],
  science: [
    {
      question: "¿Cuál es la fórmula química del agua?",
      options: ["H2O", "CO2", "O2", "H2SO4"],
      correctAnswer: "H2O",
      difficulty: "easy" as const,
      category: "science" as const,
    },
    {
      question: "¿Cuántos planetas hay en el sistema solar?",
      options: ["8", "7", "9", "10"],
      correctAnswer: "8",
      difficulty: "easy" as const,
      category: "science" as const,
    },
    {
      question: "¿Qué científico propuso la teoría de la relatividad?",
      options: ["Albert Einstein", "Isaac Newton", "Stephen Hawking", "Galileo Galilei"],
      correctAnswer: "Albert Einstein",
      difficulty: "medium" as const,
      category: "science" as const,
    },
    {
      question: "¿Cuál es la velocidad de la luz en el vacío?",
      options: ["299,792,458 m/s", "150,000,000 m/s", "300,000 km/h", "200,000,000 m/s"],
      correctAnswer: "299,792,458 m/s",
      difficulty: "hard" as const,
      category: "science" as const,
    },
  ],
  sports: [
    {
      question: "¿Cada cuántos años se celebran los Juegos Olímpicos?",
      options: ["4 años", "2 años", "5 años", "3 años"],
      correctAnswer: "4 años",
      difficulty: "easy" as const,
      category: "sports" as const,
    },
    {
      question: "¿En qué deporte se utiliza un balón ovalado?",
      options: ["Rugby", "Fútbol", "Baloncesto", "Voleibol"],
      correctAnswer: "Rugby",
      difficulty: "easy" as const,
      category: "sports" as const,
    },
    {
      question: "¿Quién es considerado el mejor jugador de fútbol de todos los tiempos?",
      options: ["Pelé/Maradona/Messi (debate)", "Cristiano Ronaldo", "Zinedine Zidane", "Johan Cruyff"],
      correctAnswer: "Pelé/Maradona/Messi (debate)",
      difficulty: "medium" as const,
      category: "sports" as const,
    },
    {
      question: "¿En qué año se celebró el primer Mundial de Fútbol?",
      options: ["1930", "1920", "1940", "1950"],
      correctAnswer: "1930",
      difficulty: "hard" as const,
      category: "sports" as const,
    },
  ],
  geography: [
    {
      question: "¿Cuál es la capital de Francia?",
      options: ["París", "Londres", "Berlín", "Madrid"],
      correctAnswer: "París",
      difficulty: "easy" as const,
      category: "geography" as const,
    },
    {
      question: "¿Cuál es el río más largo del mundo?",
      options: ["Amazonas", "Nilo", "Yangtsé", "Misisipi"],
      correctAnswer: "Amazonas",
      difficulty: "medium" as const,
      category: "geography" as const,
    },
    {
      question: "¿Cuántos continentes hay en la Tierra?",
      options: ["7", "5", "6", "8"],
      correctAnswer: "7",
      difficulty: "easy" as const,
      category: "geography" as const,
    },
    {
      question: "¿Cuál es el país más grande del mundo por superficie?",
      options: ["Rusia", "Canadá", "China", "Estados Unidos"],
      correctAnswer: "Rusia",
      difficulty: "medium" as const,
      category: "geography" as const,
    },
  ],
  history: [
    {
      question: "¿En qué año terminó la Segunda Guerra Mundial?",
      options: ["1945", "1944", "1946", "1943"],
      correctAnswer: "1945",
      difficulty: "easy" as const,
      category: "history" as const,
    },
    {
      question: "¿Quién descubrió América?",
      options: ["Cristóbal Colón", "Américo Vespucio", "Fernando de Magallanes", "Vasco da Gama"],
      correctAnswer: "Cristóbal Colón",
      difficulty: "easy" as const,
      category: "history" as const,
    },
    {
      question: "¿En qué año cayó el Muro de Berlín?",
      options: ["1989", "1990", "1988", "1991"],
      correctAnswer: "1989",
      difficulty: "medium" as const,
      category: "history" as const,
    },
    {
      question: "¿Quién fue el primer emperador de Roma?",
      options: ["Augusto", "Julio César", "Nerón", "Trajano"],
      correctAnswer: "Augusto",
      difficulty: "hard" as const,
      category: "history" as const,
    },
  ],
  entertainment: [
    {
      question: "¿Quién interpretó a Iron Man en las películas de Marvel?",
      options: ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo"],
      correctAnswer: "Robert Downey Jr.",
      difficulty: "easy" as const,
      category: "entertainment" as const,
    },
    {
      question: "¿Cuál es la película más taquillera de todos los tiempos?",
      options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars"],
      correctAnswer: "Avatar",
      difficulty: "medium" as const,
      category: "entertainment" as const,
    },
    {
      question: "¿Quién escribió la saga de 'Harry Potter'?",
      options: ["J.K. Rowling", "J.R.R. Tolkien", "George R.R. Martin", "Stephen King"],
      correctAnswer: "J.K. Rowling",
      difficulty: "easy" as const,
      category: "entertainment" as const,
    },
    {
      question: "¿En qué año se estrenó la primera película de 'Star Wars'?",
      options: ["1977", "1980", "1975", "1983"],
      correctAnswer: "1977",
      difficulty: "hard" as const,
      category: "entertainment" as const,
    },
  ],
};

// Función para calcular puntos según dificultad
const calculatePoints = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const pointsMap = {
    easy: 10,
    medium: 20,
    hard: 30,
  };
  return pointsMap[difficulty];
};

// Función para verificar si una pregunta ya existe
const questionExists = async (questionText: string): Promise<boolean> => {
  const q = query(
    collection(db, 'questions'),
    where('question', '==', questionText)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Función principal de migración
async function migrateQuestions() {
  console.log('🚀 Iniciando migración de preguntas a Firestore...\n');

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [categoryName, questions] of Object.entries(questionsByCategory)) {
    console.log(`\n📂 Procesando categoría: ${categoryName}`);
    console.log(`   Total de preguntas: ${questions.length}\n`);

    for (const questionData of questions) {
      try {
        // Verificar si la pregunta ya existe
        const exists = await questionExists(questionData.question);
        
        if (exists) {
          console.log(`   ⏭️  Omitida (ya existe): "${questionData.question.substring(0, 50)}..."`);
          totalSkipped++;
          continue;
        }

        // Crear documento de pregunta
        const newQuestion = {
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          difficulty: questionData.difficulty,
          category: questionData.category,
          createdBy: 'system', // Marcar como pregunta del sistema
          createdAt: Timestamp.now(),
          language: 'es',
          points: calculatePoints(questionData.difficulty),
          isPublic: true, // Las preguntas del sistema son públicas
        };

        // Agregar a Firestore
        const docRef = await addDoc(collection(db, 'questions'), newQuestion);
        console.log(`   ✅ Agregada: "${questionData.question.substring(0, 50)}..." (${docRef.id})`);
        totalAdded++;

        // Pequeña pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`   ❌ Error: "${questionData.question.substring(0, 50)}..."`);
        console.error(`      Mensaje: ${error.message}`);
        totalErrors++;
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 Resumen de la migración:');
  console.log('='.repeat(60));
  console.log(`  ✅ Preguntas agregadas: ${totalAdded}`);
  console.log(`  ⏭️  Preguntas omitidas (ya existían): ${totalSkipped}`);
  console.log(`  ❌ Errores: ${totalErrors}`);
  console.log(`  📝 Total procesadas: ${totalAdded + totalSkipped + totalErrors}`);
  console.log('='.repeat(60));

  if (totalErrors > 0) {
    console.log('\n⚠️  Hubo algunos errores durante la migración.');
    console.log('   Revisa los mensajes anteriores para más detalles.');
  } else if (totalAdded > 0) {
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('   Ahora puedes usar estas preguntas en tu app.');
  } else if (totalSkipped > 0 && totalAdded === 0) {
    console.log('\n✨ Todas las preguntas ya estaban en Firestore.');
    console.log('   No se agregaron preguntas nuevas.');
  }

  // Salir del proceso
  process.exit(totalErrors > 0 ? 1 : 0);
}

// Ejecutar migración
migrateQuestions().catch((error) => {
  console.error('\n💥 Error fatal durante la migración:');
  console.error(error);
  process.exit(1);
});
