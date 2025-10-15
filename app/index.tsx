/**
 * Punto de entrada de la aplicación
 * Siempre inicia en la pantalla de bienvenida
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // Siempre redirigir a welcome para mostrar el splash
  return <Redirect href="/auth/welcome" />;
}
