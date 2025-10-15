/**
 * Configuración de Firebase
 * Inicializa la conexión con Firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// No necesitamos getReactNativePersistence en esta versión de Firebase

// TODO: Reemplazar con tus credenciales de Firebase
// Las obtendrás desde Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
const auth = getAuth(app);

export { app, auth };
