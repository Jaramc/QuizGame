/**
 * Configuración de Firebase
 * Inicializa la conexión con Firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// No necesitamos getReactNativePersistence en esta versión de Firebase

// TODO: Reemplazar con tus credenciales de Firebase
// Las obtendrás desde Firebase Console > Project Settings > Your apps
// Your web app's Firebase configuration
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

// Inicializar Auth
const auth = getAuth(app);

export { app, auth };

