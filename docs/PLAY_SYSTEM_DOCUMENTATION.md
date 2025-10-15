# Sistema de Juego - Carpeta `/play`

## 📁 Estructura

```
app/
  play/
    _layout.tsx           # Layout de navegación para pantallas de juego
    category-select.tsx   # Selección de categoría y dificultad
    game.tsx              # Pantalla principal del juego
```

**Nota Importante**: La carpeta `play/` está **fuera de `(dashboard)/`** porque representa un flujo de navegación independiente que puede ser accedido desde múltiples puntos de la aplicación.

---

## 🎯 Arquitectura del Sistema

### Flujo de Navegación

```
Dashboard (/(dashboard)/play)
    ↓ [Usuario selecciona modo]
/play/category-select
    ↓ [Usuario selecciona categoría + dificultad]
/play/game
    ↓ [Juego finaliza]
Volver a Dashboard o Ver Ranking
```

### Integración con Contextos

El sistema de juego se integra con:
- **GameContext** (`contexts/game/GameContext.tsx`) - Estado global del juego
- **AuthContext** (`contexts/auth/AuthContext.tsx`) - Identificación del usuario
- **QuestionService** (`services/questions/questionService.ts`) - Carga de preguntas
- **GameService** (`services/game/gameService.ts`) - Gestión de sesiones y estadísticas

---

## 📄 Documentación de Archivos

### 1. `_layout.tsx` - Layout de Navegación

**Propósito**: Define la estructura de navegación para las pantallas de juego usando Stack Navigator.

**Características**:
- Stack navigation sin header
- Registro de rutas: `category-select` y `game`
- Permite navegación back automática

**Código**:
```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="category-select" />
  <Stack.Screen name="game" />
</Stack>
```

**Uso**:
No requiere interacción directa. Expo Router lo usa automáticamente.

---

### 2. `category-select.tsx` - Selección de Categoría y Dificultad

**Propósito**: Pantalla previa al juego donde el usuario selecciona la categoría y dificultad de las preguntas.

#### Parámetros de Entrada

```typescript
interface CategorySelectParams {
  mode: 'classic' | 'timed' | 'multiplayer';  // Modo de juego
}
```

**Recibido desde**: `/(dashboard)/play` mediante:
```typescript
router.push('/play/category-select?mode=classic');
```

#### Categorías Disponibles

| ID | Nombre | Icono | Color |
|----|--------|-------|-------|
| `art` | Arte | `color-palette` | `#E91E63` |
| `science` | Ciencia | `flask` | `#2196F3` |
| `sports` | Deportes | `football` | `#FF9800` |
| `entertainment` | Entretenimiento | `film` | `#9C27B0` |
| `geography` | Geografía | `earth` | `#4CAF50` |
| `history` | Historia | `time` | `#FF6B35` |

#### Dificultades Disponibles

| ID | Nombre | Puntos Base | Color |
|----|--------|-------------|-------|
| `easy` | Fácil | 10 pts | Verde (`Colors.success`) |
| `medium` | Media | 20 pts | Naranja (`Colors.accent`) |
| `hard` | Difícil | 30 pts | Rojo (`Colors.error`) |

#### Estado Local

```typescript
const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('art');
const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('medium');
```

#### Navegación de Salida

Al presionar **"¡Comenzar!"**:
```typescript
router.push({
  pathname: '/play/game',
  params: {
    mode: 'classic',              // Modo recibido
    category: 'science',           // Categoría seleccionada
    difficulty: 'hard'             // Dificultad seleccionada
  }
});
```

#### UI/UX

**Animaciones**:
- Header: `fadeInDown` (800ms)
- Categorías: `fadeInUp` (800ms, delay 200ms)
- Dificultad: `fadeInUp` (800ms, delay 400ms)
- Botón Jugar: `fadeInUp` (800ms, delay 600ms)

**Feedback Visual**:
- Categoría seleccionada: Borde blanco + sombra + checkmark
- Dificultad seleccionada: Fondo de color + texto blanco

**Botón Back**: Navega a la pantalla anterior (`router.back()`)

---

### 3. `game.tsx` - Pantalla Principal del Juego

**Propósito**: Pantalla donde se desarrolla el juego completo con preguntas, respuestas, timer y puntuación.

#### Parámetros de Entrada

```typescript
interface GameParams {
  mode: 'classic' | 'timed';
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
}
```

#### Hooks Utilizados

```typescript
const { user } = useAuth();                    // Usuario autenticado
const { 
  session,                                      // Sesión actual
  currentQuestion,                              // Pregunta actual
  isLoading,                                    // Estado de carga
  startGame,                                    // Iniciar juego
  answerQuestion,                               // Procesar respuesta
  endGame                                       // Finalizar juego
} = useGame();
```

#### Estado Local

```typescript
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
const [timeLeft, setTimeLeft] = useState<number>(30);
const [isAnswered, setIsAnswered] = useState(false);
```

#### Ciclo de Vida del Juego

##### 1. Inicialización (useEffect - Mount)

```typescript
useEffect(() => {
  const initGame = async () => {
    try {
      const userId = (user as any)?.uid || user?.id;
      await startGame(mode, category, difficulty, userId);
      setQuestionStartTime(Date.now());
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el juego');
      router.back();
    }
  };
  initGame();
}, []);
```

**Acciones**:
1. Obtiene el ID del usuario
2. Llama a `startGame()` con parámetros
3. `startGame()` en GameContext:
   - Carga 10 preguntas desde Firestore
   - Crea sesión de juego
   - Establece primera pregunta
4. Registra tiempo de inicio de pregunta

##### 2. Timer (Solo Modo Contrarreloj)

```typescript
useEffect(() => {
  if (!isTimed || !currentQuestion || isAnswered) return;
  
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        handleAnswer('');  // Tiempo agotado
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [currentQuestion, isAnswered, isTimed]);
```

**Comportamiento**:
- Cuenta regresiva de 30 segundos
- Cuando llega a 0: respuesta automática vacía (incorrecta)
- Se detiene al responder o cambiar de pregunta
- Timer urgente (<10s): texto amarillo `#FFD60A`

##### 3. Reset al Cambiar Pregunta

```typescript
useEffect(() => {
  if (currentQuestion) {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(30);
    setQuestionStartTime(Date.now());
  }
}, [currentQuestion]);
```

##### 4. Detección de Fin de Juego

```typescript
useEffect(() => {
  if (session?.status === 'finished') {
    handleGameEnd();
  }
}, [session?.status]);
```

#### Manejo de Respuestas

```typescript
const handleAnswer = async (answer: string) => {
  if (isAnswered || !currentQuestion) return;
  
  setIsAnswered(true);              // Bloquear nuevas respuestas
  setSelectedAnswer(answer);        // Marcar respuesta seleccionada
  
  const timeSpent = Date.now() - questionStartTime;
  
  setTimeout(async () => {
    await answerQuestion(answer, timeSpent);
  }, 1500);  // Feedback visual de 1.5 segundos
};
```

**Proceso**:
1. Usuario toca una respuesta
2. Se marca como respondida (bloqueo)
3. Se muestra feedback visual (verde/rojo)
4. Espera 1.5 segundos
5. Llama a `answerQuestion()` del contexto
6. GameContext:
   - Valida si es correcta
   - Actualiza puntuación, vidas, racha
   - Avanza a siguiente pregunta o finaliza
   - Guarda respuesta en Firestore

#### Fin del Juego

```typescript
const handleGameEnd = () => {
  const accuracy = Math.round(
    (session.answers.filter(a => a.isCorrect).length / 
     session.answers.length) * 100
  );
  
  Alert.alert(
    '¡Juego Terminado!',
    `Puntuación: ${session.score}\nPrecisión: ${accuracy}%`,
    [
      {
        text: 'Ver Resultados',
        onPress: async () => {
          await endGame();
          router.replace('/(dashboard)/ranking');
        }
      },
      {
        text: 'Jugar de Nuevo',
        onPress: async () => {
          await endGame();
          router.back();
        }
      }
    ]
  );
};
```

**Triggers de Fin**:
- Modo Clásico: Vidas = 0 o completar 10 preguntas
- Modo Contrarreloj: Completar 10 preguntas

**Opciones**:
1. **Ver Resultados**: Llama a `endGame()` → Navega a Ranking
2. **Jugar de Nuevo**: Llama a `endGame()` → Vuelve a `/play/category-select`

`endGame()` realiza:
- Finaliza sesión en Firestore
- Calcula puntuación final
- Actualiza estadísticas del usuario
- Limpia estado del contexto

#### UI Components

##### Header con Estadísticas

```tsx
<View style={styles.statsRow}>
  <View style={styles.statItem}>
    <Ionicons name="trophy" size={20} color={Colors.accent} />
    <Text>{session.score}</Text>           {/* Puntuación */}
  </View>
  
  <View style={styles.statItem}>
    <Ionicons name="flame" size={20} color={Colors.error} />
    <Text>{session.streak}</Text>          {/* Racha */}
  </View>
  
  <View style={styles.statItem}>
    <Ionicons name="heart" size={20} color={Colors.error} />
    <Text>{session.lives}</Text>           {/* Vidas */}
  </View>
  
  {isTimed && (
    <View style={styles.timerContainer}>
      <Ionicons name="timer" size={20} />
      <Text>{timeLeft}s</Text>             {/* Timer */}
    </View>
  )}
</View>
```

##### Barra de Progreso

```tsx
<View style={styles.progressBarContainer}>
  <View style={[
    styles.progressBar, 
    { width: `${(currentIndex / totalQuestions) * 100}%` }
  ]} />
</View>
```

##### Pregunta

```tsx
<Animatable.View animation="fadeInDown" duration={600}>
  <View style={styles.questionCard}>
    <Text style={styles.questionText}>
      {currentQuestion.question}
    </Text>
  </View>
</Animatable.View>
```

##### Respuestas (4 opciones mezcladas)

```tsx
const allAnswers = [
  currentQuestion.correctAnswer,
  ...currentQuestion.incorrectAnswers
].sort(() => Math.random() - 0.5);  // Mezcla aleatoria

{allAnswers.map((answer, index) => {
  const isCorrect = answer === currentQuestion.correctAnswer;
  const isSelected = selectedAnswer === answer;
  const showCorrect = isAnswered && isCorrect;
  const showIncorrect = isAnswered && isSelected && !isCorrect;
  
  return (
    <TouchableOpacity
      style={[
        styles.answerButton,
        showCorrect && { backgroundColor: Colors.success },
        showIncorrect && { backgroundColor: Colors.error }
      ]}
      onPress={() => handleAnswer(answer)}
      disabled={isAnswered}
    >
      <Text>{answer}</Text>
      {showCorrect && <Ionicons name="checkmark-circle" />}
      {showIncorrect && <Ionicons name="close-circle" />}
    </TouchableOpacity>
  );
})}
```

**Feedback Visual**:
- Sin responder: Fondo `Colors.card`, borde `Colors.border`
- Correcta: Fondo verde (`Colors.success`) + checkmark
- Incorrecta: Fondo rojo (`Colors.error`) + X

##### Indicador de Puntos

```tsx
<View style={styles.pointsContainer}>
  <Text style={styles.pointsText}>
    +{currentQuestion.points} puntos
  </Text>
</View>
```

#### Animaciones

| Elemento | Animación | Duración | Delay |
|----------|-----------|----------|-------|
| Loading | `pulse` (infinite) | 1000ms | - |
| Pregunta | `fadeInDown` | 600ms | - |
| Respuesta 1 | `fadeInUp` | 600ms | 0ms |
| Respuesta 2 | `fadeInUp` | 600ms | 100ms |
| Respuesta 3 | `fadeInUp` | 600ms | 200ms |
| Respuesta 4 | `fadeInUp` | 600ms | 300ms |

#### Pantalla de Carga

Se muestra mientras `isLoading === true` o `!currentQuestion`:

```tsx
<View style={styles.loadingContainer}>
  <Animatable.View animation="pulse" iterationCount="infinite">
    <Ionicons name="game-controller" size={64} color={Colors.primary} />
  </Animatable.View>
  <Text>Cargando preguntas...</Text>
</View>
```

---

## 🎮 Diferencias entre Modos de Juego

### Modo Clásico (`mode: 'classic'`)

| Característica | Valor |
|----------------|-------|
| Límite de tiempo | ❌ Ninguno |
| Vidas iniciales | 3 |
| Vidas máximas | 5 |
| Respuesta correcta | +1 vida |
| Respuesta incorrecta | -1 vida |
| Fin de juego | Vidas = 0 o 10 preguntas |
| Puntuación | Solo puntos base |
| Timer visible | ❌ No |

### Modo Contrarreloj (`mode: 'timed'`)

| Característica | Valor |
|----------------|-------|
| Límite de tiempo | ✅ 30 segundos/pregunta |
| Vidas iniciales | 3 |
| Vidas máximas | 5 |
| Respuesta correcta | +1 vida |
| Respuesta incorrecta | -1 vida |
| Tiempo agotado | Respuesta incorrecta automática |
| Fin de juego | 10 preguntas (o vidas = 0) |
| Puntuación | Puntos base + bonus velocidad |
| Timer visible | ✅ Sí (urgente <10s) |

**Bonus de Velocidad (Contrarreloj)**:
- Tiempo restante >20s: +50% puntos
- Tiempo restante 10-20s: +25% puntos
- Tiempo restante <10s: +10% puntos

---

## 📊 Integración con GameContext

### Funciones Utilizadas

#### `startGame(mode, category, difficulty, userId)`

**Llamado desde**: `game.tsx` (useEffect inicial)

**Acción**:
1. Llama a `getQuestionsForGame(category, difficulty, userId)`:
   - Obtiene preguntas públicas de Firestore
   - Obtiene preguntas privadas del usuario
   - Mezcla aleatoriamente
   - Retorna 10 preguntas
2. Llama a `createGameSession()` del game service:
   - Crea documento en `games` collection
   - Guarda: userId, mode, category, difficulty, timestamp
3. Establece `session` con:
   - `questions`: Array de 10 preguntas
   - `mode`, `category`, `difficulty`
   - `score: 0`, `lives: 3`, `streak: 0`
   - `currentQuestionIndex: 0`
   - `status: 'in-progress'`
4. Establece `currentQuestion` = primera pregunta

#### `answerQuestion(answer, timeSpent)`

**Llamado desde**: `game.tsx` (handleAnswer)

**Parámetros**:
- `answer`: Respuesta seleccionada (string)
- `timeSpent`: Milisegundos desde inicio de pregunta

**Acción**:
1. Valida si la respuesta es correcta
2. Calcula puntos (base + bonus si timed)
3. Actualiza vidas y racha
4. Crea `UserAnswer` object
5. Llama a `saveUserAnswer()` en Firestore
6. Actualiza `session.answers`
7. Si quedan preguntas: avanza a siguiente
8. Si no quedan preguntas o vidas = 0: marca `status: 'finished'`

#### `endGame()`

**Llamado desde**: `game.tsx` (handleGameEnd)

**Acción**:
1. Llama a `finishGame(sessionId)`:
   - Actualiza documento en Firestore
   - Marca `endedAt` timestamp
   - Calcula `finalScore`
2. Llama a `updateUserStats()`:
   - Actualiza `userStats` collection
   - Incrementa `totalGames`
   - Actualiza `totalScore`, `bestScore`
   - Calcula `averageAccuracy`
   - Actualiza estadísticas por categoría
   - Calcula nivel (`level = Math.floor(totalScore / 1000)`)
3. Limpia estado del contexto:
   - `session = null`
   - `currentQuestion = null`

---

## 🗂️ Estructura de Datos

### Session (GameContext)

```typescript
interface GameSession {
  id?: string;
  userId: string;
  mode: GameMode;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  lives: number;
  streak: number;
  answers: UserAnswer[];
  status: GameStatus;
  startedAt: Date;
  endedAt?: Date;
}
```

### Question

```typescript
interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  points: number;
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
}
```

### UserAnswer

```typescript
interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
  timestamp: Date;
}
```

---

## 🎨 Estilos y Colores

### Paleta de Colores (Colors)

```typescript
// Principales
primary: '#6366F1'      // Azul índigo
accent: '#FBBF24'       // Amarillo dorado
success: '#10B981'      // Verde
error: '#EF4444'        // Rojo

// Backgrounds
background: '#F3F4F6'
card: '#FFFFFF'

// Textos
text: '#111827'
textLight: '#6B7280'

// Bordes
border: '#E5E7EB'
```

### Categorías

| Categoría | Color |
|-----------|-------|
| Arte | `#E91E63` (Rosa) |
| Ciencia | `#2196F3` (Azul) |
| Deportes | `#FF9800` (Naranja) |
| Entretenimiento | `#9C27B0` (Púrpura) |
| Geografía | `#4CAF50` (Verde) |
| Historia | `#FF6B35` (Naranja rojizo) |

---

## 🔄 Flujo Completo de una Partida

```
1. Usuario en /(dashboard)/play
   ↓
2. Presiona "Modo Clásico"
   → router.push('/play/category-select?mode=classic')
   ↓
3. category-select.tsx renderiza
   - Recibe mode='classic' de params
   - Usuario selecciona: category='science', difficulty='hard'
   ↓
4. Presiona "¡Comenzar!"
   → router.push('/play/game?mode=classic&category=science&difficulty=hard')
   ↓
5. game.tsx renderiza
   - useEffect inicial llama startGame()
   - GameContext carga 10 preguntas de ciencia difícil
   - Crea sesión en Firestore
   ↓
6. Primera pregunta se muestra
   - 4 respuestas mezcladas
   - Usuario tiene tiempo ilimitado (classic)
   ↓
7. Usuario selecciona respuesta
   - handleAnswer() se ejecuta
   - Feedback visual (verde/rojo) 1.5s
   - answerQuestion() procesa
   - Actualiza puntos, vidas, racha
   - Guarda en Firestore
   ↓
8. Se repite para 10 preguntas
   ↓
9. Última pregunta respondida
   - session.status = 'finished'
   - useEffect detecta fin
   - handleGameEnd() muestra Alert
   ↓
10. Usuario elige opción
    A) "Ver Resultados"
       → endGame() + router.replace('/(dashboard)/ranking')
    B) "Jugar de Nuevo"
       → endGame() + router.back() (a category-select)
```

---

## 🚀 Próximas Mejoras Sugeridas

### Funcionalidades

- [ ] **Pantalla de resultados detallada** con gráficos
- [ ] **Modo práctica** (sin guardar estadísticas)
- [ ] **Power-ups** (50/50, tiempo extra, eliminar respuesta)
- [ ] **Desafíos diarios** con recompensas
- [ ] **Logros y badges** (racha de 10, perfecto en difícil, etc.)
- [ ] **Compartir resultados** en redes sociales
- [ ] **Música y efectos de sonido**
- [ ] **Modo oscuro**

### Optimizaciones

- [ ] **Precarga de preguntas** para siguiente pregunta
- [ ] **Caché de preguntas** para modo offline
- [ ] **Animaciones optimizadas** con LayoutAnimation
- [ ] **Manejo de errores mejorado** con retry
- [ ] **Analytics** para tracking de uso

### Multiplayer (Futuro)

- [ ] Matchmaking
- [ ] Sala de espera
- [ ] Sincronización en tiempo real (Firebase Realtime DB)
- [ ] Chat entre jugadores
- [ ] Sistema de ranking por partida

---

## 📝 Notas de Implementación

### Manejo de Estado

El sistema usa **React Context** para estado global del juego en lugar de Redux por simplicidad. GameContext es suficiente ya que:
- Solo se necesita en pantallas de juego
- No hay muchas actualizaciones concurrentes
- Lógica de negocio está en servicios

### Firestore Collections

```
/questions/{questionId}
  - category, difficulty, question, answers...

/games/{gameId}
  - userId, mode, category, difficulty
  - startedAt, endedAt
  - answers: [{ questionId, selectedAnswer, isCorrect, timeSpent }]

/userStats/{userId}
  - totalGames, totalScore, bestScore
  - averageAccuracy, level
  - categoryStats: { [category]: { played, won, accuracy } }
```

### Seguridad

- Las reglas de Firestore deben validar:
  - Usuario autenticado para crear sesiones
  - Solo puede modificar sus propias estadísticas
  - Preguntas públicas legibles por todos
  - Preguntas privadas solo por creador

### Performance

- Límite de 10 preguntas por sesión para mantener sesiones cortas
- Índices en Firestore para `category`, `difficulty`, `isPublic`
- Lazy loading de imágenes si se agregan en futuro

---

## 🧪 Testing Recomendado

### Casos de Prueba

1. **Inicio de juego**
   - [ ] Con preguntas disponibles
   - [ ] Sin preguntas (error handling)
   - [ ] Sin conexión a internet

2. **Respuestas**
   - [ ] Respuesta correcta aumenta puntos y vidas
   - [ ] Respuesta incorrecta disminuye vidas
   - [ ] Racha se mantiene con correctas consecutivas
   - [ ] Racha se resetea con incorrecta

3. **Timer (Contrarreloj)**
   - [ ] Cuenta regresiva funciona
   - [ ] Tiempo agotado = respuesta incorrecta
   - [ ] Timer se detiene al responder
   - [ ] Timer urgente (<10s) cambia color

4. **Fin de juego**
   - [ ] Modo clásico: termina al perder vidas
   - [ ] Ambos modos: termina al completar 10 preguntas
   - [ ] Estadísticas se guardan correctamente
   - [ ] Navegación funciona en ambas opciones

5. **Edge Cases**
   - [ ] Usuario sale de app durante juego
   - [ ] Pierde conexión durante juego
   - [ ] Presiona back durante juego
   - [ ] Sesión expira

---

**Fecha de Creación**: 15 de octubre, 2025  
**Última Actualización**: 15 de octubre, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y Funcional
