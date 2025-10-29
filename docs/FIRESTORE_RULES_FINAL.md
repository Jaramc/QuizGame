# 🔒 REGLAS DE FIRESTORE FINALES - COPIAR Y PEGAR

## ⚡ USO: Copia TODA esta configuración a Firebase Console

**Enlace directo:** https://console.firebase.google.com/project/quizgame-eda3c/firestore/rules

---

## 📋 REGLAS COMPLETAS (COPIAR TODO ↓)

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
      // LECTURA: Preguntas públicas pueden leerse SIN autenticación
      allow read: if resource.data.isPublic == true;
      
      // LECTURA: Los usuarios autenticados pueden leer sus propias preguntas privadas
      allow read: if isAuthenticated() && 
                     request.auth.uid == resource.data.createdBy;
      
      // ESCRITURA: Solo usuarios autenticados pueden crear preguntas
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.createdBy;
      
      // ACTUALIZACIÓN: Solo el creador puede actualizar sus preguntas
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.createdBy;
      
      // ELIMINACIÓN: Solo el creador puede eliminar sus preguntas
      allow delete: if isAuthenticated() && 
                       request.auth.uid == resource.data.createdBy;
    }
    
    // Reglas para la colección "game_sessions"
    match /game_sessions/{sessionId} {
      // Solo el dueño puede leer sus sesiones
      allow read: if isAuthenticated() && 
                     request.auth.uid == resource.data.userId;
      
      // Solo usuarios autenticados pueden crear sesiones
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.userId;
      
      // Solo el dueño puede actualizar su sesión
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.userId;
      
      // Solo el dueño puede eliminar su sesión
      allow delete: if isAuthenticated() && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Reglas para la colección "user_stats"
    match /user_stats/{userId} {
      // Solo el dueño puede leer sus estadísticas
      allow read: if isAuthenticated() && 
                     request.auth.uid == userId;
      
      // Solo el dueño puede crear/actualizar sus estadísticas
      allow write: if isAuthenticated() && 
                      request.auth.uid == userId;
    }
    
    // Reglas para ranking público (futuro)
    match /ranking/{userId} {
      // Todos los autenticados pueden leer el ranking
      allow read: if isAuthenticated();
      
      // Nadie puede escribir directamente (usar Cloud Functions)
      allow write: if false;
    }
  }
}
```

---

## ✅ CAMBIOS PRINCIPALES

### 🔓 Lectura Pública de Preguntas
**ANTES:**
```javascript
allow read: if isAuthenticated() && resource.data.isPublic == true;
```

**AHORA:**
```javascript
allow read: if resource.data.isPublic == true;
```

**Razón:** Permite que la app cargue preguntas públicas **sin necesidad de autenticación**, perfecto para el modo invitado o pantalla de selección.

### 🔒 Seguridad Mantenida
- ✅ Crear preguntas: Solo usuarios autenticados
- ✅ Actualizar/Eliminar: Solo el dueño
- ✅ Preguntas privadas: Solo el creador puede leerlas
- ✅ Sesiones de juego: Solo el dueño
- ✅ Estadísticas: Solo el dueño

---

## 🚀 DESPUÉS DE PUBLICAR

1. **Espera 10-30 segundos** para que se propaguen las reglas
2. **Reinicia la app:**
   ```powershell
   npx expo start --clear
   ```
3. **Verás en logs:**
   ```
   📡 Intentando cargar preguntas desde Firestore...
   📊 Query exitosa: 1 documentos encontrados  ← ✅
   ✅ 1 preguntas cargadas desde Firestore
   ```

---

## 🎯 Arquitectura Final

```
┌─────────────────────────────────────────┐
│       APP (Usuario NO autenticado)       │
├─────────────────────────────────────────┤
│  ✅ Puede: Leer preguntas públicas      │
│  ❌ No puede: Crear/Editar preguntas    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       APP (Usuario autenticado)          │
├─────────────────────────────────────────┤
│  ✅ Leer preguntas públicas              │
│  ✅ Leer sus preguntas privadas          │
│  ✅ Crear nuevas preguntas               │
│  ✅ Editar/Eliminar sus preguntas        │
│  ✅ Ver/Gestionar sus sesiones           │
│  ✅ Ver sus estadísticas                 │
└─────────────────────────────────────────┘
```

---

## 📝 NOTA IMPORTANTE

Las 23 preguntas que migraste tienen:
- `isPublic: true` ✅
- `createdBy: "0E5YKXCNlxeVUT6rJnkYTPTYRep1"` (tu userId)

Con estas reglas, **todos los usuarios** (autenticados o no) podrán ver y jugar con esas preguntas.

