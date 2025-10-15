# Implementación de Modos de Juego

## 📋 Resumen
Se ha implementado completamente la funcionalidad de juego para los modos Clásico y Contrarreloj, dejando Multijugador como "Próximamente".

## 🎮 Estructura Implementada

### 1. Context de Juego (`contexts/game/GameContext.tsx`)
- **GameProvider**: Proveedor de estado global del juego
- **useGame Hook**: Hook para acceder al estado del juego
- **Funcionalidades**:
  - `startGame()`: Inicia una nueva sesión de juego
  - `answerQuestion()`: Procesa la respuesta del usuario
  - `endGame()`: Finaliza el juego y calcula estadísticas
  - `resetGame()`: Reinicia el estado

### 2. Servicios

#### Question Service (`services/questions/questionService.ts`)
- `createQuestion()`: Crea preguntas personalizadas
- `getQuestionsForGame()`: Obtiene preguntas mezcladas (públicas + privadas del usuario)
- `getUserQuestions()`: Lista preguntas del usuario
- `updateQuestion()`: Actualiza una pregunta
- `deleteQuestion()`: Elimina una pregunta

#### Game Service (`services/game/gameService.ts`)
- `createGameSession()`: Crea una sesión de juego en Firestore
- `saveUserAnswer()`: Guarda cada respuesta del usuario
- `finishGame()`: Finaliza sesión y calcula puntuación
- `updateUserStats()`: Actualiza estadísticas del usuario
- `getUserStats()`: Obtiene estadísticas del usuario
- `getGlobalRanking()`: Obtiene ranking global

### 3. Pantallas de Juego

#### `/play.tsx` - Selección de Modo
- **Modo Clásico**: Sin límite de tiempo, 3 vidas
- **Contrarreloj**: 30 segundos por pregunta, respuestas rápidas = más puntos
- **Multijugador**: Deshabilitado con badge "Próximamente"

#### `/play/category-select.tsx` - Selección de Categoría y Dificultad
- **Categorías Disponibles**:
  - 🎨 Arte
  - 🔬 Ciencia
  - ⚽ Deportes
  - 🎬 Entretenimiento
  - 🗺️ Geografía
  - 📚 Historia

- **Niveles de Dificultad**:
  - 😊 Fácil (10 puntos)
  - 😐 Medio (20 puntos)
  - 😰 Difícil (30 puntos)

#### `/play/game.tsx` - Pantalla de Juego
- **Características**:
  - Muestra pregunta con 4 opciones de respuesta
  - Respuestas mezcladas aleatoriamente
  - Retroalimentación visual (verde = correcto, rojo = incorrecto)
  - Delay de 1.5s entre preguntas
  - Barra de progreso
  - Display de puntuación, racha y vidas

- **Modo Clásico**:
  - Sin límite de tiempo
  - 3 vidas (Game Over si se pierden todas)
  - Respuesta correcta = +1 vida (máx 5)

- **Modo Contrarreloj**:
  - Timer de 30 segundos por pregunta
  - Timer urgente (<10s): fondo rojo
  - Tiempo agotado = respuesta incorrecta
  - Bonus por velocidad

## 🔄 Flujo de Juego

```
1. Usuario selecciona modo en /play.tsx
   ↓
2. Navega a /play/category-select
   ↓
3. Selecciona categoría y dificultad
   ↓
4. Presiona "¡Comenzar!"
   ↓
5. useGame.startGame() carga 10 preguntas
   ↓
6. Navega a /play/game
   ↓
7. Muestra pregunta y opciones
   ↓
8. Usuario selecciona respuesta
   ↓
9. useGame.answerQuestion() procesa
   ↓
10. Retroalimentación visual (1.5s)
   ↓
11. Siguiente pregunta o fin del juego
   ↓
12. useGame.endGame() calcula resultados
   ↓
13. Alert con puntuación final
   ↓
14. Navega de vuelta a /play
```

## 🎯 Sistema de Puntuación

### Puntos Base por Dificultad
- Fácil: 10 puntos
- Medio: 20 puntos  
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
