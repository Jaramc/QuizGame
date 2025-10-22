# 🔐 Configurar Reglas de Firestore

## ❌ Problema Actual

```
Missing or insufficient permissions
```

Las reglas de Firestore están bloqueando:
1. ❌ Lectura de preguntas sin autenticación
2. ❌ Escritura de preguntas del sistema
3. ❌ Scripts de migración

---

## ✅ Solución: Actualizar Reglas en Firebase Console

### Paso 1: Abrir Firebase Console

1. Ve a: https://console.firebase.google.com/project/quizgame-eda3c/firestore/rules
2. Verás el editor de reglas actual

### Paso 2: Reemplazar las Reglas

**OPCIÓN A: Reglas de Desarrollo (MÁS PERMISIVAS - Para pruebas)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de preguntas
    match /questions/{questionId} {
      // Permitir lectura a todos (autenticados o no)
      allow read: if true;
      
      // Permitir escritura solo a usuarios autenticados
      allow create: if request.auth != null;
      
      // Permitir actualizar/eliminar solo al creador
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.createdBy;
    }
    
    // Colección de sesiones de juego
    match /game_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
    }
    
    // Colección de estadísticas de usuario
    match /user_stats/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
  }
}
```

**OPCIÓN B: Reglas de Producción (MÁS SEGURAS - Recomendado después de pruebas)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper: verificar si el usuario es el dueño del recurso
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección de preguntas
    match /questions/{questionId} {
      // Lectura: solo usuarios autenticados
      allow read: if isAuthenticated();
      
      // Crear: usuarios autenticados pueden crear preguntas
      allow create: if isAuthenticated() && 
                      request.resource.data.createdBy == request.auth.uid;
      
      // Actualizar: solo el creador
      allow update: if isOwner(resource.data.createdBy);
      
      // Eliminar: solo el creador
      allow delete: if isOwner(resource.data.createdBy);
    }
    
    // Colección de sesiones de juego
    match /game_sessions/{sessionId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Colección de estadísticas de usuario
    match /user_stats/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

### Paso 3: Publicar las Reglas

1. Copia las reglas de **OPCIÓN A** (desarrollo)
2. Pega en el editor de Firebase Console
3. Haz clic en **"Publicar"** o **"Publish"**
4. Espera confirmación: "Reglas publicadas correctamente"

---

## 🔄 Alternativa: Migrar Desde la App (Con Usuario Autenticado)

Si prefieres no cambiar las reglas por ahora, puedo crear un botón en la app que migre las preguntas mientras estás autenticado.

**Ventajas:**
- ✅ No requiere cambiar reglas de Firestore
- ✅ Las preguntas se crean con tu userId
- ✅ Más seguro

**Desventajas:**
- ❌ Requiere estar autenticado en la app
- ❌ Las preguntas tendrán tu userId en lugar de 'system'

---

## 🎯 Recomendación

**Para desarrollo y pruebas:**
1. Usa **OPCIÓN A** (reglas permisivas)
2. Ejecuta el script de migración
3. Prueba que todo funcione
4. Cambia a **OPCIÓN B** (reglas seguras) antes de producción

**¿Qué prefieres?**
- A) Actualizar reglas en Firebase Console (más rápido)
- B) Crear botón de migración en la app (más seguro)

