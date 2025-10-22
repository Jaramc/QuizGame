# 🔧 Reglas de Firestore - COPIAR Y PEGAR COMPLETO

## ⚡ INSTRUCCIONES RÁPIDAS

1. **Abre:** https://console.firebase.google.com/project/quizgame-eda3c/firestore/rules
2. **Selecciona TODO el contenido** del editor
3. **Borra todo**
4. **Copia y pega** el código de abajo
5. **Haz clic en "Publicar"**

---

## 📋 REGLAS COMPLETAS (COPIAR TODO DESDE AQUÍ ↓)

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
    
    // Función helper: verificar si es una pregunta del sistema
    function isSystemQuestion() {
      return request.resource.data.createdBy == 'system';
    }
    
    // Reglas para la colección "questions"
    match /questions/{questionId} {
      // Cualquier usuario autenticado puede leer preguntas públicas
      allow read: if isAuthenticated() && 
                     resource.data.isPublic == true;
      
      // Los usuarios pueden leer sus propias preguntas (públicas o privadas)
      allow read: if isOwner(resource.data.createdBy);
      
      // TEMPORAL: Permitir crear preguntas del sistema sin autenticación
      // (solo para migración inicial)
      allow create: if isSystemQuestion();
      
      // Los usuarios autenticados pueden crear sus propias preguntas
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

## ↑ HASTA AQUÍ (COPIAR TODO)

---

## ✅ DESPUÉS DE PUBLICAR LAS REGLAS

Ejecuta este comando en PowerShell:

```powershell
cd "c:\Users\Jupiter\Downloads\Proyecto Quizgame\quizgame"
npx ts-node --project tsconfig.scripts.json scripts/migrateQuestionsToFirestore.ts
```

**Resultado esperado:**
```
🚀 Iniciando migración de preguntas a Firestore...

📂 Procesando categoría: art
   ✅ Agregada: "¿Quién pintó la Mona Lisa?..." (abc123)
   ✅ Agregada: "¿De qué color es el cielo en 'La noche..." (def456)
   ...

📊 Resumen de la migración:
  ✅ Preguntas agregadas: 23
  ⏭️  Preguntas omitidas: 0
  ❌ Errores: 0

🎉 ¡Migración completada exitosamente!
```

---

## 📝 CAMBIOS REALIZADOS

### ✨ Agregado (línea 18-20):
```javascript
// Función helper: verificar si es una pregunta del sistema
function isSystemQuestion() {
  return request.resource.data.createdBy == 'system';
}
```

### ✨ Agregado en questions (línea 30-32):
```javascript
// TEMPORAL: Permitir crear preguntas del sistema sin autenticación
// (solo para migración inicial)
allow create: if isSystemQuestion();
```

---

## ⚠️ OPCIONAL: Remover regla temporal después

Una vez que hayas ejecutado el script y las 23 preguntas estén en Firestore, puedes **OPCIONALMENTE** remover estas líneas para mayor seguridad:

**Borrar líneas 18-20:**
```javascript
// Función helper: verificar si es una pregunta del sistema
function isSystemQuestion() {
  return request.resource.data.createdBy == 'system';
}
```

**Borrar líneas 30-32:**
```javascript
// TEMPORAL: Permitir crear preguntas del sistema sin autenticación
// (solo para migración inicial)
allow create: if isSystemQuestion();
```

Esto evitará que alguien pueda crear preguntas con `createdBy: 'system'` en el futuro.

**PERO NO ES URGENTE** - puedes dejarlo así si planeas agregar más preguntas del sistema más adelante.

---

## Cambios realizados:

### ✨ Agregado:
```javascript
// Función helper: verificar si es una pregunta del sistema
function isSystemQuestion() {
  return request.resource.data.createdBy == 'system';
}
```

### ✨ Modificado en `match /questions/{questionId}`:
```javascript
// TEMPORAL: Permitir crear preguntas del sistema sin autenticación
// (solo para migración inicial)
allow create: if isSystemQuestion();
```

## 📝 Pasos a seguir:

### 1. Actualizar reglas en Firebase Console (2 min)
- Abre: https://console.firebase.google.com/project/quizgame-eda3c/firestore/rules
- Copia las reglas de arriba
- Pega en el editor
- Haz clic en **"Publicar"**

### 2. Ejecutar script de migración (30 seg)
```powershell
cd "c:\Users\Jupiter\Downloads\Proyecto Quizgame\quizgame"
npx ts-node --project tsconfig.scripts.json scripts/migrateQuestionsToFirestore.ts
```

### 3. OPCIONAL: Quitar la regla temporal después de migrar
Una vez que las preguntas estén en Firestore, puedes eliminar esta línea:
```javascript
allow create: if isSystemQuestion();
```

Y las reglas volverán a ser más seguras (solo usuarios autenticados pueden crear preguntas).

## ⚠️ Seguridad

Esta regla temporal permite que CUALQUIER PERSONA cree preguntas con `createdBy: 'system'`.

**Recomendación:**
- ✅ Úsala solo para la migración inicial
- ✅ Elimínala después de ejecutar el script
- ✅ O déjala si planeas tener un proceso automatizado que cree preguntas del sistema

---

## 🎯 Alternativa más segura (pero más lenta)

Si prefieres NO modificar las reglas, puedo modificar el script para que:
1. Se autentique con tu usuario
2. Cree las preguntas con tu `userId` en lugar de `'system'`
3. Después podemos actualizar el campo `createdBy` a `'system'` manualmente

¿Qué prefieres?
- A) Actualizar reglas temporalmente (rápido, 3 minutos total)
- B) Modificar script para autenticarse (más seguro, 10 minutos)
