# 🎮 Guía de Implementación: 3 Modos de Juego# Implementación de Modos de Juego



## ✅ Estado Actual## 📋 Resumen

Se ha implementado completamente la funcionalidad de juego para los modos Clásico y Contrarreloj, dejando Multijugador como "Próximamente".

**Firestore:**

- ✅ 24 preguntas públicas migradas## 🎮 Estructura Implementada

- ✅ Reglas de seguridad actualizadas

- ⏳ Índices compuestos pendientes### 1. Context de Juego (`contexts/game/GameContext.tsx`)

- **GameProvider**: Proveedor de estado global del juego

**Código:**- **useGame Hook**: Hook para acceder al estado del juego

- ✅ `getQuestionsForPublicModes()` - Para Clásico y Contrarreloj- **Funcionalidades**:

- ✅ `getUserQuestions()` - Para Mis Preguntas  - `startGame()`: Inicia una nueva sesión de juego

- ✅ `canPlayMyQuestionsMode()` - Validación de 10+ preguntas  - `answerQuestion()`: Procesa la respuesta del usuario

- ⏳ Pantallas de juego pendientes de actualizar  - `endGame()`: Finaliza el juego y calcula estadísticas

  - `resetGame()`: Reinicia el estado

---

### 2. Servicios

## 🔧 Funciones Disponibles

#### Question Service (`services/questions/questionService.ts`)

### 1️⃣ Modo Clásico y Contrarreloj- `createQuestion()`: Crea preguntas personalizadas

- `getQuestionsForGame()`: Obtiene preguntas mezcladas (públicas + privadas del usuario)

```typescript- `getUserQuestions()`: Lista preguntas del usuario

import { getQuestionsForPublicModes } from '@/services/questions';- `updateQuestion()`: Actualiza una pregunta

- `deleteQuestion()`: Elimina una pregunta

// Cargar 10 preguntas públicas

const questions = await getQuestionsForPublicModes(#### Game Service (`services/game/gameService.ts`)

  'science',  // categoría (opcional)- `createGameSession()`: Crea una sesión de juego en Firestore

  'medium',   // dificultad (opcional)- `saveUserAnswer()`: Guarda cada respuesta del usuario

  10          // cantidad- `finishGame()`: Finaliza sesión y calcula puntuación

);- `updateUserStats()`: Actualiza estadísticas del usuario

```- `getUserStats()`: Obtiene estadísticas del usuario

- `getGlobalRanking()`: Obtiene ranking global

**Características:**

- Usa SOLO preguntas con `isPublic: true`### 3. Pantallas de Juego

- Estrategia progresiva: exacto → categoría → dificultad → todas

- Completa con `localQuestions.ts` si < 10 en Firestore#### `/play.tsx` - Selección de Modo

- Siempre retorna 10 preguntas- **Modo Clásico**: Sin límite de tiempo, 3 vidas

- **Contrarreloj**: 30 segundos por pregunta, respuestas rápidas = más puntos

---- **Multijugador**: Deshabilitado con badge "Próximamente"



### 2️⃣ Modo Mis Preguntas#### `/play/category-select.tsx` - Selección de Categoría y Dificultad

- **Categorías Disponibles**:

```typescript  - 🎨 Arte

import { getUserQuestions, canPlayMyQuestionsMode } from '@/services/questions';  - 🔬 Ciencia

  - ⚽ Deportes

// 1. Validar antes de jugar  - 🎬 Entretenimiento

const validation = await canPlayMyQuestionsMode(user.uid, 10);  - 🗺️ Geografía

if (!validation.canPlay) {  - 📚 Historia

  alert(validation.message); // "Necesitas crear 7 preguntas más (3/10)"

  return;- **Niveles de Dificultad**:

}  - 😊 Fácil (10 puntos)

  - 😐 Medio (20 puntos)

// 2. Cargar preguntas del usuario  - 😰 Difícil (30 puntos)

const questions = await getUserQuestions(

  user.uid,#### `/play/game.tsx` - Pantalla de Juego

  'science',  // categoría (opcional)- **Características**:

  'medium',   // dificultad (opcional)  - Muestra pregunta con 4 opciones de respuesta

  10          // cantidad  - Respuestas mezcladas aleatoriamente

);  - Retroalimentación visual (verde = correcto, rojo = incorrecto)

```  - Delay de 1.5s entre preguntas

  - Barra de progreso

**Características:**  - Display de puntuación, racha y vidas

- Usa SOLO preguntas con `isPublic: false` y `createdBy: userId`

- **NO** usa fallback local (requiere autenticación)- **Modo Clásico**:

- Valida mínimo 10 preguntas del usuario  - Sin límite de tiempo

  - 3 vidas (Game Over si se pierden todas)

---  - Respuesta correcta = +1 vida (máx 5)



## 📝 Siguiente Paso: Crear Índices- **Modo Contrarreloj**:

  - Timer de 30 segundos por pregunta

Ve a Firebase Console y crea estos 2 índices:  - Timer urgente (<10s): fondo rojo

  - Tiempo agotado = respuesta incorrecta

### Índice 1: Preguntas públicas  - Bonus por velocidad

```

Collection: questions## 🔄 Flujo de Juego

Fields:

  isPublic (Ascending)```

  category (Ascending)1. Usuario selecciona modo en /play.tsx

  difficulty (Ascending)   ↓

  createdAt (Descending)2. Navega a /play/category-select

```   ↓

3. Selecciona categoría y dificultad

### Índice 2: Preguntas del usuario   ↓

```4. Presiona "¡Comenzar!"

Collection: questions   ↓

Fields:5. useGame.startGame() carga 10 preguntas

  createdBy (Ascending)   ↓

  isPublic (Ascending)6. Navega a /play/game

  category (Ascending)   ↓

  createdAt (Descending)7. Muestra pregunta y opciones

```   ↓

8. Usuario selecciona respuesta

**URL:** https://console.firebase.google.com/project/quizgame-eda3c/firestore/indexes   ↓

9. useGame.answerQuestion() procesa

---   ↓

10. Retroalimentación visual (1.5s)

## 🎯 Resumen   ↓

11. Siguiente pregunta o fin del juego

✅ **Completado:**   ↓

- Backend Firestore configurado12. useGame.endGame() calcula resultados

- Funciones de carga implementadas   ↓

- Reglas de seguridad actualizadas13. Alert con puntuación final

- 24 preguntas base en Firestore   ↓

14. Navega de vuelta a /play

⏳ **Pendiente:**```

- Crear 2 índices compuestos en Firebase Console

- Actualizar pantallas de juego## 🎯 Sistema de Puntuación

- Implementar timer para Contrarreloj

- Crear pantalla de gestión de preguntas### Puntos Base por Dificultad

- Fácil: 10 puntos

**¿Todo listo para crear los índices?** 🚀- Medio: 20 puntos  

- Difícil: 30 puntos

### Multiplicadores (Modo Contrarreloj)
- Tiempo restante >20s: +50% bonus
- Tiempo restante 10-20s: +25% bonus
- Tiempo restante <10s: +10% bonus

### Sistema de Rachas
- Cada respuesta correcta consecutiva aumenta la racha
- Respuesta incorrecta reinicia la racha a 0

### Sistema de Vidas (Modo Clásico)
- Inicio: 3 vidas
- Respuesta correcta: +1 vida (máximo 5)
- Respuesta incorrecta: -1 vida
- Game Over: 0 vidas

## 📊 Estadísticas Guardadas

En Firestore se guarda:
- `totalGames`: Total de partidas jugadas
- `totalScore`: Puntuación acumulada
- `bestScore`: Mejor puntuación individual
- `averageAccuracy`: Precisión promedio
- `totalCorrect`: Total de respuestas correctas
- `totalQuestions`: Total de preguntas respondidas
- `categoryStats`: Estadísticas por categoría
- `level`: Nivel del jugador (1000 pts = 1 nivel)

## 🔧 Integración Realizada

### 1. Root Layout (`app/_layout.tsx`)
```tsx
<AuthProvider>
  <GameProvider>  {/* ✅ Agregado */}
    <ThemeProvider>
      <Stack>...</Stack>
    </ThemeProvider>
  </GameProvider>
</AuthProvider>
```

### 2. Play Layout (`app/(dashboard)/play/_layout.tsx`)
```tsx
<Stack>
  <Stack.Screen name="category-select" />
  <Stack.Screen name="game" />
</Stack>
```

### 3. Navegación Conectada
- Modo Clásico → `/(dashboard)/play/category-select?mode=classic`
- Contrarreloj → `/(dashboard)/play/category-select?mode=timed`
- Multijugador → Deshabilitado (`disabled={true}`)

## ✅ Estado Actual

### Completado
- ✅ GameContext con estado global
- ✅ Servicios de preguntas y juego
- ✅ Pantalla de selección de modo
- ✅ Pantalla de selección de categoría/dificultad
- ✅ Pantalla de juego con timer
- ✅ Sistema de puntuación y vidas
- ✅ Guardar estadísticas en Firestore
- ✅ Navegación completa entre pantallas
- ✅ Retroalimentación visual
- ✅ Integración con AuthContext

### Pendiente
- ⏳ Pantalla de resultados detallada
- ⏳ Animaciones entre preguntas
- ⏳ Sonidos de feedback
- ⏳ Modo multijugador
- ⏳ Sistema de logros
- ⏳ Compartir resultados

## 🎨 Colores por Categoría
```typescript
art: '#E91E63'        // Rosa
science: '#2196F3'    // Azul
sports: '#4CAF50'     // Verde
entertainment: '#FF9800' // Naranja
geography: '#00BCD4'  // Cyan
history: '#795548'    // Marrón
```

## 📝 Notas Técnicas

1. **Mezcla de Preguntas**: `getQuestionsForGame()` combina preguntas públicas y privadas del usuario
2. **Shuffling**: Las respuestas se mezclan aleatoriamente en cada pregunta
3. **Timer**: El timer solo se activa en modo `timed`
4. **Persistencia**: Todas las sesiones y respuestas se guardan en Firestore
5. **Validación**: Se validan categoría y dificultad antes de iniciar el juego

## 🚀 Próximos Pasos Sugeridos

1. Crear pantalla de resultados con gráficos
2. Agregar animaciones más fluidas
3. Implementar sistema de logros
4. Agregar modo práctica (sin guardar estadísticas)
5. Implementar desafíos diarios
6. Agregar power-ups
7. Modo multijugador en tiempo real

---

**Fecha de Implementación**: 2024
**Versión**: 1.0.0
**Estado**: ✅ Funcional - Modos Clásico y Contrarreloj operativos
