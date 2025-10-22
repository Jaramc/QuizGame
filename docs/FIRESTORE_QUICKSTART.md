# 🚀 Guía Rápida: Configurar Firestore en 10 Minutos

Esta es una guía visual y simplificada para configurar Firebase Firestore. Para la versión completa, consulta [FIRESTORE_CONFIGURATION.md](./FIRESTORE_CONFIGURATION.md).

---

## ✅ Checklist de Configuración

- [ ] Paso 1: Crear base de datos Firestore
- [ ] Paso 2: Configurar reglas de seguridad
- [ ] Paso 3: Crear colección "questions"
- [ ] Paso 4: Crear índices compuestos
- [ ] Paso 5: Probar en la app

---

## 🎯 Paso 1: Crear Base de Datos (2 min)

### Acciones:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **QuizGame**
3. Clic en **"Firestore Database"** (menú izquierdo)
4. Clic en **"Crear base de datos"**

### Opciones:
```
┌─────────────────────────────────────┐
│  ¿Cómo quieres empezar?             │
│                                     │
│  ○ Modo de producción              │
│     Reglas restrictivas por defecto │
│                                     │
│  ⦿ Modo de prueba                  │
│     Lectura/escritura libre 30 días │
│                                     │
│  [Siguiente]                        │
└─────────────────────────────────────┘
```

**Recomendación**: Selecciona **"Modo de producción"** y configura reglas manualmente.

### Ubicación:
```
América Latina:  us-central1 o southamerica-east1
España:          europe-west1
USA:             us-east1
```

⚠️ **La ubicación NO se puede cambiar después**

---

## 🔐 Paso 2: Configurar Reglas (3 min)

### Acciones:
1. En Firestore, ve a la pestaña **"Reglas"**
2. Copia y pega este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: usuario autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: usuario es dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección "questions"
    match /questions/{questionId} {
      // Leer: preguntas públicas o propias
      allow read: if isAuthenticated() && 
                     (resource.data.isPublic == true || 
                      request.auth.uid == resource.data.createdBy);
      
      // Crear: solo si eres el creador
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.createdBy;
      
      // Actualizar/Eliminar: solo el dueño
      allow update, delete: if isOwner(resource.data.createdBy);
    }
  }
}
```

3. Clic en **"Publicar"**

✅ **¡Reglas configuradas!**

---

## 📊 Paso 3: Crear Colección (2 min)

### Acciones:
1. Ve a la pestaña **"Datos"**
2. Clic en **"Iniciar colección"**
3. Nombre: `questions`
4. Clic en **"Siguiente"**

### Crear Pregunta de Ejemplo:

**ID del documento**: (dejar en auto)

**Campos**:
```
category        (string)    : science
difficulty      (string)    : medium
question        (string)    : ¿Cuál es la fórmula del agua?
options         (array)     : ["H2O", "CO2", "O2", "N2"]
correctAnswer   (number)    : 0
createdBy       (string)    : system
createdAt       (timestamp) : (usar actual)
language        (string)    : es
points          (number)    : 20
isPublic        (boolean)   : true
```

5. Clic en **"Guardar"**

✅ **Primera pregunta creada!**

---

## 🔍 Paso 4: Crear Índices (2 min)

### Acciones:
1. Ve a la pestaña **"Índices"**
2. Clic en **"Agregar índice"**

### Índice 1: Búsqueda de Preguntas Públicas

```
Colección:  questions
Campos:
  - isPublic    (Ascending)
  - category    (Ascending)
  - difficulty  (Ascending)
  - createdAt   (Descending)

Estado de consulta: Enabled
```

### Índice 2: Preguntas del Usuario

```
Colección:  questions
Campos:
  - createdBy   (Ascending)
  - createdAt   (Descending)

Estado de consulta: Enabled
```

3. Clic en **"Crear"** para cada índice
4. Espera 2-5 minutos mientras se construyen

✅ **Índices en construcción...**

---

## 🧪 Paso 5: Probar en la App (1 min)

### Acciones:
1. Abre tu app React Native
2. Inicia sesión (o registra un usuario nuevo)
3. Ve a la pantalla **"Crear Pregunta"**
4. Llena el formulario:
   ```
   Categoría:  Ciencia
   Dificultad: Medio
   Pregunta:   ¿Cuál es el planeta más grande?
   Opción A:   Júpiter ✓
   Opción B:   Saturno
   Opción C:   Tierra
   Opción D:   Marte
   Pública:    ✓ Sí
   ```
5. Clic en **"Crear Pregunta"**

### Verificar en Consola de App:

**✅ ÉXITO (Firestore Online)**:
```
📡 Intentando cargar preguntas de Firestore...
✅ Pregunta guardada en Firestore: abc123xyz
```

**⚠️ FALLBACK (Firestore Offline)**:
```
⚠️ Firestore no disponible, usando modo local
✅ Pregunta guardada localmente: local-1234567890
```

### Verificar en Firebase Console:

1. Ve a **Firestore Database → Datos**
2. Abre la colección `questions`
3. Deberías ver tu pregunta recién creada con:
   - ID: `abc123xyz` (auto-generado)
   - question: "¿Cuál es el planeta más grande?"
   - createdBy: (tu user ID)
   - Todos los demás campos

✅ **¡Todo funcionando correctamente!**

---

## 📱 Verificar Modo Híbrido

### Prueba 1: Modo Online
```bash
# La app debería:
1. Guardar en Firestore
2. Actualizar cache local
3. Mostrar: "✅ Pregunta guardada en Firestore"
```

### Prueba 2: Modo Offline
```bash
# Activa "Modo Avión" en el dispositivo

# La app debería:
1. Detectar que Firestore no está disponible
2. Guardar localmente con ID "local-"
3. Mostrar: "⚠️ Usando modo local"
4. Funcionar perfectamente sin internet
```

### Prueba 3: Cache Automático
```bash
# Con internet:
1. Carga tus preguntas (se actualiza cache)
2. Desconecta internet
3. Vuelve a cargar tus preguntas
4. Debería funcionar usando el cache local
5. Logs: "✅ Usando caché local válido"
```

---

## 🎉 ¡Configuración Completa!

Tu sistema híbrido ahora está funcionando con:

✅ **Firestore**: Base de datos en la nube
✅ **AsyncStorage**: Cache local y fallback
✅ **Detección automática**: Online/Offline transparente
✅ **Reglas de seguridad**: Protección de datos
✅ **Índices**: Consultas rápidas y eficientes

---

## 📊 Arquitectura Final

```
┌──────────────────────────────────────────┐
│         TU APLICACIÓN                    │
│                                          │
│  ┌────────────────────────────────┐     │
│  │   questionService.ts           │     │
│  │   (Sistema Híbrido)            │     │
│  └───────┬──────────────┬─────────┘     │
│          │              │                │
└──────────┼──────────────┼────────────────┘
           │              │
    ONLINE │              │ OFFLINE
           ▼              ▼
  ┌─────────────┐  ┌──────────────┐
  │  FIRESTORE  │  │ ASYNCSTORAGE │
  │   (Cloud)   │  │   (Local)    │
  └─────────────┘  └──────────────┘
```

---

## 🔧 Comandos Útiles

### Ver todas las claves de AsyncStorage
```typescript
const keys = await AsyncStorage.getAllKeys();
console.log('Claves:', keys);
```

### Ver preguntas guardadas localmente
```typescript
const questions = await AsyncStorage.getItem('@quizgame_user_questions_abc123');
console.log('Preguntas:', JSON.parse(questions));
```

### Forzar recarga desde Firestore
```typescript
// En questionService.ts, cambiar:
isFirestoreAvailable = true;
```

### Limpiar cache local
```typescript
await AsyncStorage.removeItem('@quizgame_user_questions_abc123');
await AsyncStorage.removeItem('@quizgame_user_questions_abc123_timestamp');
```

---

## 🆘 Solución Rápida de Problemas

### ❌ "Missing or insufficient permissions"
**Solución**: Verifica que las reglas permitan al usuario actual acceder a ese documento.

### ❌ "The query requires an index"
**Solución**: Firebase te dará un enlace en el error. Haz clic para crear el índice automáticamente.

### ❌ "Failed to get document because the client is offline"
**Solución**: El sistema usará automáticamente AsyncStorage. Revisa que tengas preguntas locales.

### ❌ Las preguntas no aparecen en el juego
**Solución**: Verifica que `isPublic` sea `true` en Firestore Console.

---

## 📚 Documentación Completa

Para más detalles, consulta:

- [FIRESTORE_CONFIGURATION.md](./FIRESTORE_CONFIGURATION.md) - Guía completa de configuración
- [HYBRID_MODE.md](./HYBRID_MODE.md) - Arquitectura del sistema híbrido
- [LOCAL_MODE.md](./LOCAL_MODE.md) - Sistema de cache local

---

## 🎯 Próximos Pasos

- [ ] Migrar sesiones de juego a Firestore
- [ ] Migrar estadísticas de usuario a Firestore
- [ ] Implementar ranking global
- [ ] Agregar sincronización en segundo plano
- [ ] Implementar notificaciones push

---

**¡Felicidades! Tu app ahora tiene persistencia en la nube.** 🚀
