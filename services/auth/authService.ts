/**
 * Servicio de Autenticación con Firebase
 * Maneja registro, login y logout
 */

import { auth } from '@/config/firebase';
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    UserCredential
} from 'firebase/auth';

/**
 * Convierte un usuario de Firebase al formato de nuestra app
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
    avatar: firebaseUser.photoURL || undefined,
    photoURL: firebaseUser.photoURL || null,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
};

/**
 * Registrar nuevo usuario con email y contraseña
 */
export const registerWithEmail = async (credentials: RegisterCredentials): Promise<User> => {
  try {
    const { email, password, username } = credentials;

    // Crear usuario en Firebase Auth
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Actualizar el perfil con el username
    await updateProfile(userCredential.user, {
      displayName: username,
    });

    // Retornar usuario en formato de nuestra app
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Manejo de errores específicos de Firebase
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Este email ya está registrado');
      case 'auth/invalid-email':
        throw new Error('Email inválido');
      case 'auth/weak-password':
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      default:
        throw new Error('Error al registrarse. Intenta de nuevo');
    }
  }
};

/**
 * Iniciar sesión con email y contraseña
 */
export const loginWithEmail = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const { email, password } = credentials;

    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('Error en login:', error);
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('Email o contraseña incorrectos');
      case 'auth/invalid-email':
        throw new Error('Email inválido');
      case 'auth/user-disabled':
        throw new Error('Esta cuenta ha sido deshabilitada');
      default:
        throw new Error('Error al iniciar sesión. Intenta de nuevo');
    }
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw new Error('Error al cerrar sesión');
  }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
};

/**
 * Observador de cambios de autenticación
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged((firebaseUser) => {
    const user = firebaseUser ? mapFirebaseUser(firebaseUser) : null;
    callback(user);
  });
};
