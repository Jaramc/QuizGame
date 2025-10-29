/**
 * Script para verificar y actualizar el campo isPublic en todas las preguntas
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs,
  updateDoc,
  doc
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

async function checkAndFixQuestions() {
  console.log('🔐 Verificación y Corrección de Preguntas\n');
  
  const email = await question('Ingresa tu email de Firebase Auth: ');
  const password = await question('Ingresa tu contraseña: ');
  
  console.log('\n🔄 Autenticando...');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    console.log(`✅ Autenticado como: ${userCredential.user.email}\n`);
  } catch (error: any) {
    console.error('❌ Error de autenticación:', error.message);
    rl.close();
    process.exit(1);
  }

  console.log('📊 Consultando todas las preguntas en Firestore...\n');

  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    
    console.log(`📝 Total de preguntas encontradas: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('⚠️  No hay preguntas en Firestore.');
      console.log('   Ejecuta primero: npx ts-node --project tsconfig.scripts.json scripts/migrateQuestionsWithAuth.ts');
      rl.close();
      process.exit(0);
    }

    let needsUpdate = 0;
    let alreadyCorrect = 0;

    // Primera pasada: verificar
    console.log('🔍 Verificando campos...\n');
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 ${doc.id}:`);
      console.log(`   Pregunta: ${data.question?.substring(0, 50)}...`);
      console.log(`   Category: ${data.category || '❌ FALTA'}`);
      console.log(`   Difficulty: ${data.difficulty || '❌ FALTA'}`);
      console.log(`   isPublic: ${data.isPublic !== undefined ? data.isPublic : '❌ FALTA'}`);
      console.log(`   createdBy: ${data.createdBy || '❌ FALTA'}`);
      
      if (data.isPublic !== true) {
        console.log(`   ⚠️  Necesita actualización\n`);
        needsUpdate++;
      } else {
        console.log(`   ✅ OK\n`);
        alreadyCorrect++;
      }
    });

    console.log('='.repeat(60));
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Correctas: ${alreadyCorrect}`);
    console.log(`   ⚠️  Necesitan actualización: ${needsUpdate}`);
    console.log('='.repeat(60));

    if (needsUpdate > 0) {
      const confirm = await question(`\n¿Actualizar ${needsUpdate} preguntas a isPublic: true? (s/n): `);
      
      if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'y') {
        console.log('\n🔄 Actualizando preguntas...\n');
        
        let updated = 0;
        let errors = 0;

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          
          if (data.isPublic !== true) {
            try {
              await updateDoc(doc(db, 'questions', docSnap.id), {
                isPublic: true
              });
              console.log(`✅ Actualizado: ${docSnap.id}`);
              updated++;
            } catch (error: any) {
              console.error(`❌ Error: ${docSnap.id} - ${error.message}`);
              errors++;
            }
          }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Resultado:');
        console.log(`   ✅ Actualizadas: ${updated}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log('='.repeat(60));

        if (updated > 0) {
          console.log('\n🎉 ¡Listo! Ahora reinicia la app:');
          console.log('   npx expo start --clear');
        }
      } else {
        console.log('\n❌ Operación cancelada.');
      }
    } else {
      console.log('\n✅ Todas las preguntas ya tienen isPublic: true');
      console.log('   Si la app sigue sin cargar, el problema puede ser:');
      console.log('   1. Cache de Firestore - Reinicia la app');
      console.log('   2. Reglas no aplicadas - Espera 1 minuto y prueba de nuevo');
    }

  } catch (error: any) {
    console.error('\n❌ Error al consultar Firestore:', error.message);
  }

  rl.close();
  process.exit(0);
}

checkAndFixQuestions();
