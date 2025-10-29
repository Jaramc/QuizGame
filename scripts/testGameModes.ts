/**
 * Script de prueba para los 3 modos de juego
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as readline from 'readline';

// Importar funciones (esto requiere que el código esté compilado)
const firebaseConfig = {
  apiKey: "AIzaSyB2od6Zg6m4KigUnVRhulbxE0eQK7Ab4LY",
  authDomain: "quizgame-eda3c.firebaseapp.com",
  projectId: "quizgame-eda3c",
  storageBucket: "quizgame-eda3c.firebasestorage.app",
  messagingSenderId: "1083637056661",
  appId: "1:1083637056661:web:f0320862abaccb0812c79c"
};

const app = initializeApp(firebaseConfig);
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

async function testGameModes() {
  console.log('🧪 TESTING DE MODOS DE JUEGO\n');
  
  const email = await question('Email de Firebase Auth: ');
  const password = await question('Contraseña: ');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    console.log('✅ Autenticado:', userCredential.user.uid);
    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('❌ Error de autenticación:', error.message);
    rl.close();
    process.exit(1);
  }

  // Aquí normalmente importaríamos las funciones desde questionService
  // Pero como estamos en Node.js y el código usa React Native,
  // solo vamos a hacer queries directas de Firestore
  
  const { getFirestore, collection, getDocs, query, where, limit, orderBy } = require('firebase/firestore');
  const db = getFirestore(app);

  console.log('TEST 1: Preguntas Públicas (Modo Clásico/Contrarreloj)\n');
  console.log('-'.repeat(60));
  
  try {
    // Test 1.1: Todas las preguntas públicas
    const q1 = query(
      collection(db, 'questions'),
      where('isPublic', '==', true),
      limit(10)
    );
    const snap1 = await getDocs(q1);
    console.log(`✅ Todas públicas: ${snap1.size} preguntas`);
    
    // Test 1.2: Categoría específica
    const q2 = query(
      collection(db, 'questions'),
      where('isPublic', '==', true),
      where('category', '==', 'science'),
      limit(10)
    );
    const snap2 = await getDocs(q2);
    console.log(`✅ Science públicas: ${snap2.size} preguntas`);
    
    // Test 1.3: Categoría + Dificultad
    const q3 = query(
      collection(db, 'questions'),
      where('isPublic', '==', true),
      where('category', '==', 'science'),
      where('difficulty', '==', 'medium'),
      limit(10)
    );
    const snap3 = await getDocs(q3);
    console.log(`✅ Science/Medium públicas: ${snap3.size} preguntas`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'failed-precondition') {
      console.log('\n⚠️  NECESITAS CREAR ÍNDICES COMPUESTOS');
      console.log('   URL:', error.message.match(/https:\/\/[^\s]+/)?.[0] || 'Ver Firebase Console');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('TEST 2: Preguntas del Usuario (Modo Mis Preguntas)\n');
  console.log('-'.repeat(60));
  
  try {
    const userId = auth.currentUser?.uid;
    
    // Test 2.1: Contar preguntas del usuario
    const q4 = query(
      collection(db, 'questions'),
      where('createdBy', '==', userId),
      where('isPublic', '==', false)
    );
    const snap4 = await getDocs(q4);
    console.log(`📊 Preguntas privadas del usuario: ${snap4.size}`);
    
    if (snap4.size < 10) {
      console.log(`⚠️  Necesitas crear ${10 - snap4.size} preguntas más para jugar Modo Mis Preguntas`);
    } else {
      console.log(`✅ Puedes jugar Modo Mis Preguntas (tienes ${snap4.size}/10)`);
    }
    
    // Test 2.2: Obtener preguntas del usuario
    const q5 = query(
      collection(db, 'questions'),
      where('createdBy', '==', userId),
      where('isPublic', '==', false),
      limit(10)
    );
    const snap5 = await getDocs(q5);
    console.log(`✅ Cargadas para jugar: ${snap5.size} preguntas`);
    
    if (snap5.size > 0) {
      console.log('\n📋 Ejemplos:');
      snap5.docs.slice(0, 3).forEach((doc: any, i: number) => {
        const data = doc.data();
        console.log(`   ${i + 1}. [${data.category}/${data.difficulty}] ${data.question.substring(0, 50)}...`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'failed-precondition') {
      console.log('\n⚠️  NECESITAS CREAR ÍNDICES COMPUESTOS');
      console.log('   URL:', error.message.match(/https:\/\/[^\s]+/)?.[0] || 'Ver Firebase Console');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('TEST 3: Estrategia Progresiva\n');
  console.log('-'.repeat(60));
  
  try {
    console.log('Simulando búsqueda flexible para Modo Clásico...\n');
    
    const category = 'art';
    const difficulty = 'hard';
    let accumulated = new Set();
    
    // Intento 1: Exacto
    const exact = query(
      collection(db, 'questions'),
      where('isPublic', '==', true),
      where('category', '==', category),
      where('difficulty', '==', difficulty),
      limit(10)
    );
    const snapExact = await getDocs(exact);
    snapExact.docs.forEach((doc: any) => accumulated.add(doc.id));
    console.log(`  1️⃣  Exacto (${category}/${difficulty}): ${snapExact.size} → Total: ${accumulated.size}`);
    
    // Intento 2: Solo categoría
    if (accumulated.size < 10) {
      const catOnly = query(
        collection(db, 'questions'),
        where('isPublic', '==', true),
        where('category', '==', category),
        limit(20)
      );
      const snapCat = await getDocs(catOnly);
      snapCat.docs.forEach((doc: any) => accumulated.add(doc.id));
      console.log(`  2️⃣  Solo categoría (${category}): ${snapCat.size} → Total: ${accumulated.size}`);
    }
    
    // Intento 3: Solo dificultad
    if (accumulated.size < 10) {
      const diffOnly = query(
        collection(db, 'questions'),
        where('isPublic', '==', true),
        where('difficulty', '==', difficulty),
        limit(20)
      );
      const snapDiff = await getDocs(diffOnly);
      snapDiff.docs.forEach((doc: any) => accumulated.add(doc.id));
      console.log(`  3️⃣  Solo dificultad (${difficulty}): ${snapDiff.size} → Total: ${accumulated.size}`);
    }
    
    // Intento 4: Todas públicas
    if (accumulated.size < 10) {
      const all = query(
        collection(db, 'questions'),
        where('isPublic', '==', true),
        limit(50)
      );
      const snapAll = await getDocs(all);
      snapAll.docs.forEach((doc: any) => accumulated.add(doc.id));
      console.log(`  4️⃣  Todas públicas: ${snapAll.size} → Total: ${accumulated.size}`);
    }
    
    console.log(`\n✅ Resultado final: ${accumulated.size} preguntas únicas`);
    
    if (accumulated.size < 10) {
      console.log(`⚠️  Se completarían con ${10 - accumulated.size} preguntas de localQuestions.ts`);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tests completados\n');
  
  rl.close();
  process.exit(0);
}

testGameModes();
