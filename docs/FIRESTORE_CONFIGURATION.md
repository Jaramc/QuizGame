# 🔥 Configuración de Firebase Firestore

Esta guía te mostrará paso a paso cómo configurar Firebase Firestore para tu aplicación QuizGame.

## 📋 Prerequisitos

- Cuenta de Firebase (gratuita)
- Proyecto Firebase ya creado (ver `FIREBASE_SETUP.md`)
- `google-services.json` configurado en tu app Android

---

## 🚀 Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **QuizGame**
3. En el menú lateral izquierdo, haz clic en **"Firestore Database"**

![Firebase Console](https://imgur.com/placeholder.png)

---

## 📦 Paso 2: Crear Base de Datos Firestore

### 2.1. Iniciar Firestore

1. Haz clic en el botón **"Crear base de datos"** (Create database)
2. Te aparecerá un modal con dos opciones:

   **Opción A: Modo de Producción (Recomendado para desarrollo)**
   - Selecciona: **"Start in production mode"**
   - Las reglas serán restrictivas por defecto

   **Opción B: Modo de Prueba**
   - Selecciona: **"Start in test mode"**
   - Permite lectura/escritura libre por 30 días
   - ⚠️ **NO USAR EN PRODUCCIÓN**

3. Haz clic en **"Siguiente"** (Next)

### 2.2. Seleccionar Ubicación

1. Selecciona la ubicación del servidor:
   - Para América Latina: **`us-central1`** o **`southamerica-east1`** (São Paulo)
   - Para España: **`europe-west1`** (Bélgica)
   - Para USA: **`us-east1`** (South Carolina)

2. ⚠️ **IMPORTANTE**: La ubicación **NO SE PUEDE CAMBIAR** después

3. Haz clic en **"Habilitar"** (Enable)

4. Espera unos segundos mientras Firestore se inicializa...

✅ **¡Listo!** Ahora tienes tu base de datos Firestore activa.

---

## 🔐 Paso 3: Configurar Reglas de Seguridad

### 3.1. Acceder a las Reglas

1. En la consola de Firestore, haz clic en la pestaña **"Reglas"** (Rules)
2. Verás un editor de código con las reglas actuales

### 3.2. Reglas para QuizGame

Copia y pega estas reglas en el editor:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper: verificar si el usuario es el dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Reglas para la colección "questions"
    match /questions/{questionId} {
      // Cualquier usuario autenticado puede leer preguntas públicas
      allow read: if isAuthenticated() && 
                     resource.data.isPublic == true;
      
      // Los usuarios pueden leer sus propias preguntas (públicas o privadas)
      allow read: if isOwner(resource.data.createdBy);
      
      // Solo el creador puede crear preguntas
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.createdBy;
      
      // Solo el creador puede actualizar sus preguntas
      allow update: if isOwner(resource.data.createdBy);
      
      // Solo el creador puede eliminar sus preguntas
      allow delete: if isOwner(resource.data.createdBy);
    }
    
    // Reglas para la colección "game_sessions"
    match /game_sessions/{sessionId} {
      // Solo el dueño puede leer sus sesiones
      allow read: if isOwner(resource.data.userId);
      
      // Solo usuarios autenticados pueden crear sesiones
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.userId;
      
      // Solo el dueño puede actualizar su sesión
      allow update: if isOwner(resource.data.userId);
      
      // Solo el dueño puede eliminar su sesión
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Reglas para la colección "user_stats"
    match /user_stats/{userId} {
      // Solo el dueño puede leer sus estadísticas
      allow read: if isOwner(userId);
      
      // Solo el dueño puede crear/actualizar sus estadísticas
      allow write: if isOwner(userId);
    }
    
    // Reglas para ranking público (futuro)
    match /ranking/{userId} {
      // Todos pueden leer el ranking
      allow read: if isAuthenticated();
      
      // Solo el sistema puede escribir (usando Cloud Functions)
      allow write: if false;
    }
  }
}
```

### 3.3. Publicar las Reglas

1. Haz clic en el botón **"Publicar"** (Publish)
2. Confirma que quieres publicar los cambios

✅ **¡Reglas configuradas correctamente!**

---

## 📊 Paso 4: Crear Colecciones Iniciales

### 4.1. Colección "questions"

1. En la pestaña **"Datos"** (Data), haz clic en **"Iniciar colección"** (Start collection)
2. Nombre de la colección: `questions`
3. Haz clic en **"Siguiente"**

**Crear documento de ejemplo:**

- ID del documento: (dejar en auto-generado)
- Campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| `category` | string | `science` |
| `difficulty` | string | `medium` |
| `question` | string | `¿Cuál es la fórmula del agua?` |
| `options` | array | `["H2O", "CO2", "O2", "N2"]` |
| `correctAnswer` | number | `0` |
| `createdBy` | string | `system` |
| `createdAt` | timestamp | (usar timestamp actual) |
| `language` | string | `es` |
| `points` | number | `20` |
| `isPublic` | boolean | `true` |

4. Haz clic en **"Guardar"**

### 4.2. Índices Compuestos (Composite Indexes)

Para mejorar el rendimiento de las consultas, necesitamos crear índices:

1. Ve a la pestaña **"Índices"** (Indexes)
2. Haz clic en **"Agregar índice"** (Add index)

**Índice 1: Preguntas por categoría y dificultad**
- Colección: `questions`
- Campos:
  - `isPublic` (Ascending)
  - `category` (Ascending)
  - `difficulty` (Ascending)
  - `createdAt` (Descending)

**Índice 2: Preguntas del usuario**
- Colección: `questions`
- Campos:
  - `createdBy` (Ascending)
  - `createdAt` (Descending)

3. Haz clic en **"Crear"** para cada índice
4. Espera 2-5 minutos mientras se construyen los índices

---

## 🧪 Paso 5: Probar la Conexión

### 5.1. Verificar en la App

1. Abre tu app React Native
2. Ve a la pantalla "Crear Pregunta"
3. Crea una pregunta de prueba
4. Revisa los logs en la consola:

```
✅ Pregunta guardada en Firestore: abc123xyz
```

### 5.2. Verificar en Firebase Console

1. Ve a Firestore Database → Datos
2. Abre la colección `questions`
3. Deberías ver tu pregunta recién creada

### 5.3. Probar Modo Offline

1. Desactiva WiFi/Datos en tu dispositivo
2. Crea otra pregunta
3. Revisa los logs:

```
⚠️ Firestore no disponible, usando modo local
✅ Pregunta guardada localmente: local-1234567890
```

4. Reactiva la conexión
5. La próxima vez que uses la app, sincronizará automáticamente

---

## 🔍 Paso 6: Monitorear Uso

### 6.1. Dashboard de Uso

1. Ve a **Firestore Database → Uso** (Usage)
2. Aquí verás:
   - Lecturas de documentos
   - Escrituras de documentos
   - Eliminaciones de documentos
   - Almacenamiento usado

### 6.2. Límites del Plan Gratuito (Spark)

| Recurso | Límite Diario |
|---------|---------------|
| Lecturas | 50,000 |
| Escrituras | 20,000 |
| Eliminaciones | 20,000 |
| Almacenamiento | 1 GB |
| Transferencia de red | 10 GB/mes |

⚠️ Si superas estos límites, necesitarás actualizar al plan **Blaze** (pago por uso).

---

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"

**Causa:** Las reglas de seguridad están bloqueando la operación.

**Solución:**
1. Verifica que el usuario esté autenticado
2. Revisa las reglas en la sección "Reglas"
3. Asegúrate de que `createdBy` coincida con el `uid` del usuario

### Error: "Failed to get document because the client is offline"

**Causa:** No hay conexión a internet.

**Solución:**
- La app automáticamente usa AsyncStorage como fallback
- Las preguntas se sincronizarán cuando haya conexión

### Error: "The query requires an index"

**Causa:** Falta un índice compuesto para la consulta.

**Solución:**
1. Firebase te dará un enlace en el error
2. Haz clic en el enlace para crear el índice automáticamente
3. Espera 2-5 minutos a que se construya

### Las preguntas no aparecen en el juego

**Causa:** Las preguntas pueden estar marcadas como privadas.

**Solución:**
1. Ve a Firestore → `questions`
2. Verifica que `isPublic` sea `true`
3. O asegúrate de que `createdBy` sea el usuario actual

---

## 📱 Estructura de Datos en Firestore

### Colección: `questions`

```typescript
{
  id: "abc123xyz",              // Auto-generado por Firestore
  category: "science",          // art, science, sports, etc.
  difficulty: "medium",         // easy, medium, hard
  question: "¿Pregunta?",       // Texto de la pregunta
  options: [                    // Array de opciones
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ],
  correctAnswer: 0,             // Índice de la respuesta correcta (0-3)
  createdBy: "user123",         // UID del usuario creador
  createdAt: Timestamp,         // Fecha de creación
  language: "es",               // Idioma (español)
  points: 20,                   // Puntos (10, 20 o 30)
  isPublic: true                // ¿Visible para otros?
}
```

### Colección: `game_sessions` (futuro)

```typescript
{
  id: "session-xyz",
  userId: "user123",
  mode: "timed",
  category: "science",
  difficulty: "hard",
  questions: [...],             // Array de IDs de preguntas
  answers: [...],               // Array de respuestas
  score: 150,
  lives: 3,
  streak: 5,
  status: "in-progress",
  startedAt: Timestamp,
  finishedAt: Timestamp | null
}
```

### Colección: `user_stats` (futuro)

```typescript
{
  userId: "user123",            // ID = UID del usuario
  totalGames: 25,
  totalWins: 18,
  totalPoints: 3450,
  highestScore: 300,
  accuracy: 0.78,
  level: 5,
  categoryStats: {
    science: { played: 10, won: 7, points: 1200 },
    art: { played: 8, won: 6, points: 980 }
  },
  lastPlayed: Timestamp
}
```

---

## 🎯 Próximos Pasos

1. ✅ Firestore configurado y funcionando
2. ✅ Reglas de seguridad implementadas
3. ✅ Índices creados para mejor rendimiento
4. ⏳ Migrar sesiones de juego a Firestore
5. ⏳ Migrar estadísticas de usuario a Firestore
6. ⏳ Implementar ranking global

---

## 📚 Recursos Adicionales

- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Índices en Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Consultas Complejas](https://firebase.google.com/docs/firestore/query-data/queries)
- [Límites y Cuotas](https://firebase.google.com/docs/firestore/quotas)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs de la consola en tu app
2. Verifica los logs de Firestore en Firebase Console
3. Consulta la documentación oficial de Firebase
4. Abre un issue en el repositorio del proyecto

---

**¡Felicidades! 🎉**

Tu aplicación ahora está conectada a Firebase Firestore y puede guardar preguntas en la nube con sincronización automática.
