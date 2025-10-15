# Modo Local - Sistema de Almacenamiento

## 📋 Descripción

El sistema QuizGame ahora funciona completamente en **modo local**, utilizando **AsyncStorage** para persistencia de datos en lugar de Firebase Firestore. Esto permite:

- ✅ Desarrollo más rápido sin dependencias cloud
- ✅ Funcionamiento sin conexión a internet
- ✅ Testing local sin costos de Firebase
- ✅ Datos del usuario guardados localmente en el dispositivo

---

## 🗂️ Arquitectura de Almacenamiento

### AsyncStorage Keys

| Key | Descripción | Contenido |
|-----|-------------|-----------|
| `@quizgame_user_questions_{userId}` | Preguntas creadas por el usuario | Array de `Question[]` |
| `@quizgame_game_sessions_{sessionId}` | Sesiones de juego activas/completadas | `GameSession` |
| `@quizgame_user_stats_{userId}` | Estadísticas acumuladas del usuario | `UserStats` |

---

## 🎮 Servicios Modificados

### 1. Question Service (`services/questions/questionService.ts`)

#### Funciones en Modo Local:

**`createQuestion(questionData, userId)`**
- ✅ Genera ID único: `user-{timestamp}-{random}`
- ✅ Guarda en AsyncStorage bajo `@quizgame_user_questions_{userId}`
- ✅ Agrega a array existente de preguntas

**`getUserQuestions(userId)`**
- ✅ Lee preguntas del usuario desde AsyncStorage
- ✅ Convierte fechas de string a Date

**`getQuestionsForGame(category, difficulty, count, userId)`**
- ⚠️ **USA SOLO PREGUNTAS LOCALES** (data/localQuestions.ts)
- ✅ No consulta Firestore
- ✅ Retorna 10 preguntas filtradas y mezcladas

**`updateQuestion(questionId, updates, userId)`**
- ✅ Encuentra pregunta por ID en array local
- ✅ Actualiza propiedades
- ✅ Guarda array completo actualizado

**`deleteQuestion(questionId, userId)`**
- ✅ Filtra pregunta del array
- ✅ Guarda array sin la pregunta eliminada

---

### 2. Game Service (`services/game/gameService.ts`)

#### Funciones en Modo Local:

**`createGameSession(userId, mode, questions, category, difficulty)`**
- ✅ Genera session ID: `session-{timestamp}-{random}`
- ✅ Crea objeto `GameSession` completo
- ✅ Guarda en AsyncStorage con key de sesión

**`getLocalSession(sessionId)` (privada)**
- ✅ Lee sesión desde AsyncStorage
- ✅ Convierte timestamps a Date

**`saveLocalSession(session)` (privada)**
- ✅ Serializa y guarda sesión actualizada

**`saveUserAnswer(gameId, answer, newScore, newStreak, maxStreak)`**
- ✅ Carga sesión actual
- ✅ Agrega respuesta al array
- ✅ Actualiza puntuación, racha, índice
- ✅ Guarda sesión modificada

**`finishGame(gameId)`**
- ✅ Carga sesión
- ✅ Calcula estadísticas finales
- ✅ Marca sesión como 'finished'
- ✅ Actualiza estadísticas del usuario
- ✅ Retorna `GameResult`

**`getUserStats(userId)`**
- ✅ Lee stats desde AsyncStorage
- ✅ Retorna stats vacías si no existen (usuario nuevo)
- ✅ Nunca retorna `null`, siempre un objeto válido

**`updateUserStats(result)` (privada)**
- ✅ Obtiene stats actuales
- ✅ Calcula nuevos totales (partidas, victorias, puntos)
- ✅ Actualiza precisión global
- ✅ Actualiza racha actual y máxima
- ✅ Actualiza estadísticas por categoría
- ✅ Calcula nuevo nivel (1000 pts = 1 nivel)
- ✅ Guarda en AsyncStorage

---

## 📊 Flujo de Datos

### Crear Pregunta

```
Usuario completa formulario
    ↓
createQuestion(questionData, userId)
    ↓
Genera ID único
    ↓
Crea objeto Question completo
    ↓
Lee array existente: getUserQuestionsLocal(userId)
    ↓
Agrega nueva pregunta al array
    ↓
AsyncStorage.setItem('@quizgame_user_questions_{userId}', JSON.stringify(array))
    ↓
✅ Pregunta guardada localmente
```

### Iniciar Juego

```
Usuario selecciona modo + categoría + dificultad
    ↓
getQuestionsForGame(category, difficulty, 10)
    ↓
getLocalQuestions(category, difficulty, 10)
    ↓
Filtra preguntas por categoría/dificultad
    ↓
Mezcla aleatoriamente
    ↓
Retorna 10 preguntas
    ↓
createGameSession(userId, mode, questions,...)
    ↓
Genera session ID
    ↓
Crea objeto GameSession
    ↓
AsyncStorage.setItem('@quizgame_game_sessions_{sessionId}', JSON.stringify(session))
    ↓
✅ Sesión creada - Juego comienza
```

### Durante el Juego

```
Usuario selecciona respuesta
    ↓
answerQuestion() en GameContext
    ↓
Valida respuesta
    ↓
Calcula puntos, vidas, racha
    ↓
Crea UserAnswer object
    ↓
saveUserAnswer(gameId, answer, newScore, newStreak, maxStreak)
    ↓
getLocalSession(gameId)
    ↓
session.answers.push(answer)
    ↓
session.score = newScore
    ↓
session.streak = newStreak
    ↓
session.currentQuestionIndex++
    ↓
saveLocalSession(session)
    ↓
✅ Respuesta guardada - Siguiente pregunta
```

### Finalizar Juego

```
Última pregunta respondida O vidas = 0
    ↓
endGame() en GameContext
    ↓
finishGame(sessionId)
    ↓
getLocalSession(sessionId)
    ↓
Calcula estadísticas finales:
  - Tiempo total
  - Respuestas correctas/incorrectas
  - Precisión
  - Tiempo promedio por pregunta
    ↓
session.status = 'finished'
    ↓
session.endTime = now
    ↓
saveLocalSession(session)
    ↓
updateUserStats(result)
    ↓
getUserStats(userId)
    ↓
Calcula nuevos totales
    ↓
Actualiza precisión, nivel, rachas, stats por categoría
    ↓
AsyncStorage.setItem('@quizgame_user_stats_{userId}', JSON.stringify(updatedStats))
    ↓
✅ Juego finalizado - Stats actualizadas
```

---

## 🔧 Estructura de Datos en AsyncStorage

### Preguntas del Usuario

**Key**: `@quizgame_user_questions_{userId}`

```json
[
  {
    "id": "user-1697312345678-a1b2c3",
    "category": "science",
    "difficulty": "medium",
    "type": "multiple-choice",
    "question": "¿Cuál es la velocidad de la luz?",
    "correctAnswer": "299,792 km/s",
    "incorrectAnswers": ["300,000 km/s", "280,000 km/s", "320,000 km/s"],
    "points": 20,
    "isPublic": false,
    "language": "es",
    "createdBy": "user123",
    "createdAt": "2025-10-15T10:30:00.000Z"
  }
]
```

### Sesión de Juego

**Key**: `@quizgame_game_sessions_{sessionId}`

```json
{
  "id": "session-1697312400000-d4e5f6",
  "userId": "user123",
  "mode": "classic",
  "category": "science",
  "difficulty": "medium",
  "questions": [...],
  "currentQuestionIndex": 5,
  "answers": [
    {
      "questionId": "local-science-medium-0",
      "selectedAnswer": "299,792 km/s",
      "correctAnswer": "299,792 km/s",
      "isCorrect": true,
      "timeSpent": 5230,
      "pointsEarned": 20,
      "timestamp": "2025-10-15T10:35:00.000Z"
    }
  ],
  "score": 120,
  "lives": 4,
  "streak": 3,
  "maxStreak": 5,
  "startTime": "2025-10-15T10:30:00.000Z",
  "endTime": null,
  "status": "playing"
}
```

### Estadísticas del Usuario

**Key**: `@quizgame_user_stats_{userId}`

```json
{
  "userId": "user123",
  "totalGames": 15,
  "totalWins": 10,
  "totalPoints": 2350,
  "currentStreak": 3,
  "maxStreak": 7,
  "accuracy": 73.5,
  "level": 3,
  "experiencePoints": 2350,
  "gamesPerCategory": {
    "science": 8,
    "art": 4,
    "history": 3
  },
  "winRatePerCategory": {
    "science": 75.2,
    "art": 68.5,
    "history": 80.0
  },
  "questionsCreated": 5,
  "updatedAt": "2025-10-15T11:00:00.000Z"
}
```

---

## ⚙️ Configuración

### Uso de Preguntas Locales

El sistema usa automáticamente las preguntas de `data/localQuestions.ts`. No se consulta Firestore.

```typescript
// En questionService.ts - getQuestionsForGame()
export const getQuestionsForGame = async (...) => {
  // 🎯 USAR SOLO PREGUNTAS LOCALES
  console.log('📚 Cargando preguntas locales...');
  const localQuestions = getLocalQuestions(category, difficulty, count);
  return localQuestions;
  
  // TODO: Firestore deshabilitado por ahora
};
```

### Migración Futura a Firestore

Cuando se quiera habilitar Firestore:

1. **En `questionService.ts`**:
   - Descomentar código de Firestore
   - Mantener `getLocalQuestions()` como fallback

2. **En `gameService.ts`**:
   - Cambiar funciones para usar Firestore
   - Mantener AsyncStorage como caché local

3. **Sincronización**:
   - Crear función `syncLocalToFirestore()`
   - Subir preguntas y stats locales a cloud

---

## 🚀 Ventajas del Modo Local

### Para Desarrollo

✅ **Sin dependencias cloud**: No necesita configurar Firebase  
✅ **Testing rápido**: Datos inmediatos sin latencia de red  
✅ **Debug fácil**: Inspeccionar AsyncStorage con herramientas  
✅ **Sin costos**: No consume cuota de Firestore  

### Para Usuarios

✅ **Funciona offline**: No requiere internet  
✅ **Rápido**: Sin latencia de red  
✅ **Privado**: Datos solo en dispositivo  
✅ **Confiable**: No depende de conexión  

---

## 🔍 Debugging

### Ver Datos en AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ver todas las keys
const keys = await AsyncStorage.getAllKeys();
console.log('Keys:', keys);

// Ver preguntas del usuario
const userQuestions = await AsyncStorage.getItem('@quizgame_user_questions_user123');
console.log('User Questions:', JSON.parse(userQuestions));

// Ver stats
const userStats = await AsyncStorage.getItem('@quizgame_user_stats_user123');
console.log('User Stats:', JSON.parse(userStats));

// Limpiar datos (desarrollo)
await AsyncStorage.clear();
```

### Logs del Sistema

El sistema imprime logs útiles:

```
📚 Cargando preguntas locales...
✅ Pregunta guardada localmente: user-1697312345678-a1b2c3
✅ Sesión de juego creada localmente: session-1697312400000-d4e5f6
✅ Respuesta guardada localmente
✅ Juego finalizado localmente
✅ Estadísticas actualizadas localmente
```

---

## 📦 Dependencias

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x"
}
```

Ya instalado ✅

---

## 🔄 Roadmap

### Fase 1: Modo Local (✅ Completado)
- [x] Preguntas locales (30+)
- [x] Crear/editar/eliminar preguntas (AsyncStorage)
- [x] Sesiones de juego locales
- [x] Estadísticas locales
- [x] Documentación

### Fase 2: Híbrido (Futuro)
- [ ] Mantener datos locales + Firestore
- [ ] Sincronización bidireccional
- [ ] Fallback automático a local sin internet
- [ ] Caché inteligente

### Fase 3: Cloud First (Futuro)
- [ ] Firestore como fuente principal
- [ ] AsyncStorage solo como caché
- [ ] Compartir preguntas entre usuarios
- [ ] Ranking global
- [ ] Multiplayer en tiempo real

---

## ⚠️ Limitaciones Actuales

1. **Sin sincronización**: Datos solo en este dispositivo
2. **Sin backup cloud**: Si desinstala app, pierde datos
3. **Sin ranking global**: Solo stats locales
4. **Sin compartir preguntas**: Preguntas creadas son privadas

---

## 💡 Recomendaciones

### Para Desarrollo
- Usa `AsyncStorage.clear()` para resetear durante testing
- Inspecciona datos con React Native Debugger
- Valida estructura de datos antes de guardar

### Para Producción
- Implementar migración a Firestore gradualmente
- Ofrecer export/import de datos del usuario
- Agregar confirmación antes de eliminar datos
- Implementar versionado de estructura de datos

---

**Creado**: 15 de octubre, 2025  
**Versión**: 1.0.0 - Modo Local  
**Estado**: ✅ Activo  
**Siguiente**: Implementar sincronización con Firestore
