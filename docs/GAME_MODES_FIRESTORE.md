# 🎮 Estructura de Firestore para los 3 Modos de Juego

## 📋 Arquitectura General

```
Firestore
├── questions (colección)
│   ├── [questionId] (documento)
│   │   ├── question: string
│   │   ├── options: string[]
│   │   ├── correctAnswer: string
│   │   ├── category: string
│   │   ├── difficulty: 'easy' | 'medium' | 'hard'
│   │   ├── isPublic: boolean
│   │   ├── createdBy: string (UID)
│   │   ├── createdAt: Timestamp
│   │   ├── points: number
│   │   ├── language: string
│   │   └── gameMode?: 'classic' | 'timed' | 'both' (opcional)
│   └── ...
│
├── userScores (colección)
│   ├── [scoreId] (documento)
│   │   ├── userId: string
│   │   ├── userName: string
│   │   ├── score: number
│   │   ├── category: string
│   │   ├── difficulty: string
│   │   ├── gameMode: 'classic' | 'timed'
│   │   ├── correctAnswers: number
│   │   ├── totalQuestions: number
│   │   ├── timeElapsed?: number (solo para timed)
│   │   └── createdAt: Timestamp
│   └── ...
│
└── users (colección - opcional para futuro)
    ├── [userId] (documento)
    │   ├── email: string
    │   ├── displayName: string
    │   ├── stats: object
    │   │   ├── totalGames: number
    │   │   ├── totalScore: number
    │   │   ├── averageScore: number
    │   │   └── favoriteCategory: string
    │   └── createdAt: Timestamp
    └── ...
```

---

## 🎯 Modo 1: Clásico (Classic Mode)

### Descripción
- Preguntas **públicas** de todas las categorías
- Sin límite de tiempo
- Puntuación basada en dificultad
- 10 preguntas por partida

### Query Firestore
```typescript
const q = query(
  collection(db, 'questions'),
  where('isPublic', '==', true),
  where('category', '==', selectedCategory), // opcional
  where('difficulty', '==', selectedDifficulty), // opcional
  limit(10)
);
```

### Estrategia de Carga
1. Intentar obtener 10 preguntas con filtros exactos (categoría + dificultad)
2. Si < 10, relajar a solo categoría
3. Si < 10, relajar a solo dificultad
4. Si < 10, cargar cualquier pregunta pública
5. Si < 10, completar con preguntas locales (fallback offline)

### Puntuación
- Easy: 10 puntos
- Medium: 20 puntos
- Hard: 30 puntos

---

## ⏱️ Modo 2: Contrarreloj (Timed Mode)

### Descripción
- Preguntas **públicas** de todas las categorías
- **15 segundos** por pregunta
- Puntuación basada en tiempo restante
- 10 preguntas por partida

### Query Firestore
```typescript
const q = query(
  collection(db, 'questions'),
  where('isPublic', '==', true),
  where('category', '==', selectedCategory), // opcional
  where('difficulty', '==', selectedDifficulty), // opcional
  limit(10)
);
```

### Estrategia de Carga
**Idéntica al modo clásico** (ambos usan preguntas públicas)

### Puntuación
- Base: 10 (easy), 20 (medium), 30 (hard)
- Bonus: `(tiempoRestante / tiempoTotal) * puntosBase`
- Ejemplo: Si respondes hard en 5 segundos → 30 + (10/15 * 30) = 50 puntos

### Límite de Tiempo
- 15 segundos por pregunta
- Respuesta automática incorrecta si se agota el tiempo

---

## 🔒 Modo 3: Mis Preguntas (My Questions Mode)

### Descripción
- Preguntas **privadas** creadas por el usuario autenticado
- Sin límite de tiempo (como clásico)
- Permite practicar con tus propias preguntas
- Mínimo 10 preguntas del usuario para jugar

### Query Firestore
```typescript
const q = query(
  collection(db, 'questions'),
  where('createdBy', '==', auth.currentUser.uid),
  where('isPublic', '==', false),
  limit(10)
);
```

### Estrategia de Carga
1. Obtener preguntas del usuario con filtros
2. Si el usuario no tiene suficientes preguntas (< 10):
   - Mostrar mensaje: "Crea al menos 10 preguntas para jugar este modo"
   - Redirigir a pantalla de creación de preguntas
3. **NO** usar preguntas locales como fallback (solo preguntas del usuario autenticado)

### Validación Previa
```typescript
// Antes de iniciar el juego
const userQuestionsCount = await getCountFromServer(
  query(
    collection(db, 'questions'),
    where('createdBy', '==', auth.currentUser.uid),
    where('isPublic', '==', false)
  )
);

if (userQuestionsCount.data().count < 10) {
  // Mostrar modal: "Necesitas crear 10+ preguntas"
  return;
}
```

### Puntuación
- Misma que modo clásico (10/20/30 puntos)

---

## 🔐 Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de preguntas
    match /questions/{questionId} {
      // Lectura: Cualquiera puede leer preguntas públicas
      allow read: if resource.data.isPublic == true;
      
      // Lectura: Usuarios autenticados pueden leer sus propias preguntas
      allow read: if request.auth != null && resource.data.createdBy == request.auth.uid;
      
      // Creación: Solo usuarios autenticados
      allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll([
          'question', 'options', 'correctAnswer', 
          'category', 'difficulty', 'isPublic', 
          'createdBy', 'createdAt'
        ]);
      
      // Actualización: Solo el creador
      allow update: if request.auth != null 
        && resource.data.createdBy == request.auth.uid;
      
      // Eliminación: Solo el creador
      allow delete: if request.auth != null 
        && resource.data.createdBy == request.auth.uid;
    }
    
    // Colección de puntuaciones
    match /userScores/{scoreId} {
      // Lectura: Cualquiera puede leer (para ranking global)
      allow read: if true;
      
      // Creación: Solo usuarios autenticados
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      
      // Actualización: Solo el dueño
      allow update: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      
      // Eliminación: Solo el dueño
      allow delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📊 Índices Compuestos Necesarios

### Para queries de preguntas
```
Collection: questions
Fields: 
  - isPublic (Ascending)
  - category (Ascending)
  - difficulty (Ascending)
  - createdAt (Descending)
```

```
Collection: questions
Fields:
  - createdBy (Ascending)
  - isPublic (Ascending)
  - category (Ascending)
  - createdAt (Descending)
```

### Para queries de puntuaciones
```
Collection: userScores
Fields:
  - gameMode (Ascending)
  - category (Ascending)
  - score (Descending)
```

```
Collection: userScores
Fields:
  - userId (Ascending)
  - gameMode (Ascending)
  - createdAt (Descending)
```

---

## 🎯 Implementación en `questionService.ts`

### Función para Modo Clásico/Contrarreloj
```typescript
export const getQuestionsForPublicModes = async (
  category?: string,
  difficulty?: string,
  count: number = 10
): Promise<Question[]> => {
  // Estrategia progresiva (ya implementada)
  // 1. Exacto → 2. Categoría → 3. Dificultad → 4. Todas públicas → 5. Local
};
```

### Función para Mis Preguntas
```typescript
export const getUserQuestions = async (
  userId: string,
  category?: string,
  difficulty?: string,
  count: number = 10
): Promise<Question[]> => {
  const constraints: QueryConstraint[] = [
    where('createdBy', '==', userId),
    where('isPublic', '==', false)
  ];
  
  if (category) constraints.push(where('category', '==', category));
  if (difficulty) constraints.push(where('difficulty', '==', difficulty));
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(count));
  
  const q = query(collection(db, 'questions'), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

export const getUserQuestionsCount = async (userId: string): Promise<number> => {
  const q = query(
    collection(db, 'questions'),
    where('createdBy', '==', userId),
    where('isPublic', '==', false)
  );
  
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};
```

---

## 🚀 Plan de Migración

### Paso 1: Verificar estado actual
```bash
npx ts-node --project tsconfig.scripts.json scripts/verifyFirestore.ts
```

### Paso 2: Migrar preguntas base (si está vacío)
```bash
npx ts-node --project tsconfig.scripts.json scripts/migrateQuestionsWithAuth.ts
```

### Paso 3: Actualizar reglas de seguridad
- Copiar reglas de arriba
- Pegar en Firebase Console → Firestore Database → Rules
- Publicar

### Paso 4: Crear índices compuestos
- Firebase Console → Firestore Database → Indexes
- Crear los 4 índices listados arriba

### Paso 5: Actualizar código de la app
- Implementar `getUserQuestions()` y `getUserQuestionsCount()`
- Agregar validación previa en pantalla de "Mis Preguntas"
- Implementar pantalla de gestión de preguntas

---

## ✅ Checklist de Implementación

- [ ] Verificar que hay preguntas en Firestore
- [ ] Actualizar reglas de seguridad
- [ ] Crear índices compuestos
- [ ] Implementar `getUserQuestions()` en `questionService.ts`
- [ ] Implementar `getUserQuestionsCount()` en `questionService.ts`
- [ ] Agregar validación en pantalla "Mis Preguntas"
- [ ] Crear pantalla de gestión de preguntas del usuario
- [ ] Guardar puntuaciones en `userScores` collection
- [ ] Implementar ranking global usando `userScores`
- [ ] Probar los 3 modos de juego

---

## 📝 Notas Importantes

1. **Preguntas públicas vs privadas**:
   - `isPublic: true` → Visibles en modo Clásico y Contrarreloj
   - `isPublic: false` → Solo visibles para el creador en "Mis Preguntas"

2. **Estrategia offline**:
   - Modos Clásico/Contrarreloj: Usar `localQuestions.ts` como fallback
   - Mis Preguntas: **NO** usar fallback local (requiere autenticación)

3. **Campo `gameMode` opcional**:
   - Puedes agregar `gameMode: 'classic' | 'timed' | 'both'` para restringir preguntas
   - Por ahora, todas las preguntas públicas están disponibles en ambos modos

4. **Puntuaciones**:
   - Guardar cada partida en `userScores` collection
   - Usar para ranking global y estadísticas del usuario
