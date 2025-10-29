# 📚 Documentación Completa - QuizGame

## 📖 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Sistema de Juego](#sistema-de-juego)
7. [Sistema de Preguntas](#sistema-de-preguntas)
8. [Sistema de Ranking](#sistema-de-ranking)
9. [Edición de Perfil](#edición-de-perfil)
10. [Navegación de la App](#navegación-de-la-app)
11. [Guía de Componentes](#guía-de-componentes)
12. [Firebase y Base de Datos](#firebase-y-base-de-datos)
13. [Almacenamiento Local](#almacenamiento-local)
14. [Flujos de Usuario](#flujos-de-usuario)
15. [Códigos de Error Comunes](#códigos-de-error-comunes)

---

## 🎯 Introducción

**QuizGame** es una aplicación móvil de preguntas y respuestas (trivia) desarrollada para Android. Los usuarios pueden:

- 🎮 Jugar en 3 modos diferentes (Clásico, Cronometrado, Mis Preguntas)
- ❓ Crear sus propias preguntas
- 🏆 Competir en un ranking global
- 👤 Personalizar su perfil
- 📊 Ver estadísticas detalladas de su progreso

### ¿Para quién es esta app?

- Usuarios que disfrutan de juegos de trivia
- Personas que quieren aprender mientras se divierten
- Competidores que buscan estar en el ranking
- Creadores de contenido que quieren compartir preguntas

---

## 🏗️ Arquitectura del Proyecto

### Patrón de Diseño: Context + Services

La app utiliza una arquitectura modular basada en:

```
┌─────────────────────────────────────────┐
│           Componentes UI                │
│     (Pantallas y Componentes)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Contexts (Estado Global)        │
│    • AuthContext (Usuario actual)       │
│    • GameContext (Estado del juego)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Services (Lógica)             │
│    • authService (Login/Registro)       │
│    • gameService (Lógica de juego)      │
│    • questionService (CRUD preguntas)   │
│    • rankingService (Sistema ranking)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Fuentes de Datos                │
│    • Firebase Auth (Usuarios)           │
│    • Firestore (Preguntas)              │
│    • AsyncStorage (Datos locales)       │
└─────────────────────────────────────────┘
```

**¿Qué significa esto?**

1. **Componentes UI**: Lo que el usuario ve (botones, textos, imágenes)
2. **Contexts**: Guardan información que toda la app necesita saber
3. **Services**: La lógica que hace que las cosas funcionen
4. **Fuentes de Datos**: Donde se guardan los datos (en la nube o en el dispositivo)

---

## 🛠️ Tecnologías Utilizadas

### Frontend (Lo que ves)

| Tecnología | Propósito | ¿Para qué sirve? |
|------------|-----------|------------------|
| **React Native** | Framework móvil | Crear apps móviles con JavaScript/TypeScript |
| **Expo** | Herramienta de desarrollo | Facilita crear y probar la app |
| **TypeScript** | Lenguaje de programación | JavaScript con tipos (más seguro) |
| **Expo Router** | Navegación | Permite ir de una pantalla a otra |

### Backend (Lo invisible)

| Tecnología | Propósito | ¿Para qué sirve? |
|------------|-----------|------------------|
| **Firebase Auth** | Autenticación | Gestiona usuarios, login, registro |
| **Firestore** | Base de datos | Guarda preguntas en la nube |
| **AsyncStorage** | Almacenamiento local | Guarda datos en el dispositivo |

### Librerías Adicionales

| Librería | ¿Para qué? |
|----------|------------|
| `expo-image-picker` | Seleccionar fotos de galería |
| `react-native-animatable` | Animaciones suaves |
| `@react-native-async-storage/async-storage` | Guardar datos localmente |
| `@react-native-firebase/auth` | Conexión con Firebase |

---

## 📁 Estructura de Carpetas

```
quizgame/
├── app/                          # Pantallas de la aplicación
│   ├── _layout.tsx              # Layout raíz (envuelve toda la app)
│   ├── index.tsx                # Pantalla inicial (redirige a welcome o dashboard)
│   ├── auth/                    # Pantallas de autenticación
│   │   ├── welcome.tsx          # Bienvenida
│   │   ├── login.tsx            # Iniciar sesión
│   │   └── register.tsx         # Registro
│   ├── (dashboard)/             # Pantallas principales (requiere login)
│   │   ├── _layout.tsx          # Layout con tab bar (navegación inferior)
│   │   ├── index.tsx            # Dashboard (estadísticas)
│   │   ├── play.tsx             # Selección de modo de juego
│   │   ├── create-question.tsx  # Crear preguntas
│   │   ├── ranking.tsx          # Ranking global
│   │   ├── profile.tsx          # Perfil del usuario
│   │   └── edit-profile.tsx     # Editar perfil
│   └── play/                    # Pantallas del juego
│       ├── category-select.tsx  # Selección de categoría
│       └── game.tsx             # Pantalla de juego
├── components/                   # Componentes reutilizables
│   ├── auth/                    # Componentes de autenticación
│   │   ├── AuthButton.tsx       # Botón estilizado
│   │   └── AuthInput.tsx        # Input de formulario
│   ├── modals/                  # Modales (ventanas emergentes)
│   │   ├── GameResultsModal.tsx # Modal de resultados
│   │   └── SuccessModal.tsx     # Modal de éxito
│   └── ui/                      # Componentes de interfaz
├── contexts/                     # Estado global de la app
│   ├── auth/
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   └── game/
│       └── GameContext.tsx      # Contexto del juego
├── services/                     # Lógica de negocio
│   ├── auth/
│   │   └── authService.ts       # Servicios de autenticación
│   ├── game/
│   │   └── gameService.ts       # Servicios del juego
│   ├── questions/
│   │   └── questionService.ts   # CRUD de preguntas
│   └── ranking/
│       └── rankingService.ts    # Sistema de ranking
├── types/                        # Definiciones de tipos TypeScript
│   ├── auth/
│   │   └── auth.types.ts        # Tipos de autenticación
│   └── game/
│       └── game.types.ts        # Tipos del juego
├── styles/                       # Estilos globales
│   └── colors.ts                # Paleta de colores
├── config/                       # Configuración
│   └── firebase.ts              # Configuración de Firebase
└── docs/                         # Documentación
    └── DOCUMENTACION_COMPLETA.md # Este archivo
```

### ¿Qué hace cada carpeta?

- **app/**: Todas las pantallas que el usuario ve
- **components/**: Piezas de interfaz reutilizables (como LEGO)
- **contexts/**: Información compartida entre pantallas
- **services/**: Código que hace las operaciones (login, guardar, etc.)
- **types/**: Definiciones de cómo deben ser los datos
- **config/**: Configuración inicial de servicios externos

---

## 🔐 Sistema de Autenticación

### ¿Cómo funciona el login?

#### 1. **AuthContext** (`contexts/auth/AuthContext.tsx`)

Este es el "cerebro" de la autenticación. Guarda:
- ¿Quién está conectado?
- ¿Está autenticado?
- ¿Está cargando?

```typescript
// Estado que guarda
{
  user: {
    id: "abc123",
    email: "usuario@email.com",
    username: "JuanPerez",
    photoURL: "https://foto.jpg"
  },
  isAuthenticated: true,
  isLoading: false
}
```

#### 2. **authService** (`services/auth/authService.ts`)

Funciones principales:

##### **Registro de usuario**
```typescript
registerWithEmail({ username, email, password })
```

**Proceso paso a paso:**
1. Usuario llena formulario de registro
2. Se valida que el email sea válido
3. Se verifica que las contraseñas coincidan
4. Se crea cuenta en Firebase Auth
5. Se guarda el username como `displayName`
6. Se guarda información en AsyncStorage local
7. Usuario queda autenticado automáticamente

##### **Inicio de sesión**
```typescript
loginWithEmail({ email, password })
```

**Proceso:**
1. Usuario ingresa email y contraseña
2. Firebase verifica las credenciales
3. Si son correctas, devuelve el usuario
4. Se guarda sesión en AsyncStorage
5. Usuario accede al dashboard

##### **Cerrar sesión**
```typescript
logout()
```

**Proceso:**
1. Usuario toca "Cerrar Sesión"
2. Se borra información de AsyncStorage
3. Se cierra sesión en Firebase
4. Usuario vuelve a pantalla de bienvenida

#### 3. **Persistencia de Sesión**

La app recuerda tu sesión incluso si cierras la app:

```typescript
// En AuthContext
useEffect(() => {
  const unsubscribe = onAuthStateChanged((user) => {
    if (user) {
      // Usuario autenticado
      setAuthState({ user, isAuthenticated: true })
    } else {
      // No hay usuario
      setAuthState({ user: null, isAuthenticated: false })
    }
  });
}, []);
```

**¿Qué significa?**
- Firebase escucha constantemente si hay un usuario conectado
- Si detecta un usuario, la app se lo muestra
- Si no hay usuario, muestra la pantalla de login

---

## 🎮 Sistema de Juego

### Modos de Juego

#### 1. **Modo Clásico**
- Sin límite de tiempo
- 10 preguntas aleatorias
- Puntos: +10 por respuesta correcta

#### 2. **Modo Cronometrado (Timed)**
- 15 segundos por pregunta
- 10 preguntas aleatorias
- Puntos: +10 base + bonus por velocidad
- **Bonus de velocidad**: 
  - Responder en 5 segundos = +5 puntos
  - Responder en 10 segundos = +3 puntos
  - Responder en 15 segundos = +1 punto

#### 3. **Mis Preguntas**
- Solo preguntas creadas por el usuario
- Sin límite de tiempo
- Mismo sistema de puntos que Clásico

### GameContext (`contexts/game/GameContext.tsx`)

Gestiona todo el estado del juego:

```typescript
// Estado del juego
{
  session: {
    questions: [...],        // Preguntas del juego
    currentQuestionIndex: 0, // Pregunta actual (0-9)
    score: 0,               // Puntos acumulados
    correctAnswers: 0,      // Respuestas correctas
    incorrectAnswers: 0,    // Respuestas incorrectas
    startedAt: Date,        // Cuándo empezó
    mode: 'classic',        // Modo de juego
    status: 'playing'       // Estado (playing/finished)
  }
}
```

### Flujo de una partida

```
1. Usuario selecciona modo
   ↓
2. Se cargan 10 preguntas aleatorias
   ↓
3. Se inicia el juego (startGame)
   ↓
4. Usuario responde pregunta
   ↓
5. Se verifica respuesta (answerQuestion)
   ↓
6. Se actualiza score y estadísticas
   ↓
7. Se pasa a siguiente pregunta
   ↓
8. Repite pasos 4-7 hasta 10 preguntas
   ↓
9. Se muestra modal de resultados
   ↓
10. Se guarda estadística del usuario
    ↓
11. Se actualiza ranking global
```

### Cálculo de Puntos

```typescript
// Modo Clásico y Mis Preguntas
if (isCorrect) {
  score += 10;
}

// Modo Cronometrado
if (isCorrect) {
  let points = 10;
  
  // Bonus por velocidad
  if (timeElapsed < 5) {
    points += 5;  // Total: 15 puntos
  } else if (timeElapsed < 10) {
    points += 3;  // Total: 13 puntos
  } else if (timeElapsed < 15) {
    points += 1;  // Total: 11 puntos
  }
  
  score += points;
}
```

---

## ❓ Sistema de Preguntas

### Estructura de una Pregunta

```typescript
{
  id: "pregunta_001",
  question: "¿Cuál es la capital de Francia?",
  correctAnswer: "París",
  incorrectAnswers: ["Londres", "Madrid", "Roma"],
  options: ["París", "Londres", "Madrid", "Roma"], // Mezcladas aleatoriamente
  category: "Geografía",
  difficulty: "easy",
  isPublic: true,
  createdBy: "user_123",
  createdAt: "2025-10-28T10:00:00Z"
}
```

### Categorías Disponibles

- 🌍 **Geografía**: Países, capitales, continentes
- 🔬 **Ciencia**: Biología, química, física
- 📚 **Historia**: Eventos, personajes históricos
- 🎬 **Entretenimiento**: Películas, música, series
- ⚽ **Deportes**: Fútbol, olimpiadas, deportistas
- 🎨 **Arte y Cultura**: Pintura, literatura, cultura general
- 💻 **Tecnología**: Programación, gadgets, innovación
- 🍕 **Gastronomía**: Comida, recetas, cocina

### Niveles de Dificultad

| Nivel | Descripción | Público Objetivo |
|-------|-------------|------------------|
| `easy` | Fácil | Principiantes |
| `medium` | Medio | Intermedios |
| `hard` | Difícil | Expertos |

### questionService (`services/questions/questionService.ts`)

#### Crear Pregunta

```typescript
createQuestion({
  question: "¿Qué es TypeScript?",
  correctAnswer: "Un superset de JavaScript",
  incorrectAnswers: ["Un framework", "Una base de datos", "Un sistema operativo"],
  category: "Tecnología",
  difficulty: "medium",
  isPublic: true
})
```

**Proceso interno:**
1. Valida que todos los campos estén completos
2. Mezcla `correctAnswer` + `incorrectAnswers` → crea `options`
3. Agrega `createdBy` (ID del usuario actual)
4. Agrega `createdAt` (timestamp actual)
5. Guarda en Firestore
6. Si falla, guarda offline en AsyncStorage

#### Obtener Preguntas

```typescript
// Preguntas públicas (para jugar)
getPublicQuestions()

// Preguntas del usuario (Mis Preguntas)
getUserQuestions(userId)

// Preguntas por categoría
getQuestionsByCategory(category)
```

### Reglas de Firestore

```javascript
// firestore.rules
allow read: if resource.data.isPublic == true; // Cualquiera lee públicas
allow read: if request.auth.uid == resource.data.createdBy; // Solo lee las suyas
allow create: if request.auth != null; // Solo usuarios autenticados crean
allow update: if request.auth.uid == resource.data.createdBy; // Solo modifica las suyas
allow delete: if request.auth.uid == resource.data.createdBy; // Solo elimina las suyas
```

**¿Qué significa?**
- Usuarios no autenticados solo leen preguntas públicas
- Usuarios autenticados pueden crear preguntas
- Solo puedes editar/eliminar tus propias preguntas
- Tus preguntas privadas solo las ves tú

---

## 🏆 Sistema de Ranking

### ¿Cómo funciona?

El ranking ordena a los jugadores por **puntos totales** acumulados.

### Estructura de Datos

```typescript
{
  userId: "user_123",
  username: "JuanPerez",
  totalPoints: 450,      // Suma de todos los puntos ganados
  totalWins: 12,         // Partidas ganadas (>60% aciertos)
  accuracy: 78.5,        // Precisión global (%)
  level: 5,              // Nivel calculado (totalPoints / 100)
  maxStreak: 7,          // Mejor racha de respuestas correctas
  updatedAt: Date
}
```

### rankingService (`services/ranking/rankingService.ts`)

#### Actualizar Ranking

```typescript
updatePlayerRanking(userId, username, totalPoints, totalWins, accuracy, level, maxStreak)
```

**Cuándo se actualiza:**
- Después de cada partida completada
- Se llama automáticamente desde `gameService.finishGame()`

**Proceso:**
1. Lee ranking actual de AsyncStorage
2. Busca si el jugador ya existe
3. Si existe, actualiza sus datos
4. Si no existe, lo agrega
5. Ordena por `totalPoints` (mayor a menor)
6. Guarda en AsyncStorage

#### Obtener Top Jugadores

```typescript
getTopPlayers(10) // Top 10 mejores jugadores
```

Retorna:
```typescript
[
  { userId: "1", username: "Campeón", totalPoints: 950, position: 1 },
  { userId: "2", username: "SubCampeón", totalPoints: 820, position: 2 },
  ...
]
```

#### Obtener Posición del Jugador

```typescript
getPlayerPosition(userId) // Retorna: 15 (está en el puesto 15)
```

### Pantalla de Ranking (`app/(dashboard)/ranking.tsx`)

Características:
- 🏅 **Podio visual** para top 3 (1°🥇, 2°🥈, 3°🥉)
- 📊 **Lista completa** del top 10
- 🔵 **Destacado** del usuario actual
- 📍 **Tu posición** si estás fuera del top 10
- 🔄 **Actualización automática** con `useFocusEffect`

---

## 👤 Edición de Perfil

### Pantalla: `edit-profile.tsx`

Permite modificar:
1. 📸 **Foto de perfil** (desde galería)
2. 👤 **Nombre de usuario**
3. 📧 **Email**
4. 🔐 **Contraseña**

### Funcionalidades Detalladas

#### 1. Cambiar Foto de Perfil

**Flujo:**
```
1. Usuario toca botón de cámara
   ↓
2. Se solicitan permisos de galería
   ↓
3. Se abre selector de imágenes nativo
   ↓
4. Usuario selecciona foto
   ↓
5. Se permite recortar en 1:1 (cuadrado)
   ↓
6. Se actualiza preview local
   ↓
7. Al guardar, se envía a Firebase Auth
```

**Código:**
```typescript
const pickImage = async () => {
  // Solicitar permisos
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;
  
  // Abrir galería
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],  // Cuadrado
    quality: 0.8      // 80% calidad
  });
  
  if (!result.canceled) {
    setPhotoURL(result.assets[0].uri);
  }
};
```

#### 2. Cambiar Nombre de Usuario

**Validaciones:**
- ✅ No puede estar vacío
- ✅ Mínimo 3 caracteres

**Guardado:**
```typescript
await updateProfile(auth.currentUser, {
  displayName: username
});
```

#### 3. Cambiar Email

**⚠️ Requiere reautenticación por seguridad**

**Validaciones:**
- ✅ Formato de email válido
- ✅ No puede estar vacío
- ✅ Debe ingresar contraseña actual

**Proceso:**
```typescript
// 1. Reautenticar
const credential = EmailAuthProvider.credential(email, currentPassword);
await reauthenticateWithCredential(auth.currentUser, credential);

// 2. Actualizar email
await updateEmail(auth.currentUser, newEmail);
```

**Errores posibles:**
- `auth/wrong-password` → Contraseña incorrecta
- `auth/email-already-in-use` → Email ya registrado
- `auth/requires-recent-login` → Necesita volver a iniciar sesión

#### 4. Cambiar Contraseña

**⚠️ Requiere reautenticación obligatoria**

**Validaciones:**
- ✅ Contraseña actual requerida
- ✅ Nueva contraseña mínimo 6 caracteres
- ✅ Confirmación debe coincidir

**Proceso:**
```typescript
// 1. Reautenticar con contraseña actual
const credential = EmailAuthProvider.credential(email, currentPassword);
await reauthenticateWithCredential(auth.currentUser, credential);

// 2. Actualizar contraseña
await updatePassword(auth.currentUser, newPassword);

// 3. Limpiar campos
setCurrentPassword('');
setNewPassword('');
setConfirmPassword('');
```

#### 5. Toggle Mostrar/Ocultar Contraseñas

Cada campo de contraseña tiene un botón de ojo:

```typescript
// Estados
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Input
<TextInput
  secureTextEntry={!showCurrentPassword}  // Si false, muestra
  ...
/>

// Botón
<TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
  <Ionicons 
    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
  />
</TouchableOpacity>
```

**Comportamiento:**
- 👁️ **Ojo abierto** (`eye-outline`) → Contraseña visible
- 👁️‍🗨️ **Ojo cerrado** (`eye-off-outline`) → Contraseña oculta

### Persistencia de Datos

Todos los cambios se guardan en **2 lugares**:

#### 1. Firebase Auth (Principal)
```typescript
await updateProfile(auth.currentUser, {
  displayName: username,
  photoURL: photoURL
});
```

#### 2. AsyncStorage (Copia local)
```typescript
const userData = {
  id: user.id,
  email: email,
  username: username,
  photoURL: photoURL
};
await AsyncStorage.setItem('@quizgame_user', JSON.stringify(userData));
```

**¿Por qué 2 lugares?**
- **Firebase Auth**: Es la fuente de verdad, persiste en la nube
- **AsyncStorage**: Permite acceso rápido offline

---

## 🧭 Navegación de la App

### Estructura de Navegación

```
┌─────────────────────────────────────┐
│         App Root Layout             │
│         (_layout.tsx)               │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐
│    Auth    │  │  Dashboard │
│  (Público) │  │  (Privado) │
└────────────┘  └────────────┘
│               │
├─ welcome     ├─ index (Stats)
├─ login       ├─ play
└─ register    ├─ create-question
               ├─ ranking
               ├─ profile
               │  └─ edit-profile
               └─ play/
                  ├─ category-select
                  └─ game
```

### Tab Bar (Navegación Inferior)

5 pestañas principales:

| Icono | Nombre | Ruta | Descripción |
|-------|--------|------|-------------|
| 🏠 | Inicio | `/` | Dashboard con estadísticas |
| 🎮 | Jugar | `/play` | Selección de modo |
| ➕ | Crear | `/create-question` | Crear pregunta (botón flotante) |
| 🏆 | Ranking | `/ranking` | Clasificación global |
| 👤 | Perfil | `/profile` | Perfil del usuario |

### Rutas Ocultas del Tab Bar

Estas pantallas existen pero no aparecen en el menú:

```typescript
<Tabs.Screen
  name="edit-profile"
  options={{
    href: null,  // ← Oculta del tab bar
    title: 'Editar Perfil'
  }}
/>
```

**¿Por qué?**
Se acceden desde navegación interna (ej: Perfil → Editar Perfil)

### Protección de Rutas

```typescript
// En app/index.tsx
if (!isAuthenticated) {
  return <Redirect href="/auth/welcome" />;
}
return <Redirect href="/(dashboard)" />;
```

**Lógica:**
- Si NO está autenticado → Welcome
- Si está autenticado → Dashboard

---

## 🧩 Guía de Componentes

### Componentes de Autenticación

#### AuthButton (`components/auth/AuthButton.tsx`)

Botón estilizado para login/registro.

**Props:**
```typescript
{
  title: string;          // Texto del botón
  onPress: () => void;   // Función al presionar
  variant?: 'primary' | 'secondary'; // Estilo
  loading?: boolean;     // Muestra spinner
  disabled?: boolean;    // Deshabilitado
}
```

**Uso:**
```typescript
<AuthButton
  title="Iniciar Sesión"
  onPress={handleLogin}
  loading={isLoading}
  variant="primary"
/>
```

#### AuthInput (`components/auth/AuthInput.tsx`)

Input de formulario con icono.

**Props:**
```typescript
{
  icon: string;              // Nombre del icono (Ionicons)
  placeholder: string;       // Texto de ayuda
  value: string;            // Valor actual
  onChangeText: (text) => void;
  secureTextEntry?: boolean; // Para contraseñas
  keyboardType?: string;    // Tipo de teclado
}
```

### Modales

#### GameResultsModal (`components/modals/GameResultsModal.tsx`)

Modal que muestra resultados del juego.

**Props:**
```typescript
{
  visible: boolean;        // ¿Mostrar?
  score: number;          // Puntos obtenidos
  correctAnswers: number; // Respuestas correctas
  totalQuestions: number; // Total de preguntas
  accuracy: number;       // Precisión %
  maxStreak: number;      // Mejor racha
  onClose: () => void;    // Al cerrar
  onPlayAgain: () => void; // Jugar de nuevo
  onGoHome: () => void;   // Ir al inicio
}
```

**Animaciones:**
- `zoomIn`: Aparece con zoom
- `bounceIn`: Trofeo rebota
- `fadeIn`: Elementos aparecen gradualmente

**Colores según rendimiento:**
```typescript
const getScoreColor = (accuracy: number) => {
  if (accuracy >= 90) return Colors.success;  // Verde
  if (accuracy >= 70) return Colors.info;     // Azul
  if (accuracy >= 50) return Colors.warning;  // Naranja
  return Colors.error;                        // Rojo
};
```

---

## 🔥 Firebase y Base de Datos

### Configuración (`config/firebase.ts`)

```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Colecciones en Firestore

#### 1. **questions** (Preguntas)

```javascript
/questions/{questionId}
{
  question: string,
  correctAnswer: string,
  incorrectAnswers: string[],
  options: string[],        // Requerido por reglas
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  isPublic: boolean,
  createdBy: string,        // UID del usuario
  createdAt: timestamp
}
```

**Índices necesarios:**
- `isPublic` (ASC)
- `category` (ASC)
- `createdBy` (ASC)

#### 2. **userScores** (Puntuaciones - Opcional)

```javascript
/userScores/{scoreId}
{
  userId: string,
  gameMode: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  playedAt: timestamp
}
```

### Reglas de Seguridad

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /questions/{questionId} {
      // Lectura: Públicas o propias
      allow read: if resource.data.isPublic == true
                  || (request.auth != null && resource.data.createdBy == request.auth.uid);
      
      // Creación: Solo autenticados
      allow create: if request.auth != null
                    && request.resource.data.createdBy == request.auth.uid
                    && request.resource.data.keys().hasAll([
                         'question', 'options', 'correctAnswer', 
                         'category', 'difficulty', 'isPublic', 
                         'createdBy', 'createdAt'
                       ]);
      
      // Actualización/Eliminación: Solo el creador
      allow update, delete: if request.auth != null 
                            && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

**Explicación:**
- **read**: Puedes leer si es pública O si tú la creaste
- **create**: Solo usuarios autenticados, debe incluir todos los campos
- **update/delete**: Solo el creador puede modificar/eliminar

---

## 💾 Almacenamiento Local (AsyncStorage)

### Claves Utilizadas

| Clave | Contenido | Propósito |
|-------|-----------|-----------|
| `@quizgame_user` | Datos del usuario | Sesión persistente |
| `@quizgame_user_stats` | Estadísticas del usuario | Tracking de progreso |
| `@quizgame_ranking` | Ranking global | Cache del ranking |
| `@quizgame_user_offline_questions` | Preguntas sin conexión | Backup de preguntas |

### Estructura de Datos

#### @quizgame_user
```json
{
  "id": "user_123",
  "email": "usuario@email.com",
  "username": "JuanPerez",
  "photoURL": "https://...",
  "createdAt": "2025-10-28T..."
}
```

#### @quizgame_user_stats
```json
{
  "userId": "user_123",
  "totalGames": 25,
  "totalWins": 18,
  "totalPoints": 450,
  "correctAnswers": 180,
  "incorrectAnswers": 70,
  "accuracy": 72.0,
  "currentStreak": 3,
  "maxStreak": 7,
  "level": 4,
  "lastPlayed": "2025-10-28T..."
}
```

#### @quizgame_ranking
```json
[
  {
    "userId": "user_1",
    "username": "Campeón",
    "totalPoints": 950,
    "totalWins": 45,
    "accuracy": 85.5,
    "level": 9,
    "maxStreak": 12,
    "updatedAt": "2025-10-28T..."
  },
  ...
]
```

### Operaciones Comunes

```typescript
// Guardar
await AsyncStorage.setItem('@quizgame_user', JSON.stringify(user));

// Leer
const data = await AsyncStorage.getItem('@quizgame_user');
const user = data ? JSON.parse(data) : null;

// Eliminar
await AsyncStorage.removeItem('@quizgame_user');

// Limpiar todo
await AsyncStorage.clear();
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Primer Uso de la App

```
1. Usuario abre la app
   ↓
2. Ve pantalla Welcome
   ↓
3. Toca "Registrarse"
   ↓
4. Llena formulario (username, email, password)
   ↓
5. Sistema crea cuenta en Firebase
   ↓
6. Guarda datos en AsyncStorage
   ↓
7. Redirige a Dashboard
   ↓
8. Ve estadísticas en 0
```

### Flujo 2: Jugar una Partida

```
1. Usuario en Dashboard
   ↓
2. Toca tab "Jugar"
   ↓
3. Selecciona modo (Clásico/Cronometrado/Mis Preguntas)
   ↓
4. Si es Clásico/Cronometrado → Selecciona categoría
   ↓
5. Sistema carga 10 preguntas
   ↓
6. Inicia juego
   ↓
7. Usuario responde 10 preguntas
   ↓
8. Sistema calcula puntos
   ↓
9. Muestra modal de resultados
   ↓
10. Actualiza estadísticas del usuario
    ↓
11. Actualiza ranking global
    ↓
12. Usuario puede:
    - Jugar de nuevo
    - Ver ranking
    - Volver al inicio
```

### Flujo 3: Crear una Pregunta

```
1. Usuario en tab "Crear"
   ↓
2. Llena formulario:
   - Pregunta
   - Respuesta correcta
   - 3 respuestas incorrectas
   - Categoría
   - Dificultad
   - Público/Privado
   ↓
3. Toca "Crear Pregunta"
   ↓
4. Sistema valida campos
   ↓
5. Si hay conexión:
   - Guarda en Firestore
   Caso contrario:
   - Guarda en AsyncStorage (offline)
   ↓
6. Muestra confirmación
   ↓
7. Limpia formulario
```

### Flujo 4: Editar Perfil

```
1. Usuario en tab "Perfil"
   ↓
2. Toca "Editar Perfil"
   ↓
3. Ve datos actuales pre-cargados
   ↓
4. Modifica lo que desea:
   - Foto (abre galería)
   - Nombre
   - Email (requiere contraseña)
   - Contraseña (requiere contraseña actual)
   ↓
5. Toca "Guardar Cambios"
   ↓
6. Si cambia email/password:
   - Sistema solicita reautenticación
   - Verifica contraseña actual
   ↓
7. Actualiza Firebase Auth
   ↓
8. Actualiza AsyncStorage
   ↓
9. Muestra mensaje de éxito
   ↓
10. Vuelve a pantalla de Perfil
```

---

## ⚠️ Códigos de Error Comunes

### Errores de Autenticación

| Código | Significado | Solución |
|--------|-------------|----------|
| `auth/invalid-email` | Email mal formateado | Verificar formato (ej: user@email.com) |
| `auth/user-not-found` | Usuario no existe | Verificar email o registrarse |
| `auth/wrong-password` | Contraseña incorrecta | Intentar de nuevo o recuperar contraseña |
| `auth/email-already-in-use` | Email ya registrado | Usar otro email o iniciar sesión |
| `auth/weak-password` | Contraseña débil | Usar mínimo 6 caracteres |
| `auth/requires-recent-login` | Sesión antigua | Cerrar sesión y volver a iniciar |
| `auth/too-many-requests` | Muchos intentos | Esperar unos minutos |

### Errores de Firestore

| Código | Significado | Solución |
|--------|-------------|----------|
| `permission-denied` | Sin permisos | Verificar reglas de seguridad |
| `not-found` | Documento no existe | Verificar ID del documento |
| `already-exists` | Documento ya existe | Usar otro ID o actualizar |
| `failed-precondition` | Índice faltante | Crear índice en Firebase Console |
| `unavailable` | Servicio no disponible | Verificar conexión a internet |

### Errores de la App

| Error | Causa | Solución |
|-------|-------|----------|
| "No hay preguntas disponibles" | No hay preguntas en Firestore | Crear preguntas primero |
| "Modo no disponible" | Menos de 10 preguntas | Crear más preguntas |
| "Error cargando imagen" | Permisos denegados | Habilitar permisos de galería |
| "Sesión expirada" | Token de Firebase expiró | Volver a iniciar sesión |

---

## 🎨 Paleta de Colores

```typescript
// styles/colors.ts
export const Colors = {
  // Principales
  primary: '#6366F1',      // Morado/Azul (botones principales)
  secondary: '#EC4899',    // Rosa (acentos)
  accent: '#FBBF24',       // Amarillo (destacados)
  
  // Estados
  success: '#10B981',      // Verde (éxito)
  error: '#EF4444',        // Rojo (error)
  warning: '#F59E0B',      // Naranja (advertencia)
  info: '#3B82F6',         // Azul (información)
  
  // Textos
  text: '#1F2937',         // Gris oscuro
  textLight: '#6B7280',    // Gris medio
  
  // Fondos
  background: '#F9FAFB',   // Gris muy claro
  card: '#FFFFFF',         // Blanco
  border: '#E5E7EB',       // Gris claro
};
```

---

## 📊 Estadísticas y Niveles

### Cálculo de Nivel

```typescript
const level = Math.floor(totalPoints / 100);
```

**Ejemplos:**
- 0-99 puntos → Nivel 0
- 100-199 puntos → Nivel 1
- 500-599 puntos → Nivel 5
- 1000+ puntos → Nivel 10+

### Cálculo de Precisión (Accuracy)

```typescript
const accuracy = (correctAnswers / totalAnswered) * 100;
```

**Ejemplo:**
- 180 correctas de 250 totales = 72%

### Cálculo de Victoria

Una partida se considera victoria si:
```typescript
const isWin = accuracy >= 60; // 60% o más de aciertos
```

---

## 🔧 Configuración del Proyecto

### Archivo `app.json`

```json
{
  "expo": {
    "name": "quizgame",
    "slug": "quizgame",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "android": {
      "package": "com.jaramc.quizgame",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundColor": "#E6F4FE"
      }
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### Scripts de Desarrollo

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "prebuild": "expo prebuild --clean",
    "build:android": "expo run:android"
  }
}
```

---

## 🚀 Compilación y Despliegue

### Desarrollo

```bash
# Iniciar en modo desarrollo
npx expo start

# Abrir en Android
npx expo start --android

# Limpiar caché
npx expo start --clear
```

### Producción

```bash
# 1. Regenerar archivos nativos
npx expo prebuild --clean

# 2. Compilar para Android
npx expo run:android

# O usar script personalizado
./run-android.ps1
```

### Requisitos

- Node.js 18+
- npm o yarn
- Android Studio (para emulador)
- Expo CLI
- Cuenta de Firebase

---

## 📝 Buenas Prácticas

### 1. Tipos TypeScript

Siempre define tipos para:
- Props de componentes
- Respuestas de servicios
- Estados complejos

```typescript
// ✅ Bueno
interface User {
  id: string;
  email: string;
  username: string;
}

// ❌ Malo
const user: any = {...};
```

### 2. Manejo de Errores

Siempre usa try-catch:

```typescript
// ✅ Bueno
try {
  await saveData();
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'No se pudo guardar');
}

// ❌ Malo
await saveData(); // Sin manejo
```

### 3. Validación de Formularios

Valida antes de enviar:

```typescript
// ✅ Bueno
if (!email || !password) {
  Alert.alert('Error', 'Completa todos los campos');
  return;
}

// ❌ Malo
await login(email, password); // Sin validar
```

### 4. Limpieza de Recursos

Usa cleanup en useEffect:

```typescript
// ✅ Bueno
useEffect(() => {
  const subscription = listen();
  return () => subscription.unsubscribe();
}, []);
```

---

## 🆘 Solución de Problemas

### La app no compila

**Soluciones:**
1. Limpiar caché: `npx expo start --clear`
2. Reinstalar dependencias: `rm -rf node_modules && npm install`
3. Regenerar nativos: `npx expo prebuild --clean`

### Firebase no conecta

**Verificar:**
1. Configuración en `config/firebase.ts`
2. Archivo `google-services.json` en `android/app/`
3. Reglas de Firestore

### AsyncStorage no guarda

**Verificar:**
1. Permisos de la app
2. Espacio en dispositivo
3. Formato JSON correcto: `JSON.stringify(data)`

### Imágenes no cargan

**Verificar:**
1. Permisos de galería habilitados
2. URL de imagen válida
3. Conexión a internet (para URLs externas)

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Firebase](https://firebase.google.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Comunidad

- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Expo Forums](https://forums.expo.dev/)
- [Firebase Community](https://firebase.google.com/support)

---

## 📄 Licencia y Créditos

**Desarrollado por:** Jaramc  
**Versión:** 1.0.0  
**Fecha:** Octubre 2025

---

## 📞 Soporte

¿Tienes preguntas? Contacta al equipo de desarrollo.

---

**¡Gracias por usar QuizGame! 🎮**
