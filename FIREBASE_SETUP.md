# 🔥 Guía de Configuración de Firebase - Paso a Paso

## 📋 Resumen
Esta guía te llevará paso a paso para configurar Firebase Authentication en tu app QuizGame.

---

## 📝 Paso 1: Crear Proyecto en Firebase Console

1. **Ve a Firebase Console**: https://console.firebase.google.com/
2. **Haz clic en "Agregar proyecto" o "Add project"**
3. **Ingresa el nombre del proyecto**: `quizgame` (o el nombre que prefieras)
4. **Acepta los términos** y haz clic en **Continuar**
5. **(Opcional)** Puedes deshabilitar Google Analytics si no lo necesitas
6. **Haz clic en "Crear proyecto"** y espera a que se complete

---

## 📱 Paso 2: Agregar App Android al Proyecto

1. En la página de tu proyecto Firebase, haz clic en el **ícono de Android** (</>) para agregar una app Android
2. **Completa el formulario**:
   - **Nombre del paquete de Android**: **IMPORTANTE - Usa exactamente esto:**
     ```
     com.jaramc.quizgame
     ```
     ⚠️ **Debe coincidir con el applicationId del proyecto**
   - **Sobrenombre de la app** (opcional): `QuizGame Android`
   - **SHA-1** (opcional por ahora, lo puedes agregar después)
3. **Haz clic en "Registrar app"**
4. **Descarga el archivo `google-services.json`**
5. **Coloca el archivo** en la carpeta:
   ```
   android/app/google-services.json
   ```
6. **Haz clic en "Siguiente"** hasta finalizar

---

## 🔐 Paso 3: Habilitar Authentication con Email/Password

1. En el menú lateral de Firebase Console, ve a **"Build" → "Authentication"**
2. Haz clic en **"Get started"** (si es la primera vez)
3. Ve a la pestaña **"Sign-in method"**
4. Haz clic en **"Email/Password"**
5. **Activa el primer switch** (Email/Password)
   - ✅ Habilitar (Enable)
   - ❌ Deja deshabilitado "Email link" por ahora
6. **Haz clic en "Guardar"**

---

## 🌐 Paso 4: Agregar App Web (para obtener las credenciales)

1. En la página de configuración del proyecto, haz clic en el **ícono de Web** (</>)
2. **Completa el formulario**:
   - **Sobrenombre de la app**: `QuizGame Web`
   - No necesitas marcar Firebase Hosting
3. **Haz clic en "Registrar app"**
4. **Copia las credenciales** que aparecen en el código JavaScript:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "quizgame-xxxxx.firebaseapp.com",
  projectId: "quizgame-xxxxx",
  storageBucket: "quizgame-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## ⚙️ Paso 5: Actualizar Credenciales en el Proyecto

1. **Abre el archivo** `config/firebase.ts`
2. **Reemplaza las credenciales** con las que copiaste:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",              // ← Pega tu apiKey
  authDomain: "TU_AUTH_DOMAIN_AQUI",      // ← Pega tu authDomain
  projectId: "TU_PROJECT_ID_AQUI",        // ← Pega tu projectId
  storageBucket: "TU_STORAGE_BUCKET",     // ← Pega tu storageBucket
  messagingSenderId: "TU_SENDER_ID",      // ← Pega tu messagingSenderId
  appId: "TU_APP_ID_AQUI"                 // ← Pega tu appId
};
```

3. **Guarda el archivo**

---

## 🔧 Paso 6: Configurar Android Build (build.gradle)

### 6.1. Archivo `android/build.gradle` (proyecto raíz)

Verifica que tenga esto al final del archivo `dependencies`:

```gradle
buildscript {
    dependencies {
        // ... otras dependencias
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 6.2. Archivo `android/app/build.gradle` (módulo app)

Al **final del archivo**, después de todos los bloques, agrega:

```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## 📦 Paso 7: Rebuilding la App con Firebase

Ahora necesitas reconstruir la app para que incluya los módulos nativos de Firebase:

### En PowerShell/Terminal:

```powershell
# Si el build anterior falló, primero limpia completamente:
Remove-Item -Recurse -Force "android\app\.cxx" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue

# Rebuild completo con Expo
npx expo run:android
```

**Nota**: Este proceso puede tardar varios minutos la primera vez.

**Importante**: Si obtienes el error "No matching client found for package name", ve a la sección de Troubleshooting más abajo.

---

## ✅ Paso 8: Probar el Registro

Una vez que la app esté corriendo:

1. **Ve a la pantalla de "Welcome"**
2. **Haz clic en "Crear Cuenta"**
3. **Completa el formulario**:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test1234`
   - Confirm Password: `test1234`
4. **Haz clic en "Crear Cuenta"**

### Verificar en Firebase Console:

1. Ve a **"Authentication" → "Users"**
2. Deberías ver el usuario recién creado con su email

---

## 🐛 Troubleshooting

### Error: "No matching client found for package name"
- **Error completo**: `No matching client found for package name 'com.jaramc.quizgame'`
- **Causa**: El package name en Firebase Console no coincide con el applicationId del proyecto
- **Solución**:
  1. Ve a Firebase Console → Project Settings → General
  2. En la sección "Your apps", elimina la app Android existente (ícono de 3 puntos → Delete app)
  3. Agrega una nueva app Android con el package name correcto: `com.jaramc.quizgame`
  4. Descarga el nuevo `google-services.json`
  5. Reemplázalo en `android/app/google-services.json`
  6. Rebuild: `npx expo run:android`

### Error: "Default app has not been initialized"
- **Solución**: Verifica que `google-services.json` esté en `android/app/`
- Rebuild con `npx expo run:android`

### Error: "API key not valid"
- **Solución**: Verifica que copiaste correctamente la `apiKey` en `config/firebase.ts`

### Error: "The email address is already in use"
- **Solución**: Prueba con otro email o elimina el usuario en Firebase Console

### Error: "Password should be at least 6 characters"
- **Solución**: Firebase requiere mínimo 6 caracteres en las contraseñas

---

## 📚 Estructura de Archivos Creados

```
quizgame/
├── config/
│   └── firebase.ts              ← Configuración de Firebase
├── services/
│   └── auth/
│       ├── authService.ts       ← Servicio de autenticación
│       └── index.ts             ← Barrel export
├── contexts/
│   └── auth/
│       └── AuthContext.tsx      ← Context actualizado con Firebase
├── android/
│   └── app/
│       └── google-services.json ← Credenciales Android (DESCARGAR)
└── FIREBASE_SETUP.md            ← Esta guía
```

---

## 🎯 Próximos Pasos (Opcional)

### Funcionalidades adicionales que puedes implementar:

1. **Reset Password**: Recuperación de contraseña por email
2. **Email Verification**: Verificar email al registrarse
3. **Login con Google**: Autenticación social
4. **Login con Facebook**: Autenticación social
5. **Perfil de Usuario**: Actualizar nombre, foto, etc.
6. **Firestore**: Guardar datos del usuario en base de datos

---

## ✨ ¡Listo!

Ya tienes Firebase Authentication completamente configurado. Ahora los usuarios pueden:
- ✅ Registrarse con email y contraseña
- ✅ Iniciar sesión
- ✅ Cerrar sesión
- ✅ Mantener la sesión activa (persistencia automática)

**Nota**: No olvides agregar el archivo `google-services.json` a `.gitignore` para no subirlo a tu repositorio.
