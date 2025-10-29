# 🔧 Guía: Crear Índices Compuestos en Firestore

## 📍 URL Directa
https://console.firebase.google.com/project/quizgame-eda3c/firestore/indexes

---

## 📋 Índice 1: Preguntas Públicas (Modo Clásico/Contrarreloj)

### Paso a paso:

1. **Haz clic en "Crear índice"** (botón azul en la esquina superior derecha)

2. **Configuración del índice:**
   ```
   Colección:     questions
   Estado:        Colección
   ```

3. **Agrega estos campos EN ORDEN:**
   
   | Campo        | Orden      |
   |-------------|------------|
   | isPublic    | Ascending  |
   | category    | Ascending  |
   | difficulty  | Ascending  |
   | createdAt   | Descending |

4. **Opciones de consulta:**
   - Query scope: `Collection`

5. **Haz clic en "Crear"**

⏳ El índice tardará unos minutos en construirse (verás "Building..." → "Enabled")

---

## 📋 Índice 2: Preguntas del Usuario (Modo Mis Preguntas)

### Paso a paso:

1. **Haz clic en "Crear índice"** nuevamente

2. **Configuración del índice:**
   ```
   Colección:     questions
   Estado:        Colección
   ```

3. **Agrega estos campos EN ORDEN:**
   
   | Campo        | Orden      |
   |-------------|------------|
   | createdBy   | Ascending  |
   | isPublic    | Ascending  |
   | category    | Ascending  |
   | createdAt   | Descending |

4. **Opciones de consulta:**
   - Query scope: `Collection`

5. **Haz clic en "Crear"**

⏳ El índice tardará unos minutos en construirse

---

## ✅ Verificación

Una vez creados, deberías ver en la lista de índices:

```
📊 Collection Indexes

questions
  ├─ [Enabled] isPublic (↑) + category (↑) + difficulty (↑) + createdAt (↓)
  └─ [Enabled] createdBy (↑) + isPublic (↑) + category (↑) + createdAt (↓)
```

---

## 🧪 Probar después de crear

Ejecuta este comando para verificar que los índices funcionan:

```powershell
npx ts-node --project tsconfig.scripts.json scripts/testGameModes.ts
```

Deberías ver:
- ✅ Todos los tests pasan sin errores de "failed-precondition"
- ✅ Las queries retornan resultados correctamente

---

## ❓ Problemas Comunes

### "The query requires an index"
- **Causa:** El índice aún no está creado o sigue en estado "Building"
- **Solución:** Espera 2-5 minutos hasta que aparezca "Enabled"

### "Missing or insufficient permissions"
- **Causa:** Las reglas de Firestore no permiten la consulta
- **Solución:** Ya están actualizadas en `firestore.rules`, solo asegúrate de haberlas publicado

### No veo el botón "Crear índice"
- **Causa:** Permisos insuficientes en el proyecto
- **Solución:** Asegúrate de estar logueado con la cuenta correcta de Firebase

---

## 📸 Referencia Visual

### Pantalla de creación de índice:

```
┌─────────────────────────────────────────────────┐
│  Create a composite index                      │
├─────────────────────────────────────────────────┤
│  Collection ID:  [questions          ▼]        │
│  Query scope:    [Collection         ▼]        │
│                                                 │
│  Fields:                                        │
│  ┌───────────────┬──────────────┬────────┐    │
│  │ Field path    │ Order        │ Action │    │
│  ├───────────────┼──────────────┼────────┤    │
│  │ isPublic      │ Ascending  ▼ │  [X]   │    │
│  │ category      │ Ascending  ▼ │  [X]   │    │
│  │ difficulty    │ Ascending  ▼ │  [X]   │    │
│  │ createdAt     │ Descending ▼ │  [X]   │    │
│  └───────────────┴──────────────┴────────┘    │
│                                                 │
│  [+ Add field]                                  │
│                                                 │
│  [Cancel]              [Create]                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Siguiente Paso

Una vez que ambos índices muestren "Enabled":

✅ Marca la tarea como completada
✅ Ejecuta los tests
✅ Actualiza las pantallas de juego para usar las nuevas funciones

---

¿Listo? Abre el enlace y crea los 2 índices 👆
