/**
 * Layout para las pantallas de juego
 */

import { Stack } from 'expo-router';

export default function PlayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="category-select" />
      <Stack.Screen name="game" />
    </Stack>
  );
}
