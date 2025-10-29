/**
 * Script para verificar el estado actual de Firestore
 * y mostrar estadísticas de las preguntas
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import * as readline from 'readline';

const firebaseConfig = {
  apiKey: "AIzaSyB2od6Zg6m4KigUnVRhulbxE0eQK7Ab4LY",
  authDomain: "quizgame-eda3c.firebaseapp.com",
  projectId: "quizgame-eda3c",
  storageBucket: "quizgame-eda3c.firebasestorage.app",
  messagingSenderId: "1083637056661",
  appId: "1:1083637056661:web:f0320862abaccb0812c79c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function verifyFirestore() {
  console.log('🔍 Verificando estado de Firestore\n');
  
  const email = await question('Email de Firebase Auth: ');
  const password = await question('Contraseña: ');
  
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    console.log('✅ Autenticado\n');
  } catch (error: any) {
    console.error('❌ Error de autenticación:', error.message);
    rl.close();
    process.exit(1);
  }

  console.log('📊 Consultando colección "questions"...\n');

  try {
    // Obtener TODAS las preguntas
    const snapshot = await getDocs(collection(db, 'questions'));
    
    if (snapshot.empty) {
      console.log('❌ La colección "questions" está VACÍA');
      console.log('   No hay preguntas en Firestore\n');
      console.log('💡 Necesitas ejecutar el script de migración:');
      console.log('   npx ts-node --project tsconfig.scripts.json scripts/migrateQuestionsWithAuth.ts\n');
      rl.close();
      process.exit(0);
    }

    console.log(`✅ Total de preguntas: ${snapshot.size}\n`);

    // Agrupar por categoría y dificultad
    const stats: Record<string, Record<string, number>> = {};
    const modeStats = {
      classic: 0,  // Preguntas públicas
      timed: 0,    // Preguntas públicas
      private: 0,  // Preguntas privadas del usuario
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category || 'sin-categoria';
      const difficulty = data.difficulty || 'sin-dificultad';
      const isPublic = data.isPublic ?? false;

      if (!stats[category]) {
        stats[category] = {};
      }
      stats[category][difficulty] = (stats[category][difficulty] || 0) + 1;

      if (isPublic) {
        modeStats.classic++;
        modeStats.timed++;
      } else {
        modeStats.private++;
      }
    });

    console.log('📈 Distribución por categoría y dificultad:\n');
    console.log('┌─────────────────┬──────┬────────┬──────┬───────┐');
    console.log('│ Categoría       │ Easy │ Medium │ Hard │ Total │');
    console.log('├─────────────────┼──────┼────────┼──────┼───────┤');

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    Object.keys(stats).sort().forEach((category) => {
      const easy = stats[category]['easy'] || 0;
      const medium = stats[category]['medium'] || 0;
      const hard = stats[category]['hard'] || 0;
      const total = easy + medium + hard;

      totalEasy += easy;
      totalMedium += medium;
      totalHard += hard;

      console.log(
        `│ ${category.padEnd(15)} │ ${String(easy).padStart(4)} │ ${String(medium).padStart(6)} │ ${String(hard).padStart(4)} │ ${String(total).padStart(5)} │`
      );
    });

    console.log('├─────────────────┼──────┼────────┼──────┼───────┤');
    console.log(
      `│ ${'TOTAL'.padEnd(15)} │ ${String(totalEasy).padStart(4)} │ ${String(totalMedium).padStart(6)} │ ${String(totalHard).padStart(4)} │ ${String(totalEasy + totalMedium + totalHard).padStart(5)} │`
    );
    console.log('└─────────────────┴──────┴────────┴──────┴───────┘\n');

    console.log('🎮 Disponibilidad por modo de juego:\n');
    console.log(`  📘 Modo Clásico:    ${modeStats.classic} preguntas públicas`);
    console.log(`  ⏱️  Modo Contrarreloj: ${modeStats.timed} preguntas públicas`);
    console.log(`  🔒 Preguntas privadas: ${modeStats.private} preguntas\n`);

    // Verificar campos faltantes
    console.log('🔍 Verificando integridad de datos:\n');
    let missingFields = 0;
    let correctDocs = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const required = ['question', 'options', 'correctAnswer', 'category', 'difficulty', 'isPublic'];
      const missing = required.filter(field => !(field in data));

      if (missing.length > 0) {
        console.log(`  ⚠️  ${doc.id}: Faltan campos ${missing.join(', ')}`);
        missingFields++;
      } else {
        correctDocs++;
      }
    });

    console.log(`\n  ✅ Documentos correctos: ${correctDocs}`);
    console.log(`  ⚠️  Documentos con campos faltantes: ${missingFields}\n`);

    // Recomendaciones
    console.log('💡 Recomendaciones:\n');

    const minPerCategory = 10;
    Object.keys(stats).forEach((category) => {
      const total = Object.values(stats[category]).reduce((a, b) => a + b, 0);
      if (total < minPerCategory) {
        console.log(`  📝 ${category}: Solo ${total} preguntas (recomendado: ${minPerCategory}+)`);
      }
    });

    if (totalEasy + totalMedium + totalHard < 30) {
      console.log(`  📝 Total de preguntas: ${totalEasy + totalMedium + totalHard} (recomendado: 30+ para buena experiencia)`);
    }

    if (missingFields > 0) {
      console.log(`  🔧 Ejecutar script de corrección para ${missingFields} documentos`);
    }

  } catch (error: any) {
    console.error('\n❌ Error consultando Firestore:', error.message);
    console.error('   Código:', error.code);
  }

  rl.close();
  process.exit(0);
}

verifyFirestore();
