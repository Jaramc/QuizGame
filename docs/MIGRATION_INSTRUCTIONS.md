# 🚀 Migración a Firestore-First

## ⚠️ PROBLEMA ACTUAL
El archivo `questionService.ts` se corrompió durante la edición. Necesitas reemplazarlo manualmente.

---

## ✅ SOLUCIÓN PASO A PASO

### 1. Eliminar archivo corrupto

Abre PowerShell o Terminal y ejecuta:
```powershell
cd "C:\Users\Jupiter\Downloads\Proyecto Quizgame\quizgame"
Remove-Item "services\questions\questionService.ts" -Force
```

### 2. Crear nuevo archivo

Crea un nuevo archivo en: `services/questions/questionService.ts`

**Copia el código del archivo**: `docs/NEW_QUESTION_SERVICE.md` (lo crearé a continuación)

---

## 📋 PASOS ADICIONALES

### 3. Migrar preguntas base a Firestore

Ejecuta el script de migración:
```bash
# IMPORTANTE: Primero crear el índice en Firebase Console
# Abre el enlace que te di antes para crear el índice

# Luego ejecuta:
npx ts-node scripts/migrateQuestionsToFirestore.ts
```

Este script:
- ✅ Toma las 30 preguntas de `data/localQuestions.ts`
- ✅ Las sube a Firestore con `createdBy: 'system'`
- ✅ Las marca como `isPublic: true`
- ✅ Verifica que no haya duplicados

---

## 🔥 RESUMEN DE CAMBIOS

### ANTES (Híbrido confuso)
```
- localQuestions.ts → Fuente principal
- Firestore → Opcional
- AsyncStorage → Caché Y almacenamiento
```

### AHORA (Firestore-First)
```
- Firestore → Base de datos PRINCIPAL
- localQuestions.ts → SOLO fallback sin internet  
- AsyncStorage → SOLO caché temporal offline
```

---

## 📊 FLUJO DE DATOS NUEVO

###  1. Crear Pregunta
```
Usuario crea pregunta
        ↓
    Firestore ✓
        ↓
    SUCCESS
        
(Si falla)
        ↓
   AsyncStorage (offline)
        ↓
   Sincronizar después
```

### 2. Cargar Preguntas para Juego
```
Iniciar juego
        ↓
   Firestore ✓
        ↓
  ¿Suficientes?
        ↓
      SÍ → Usar de Firestore
        |
       NO → Completar con localQuestions.ts
        
(Sin internet)
        ↓
  Caché AsyncStorage
        ↓
  localQuestions.ts
```

### 3. Preguntas del Usuario
```
Ver mis preguntas
        ↓
    Firestore ✓
        ↓
   SUCCESS
        
(Sin internet)
        ↓
  AsyncStorage (offline)
```

---

## 🎯 RESULTADO FINAL

✅ **Firestore es la fuente de verdad**
✅ **30 preguntas base en Firestore (públicas)**
✅ **Preguntas de usuarios en Firestore**
✅ **localQuestions.ts solo para emergencias offline**
✅ **AsyncStorage solo para caché temporal**

---

## 📝 PRÓXIMOS PASOS

1. ✅ Crear índice en Firebase Console (ya lo hiciste)
2. ⏳ Reemplazar questionService.ts (siguiente paso)
3. ⏳ Ejecutar script de migración
4. ⏳ Probar en la app

---

## 🔍 VERIFICACIÓN

Después de completar:

```bash
# 1. App funcional con Firestore
Logs: "✅ X preguntas cargadas desde Firestore"

# 2. Sin internet funciona
Logs: "📚 Usando preguntas locales predefinidas"

# 3. Crear pregunta online
Logs: "✅ Pregunta guardada en Firestore: abc123"

# 4. Crear pregunta offline
Logs: "📴 Guardando offline..."
Logs: "💾 Pregunta guardada offline: offline-123"
```

---

**Siguiente archivo: `NEW_QUESTION_SERVICE.md` con el código limpio**
