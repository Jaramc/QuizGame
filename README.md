# 🎮 QuizGame

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

> Aplicación móvil de trivia inspirada en Preguntados, construida con React Native, Expo y Firebase.

---

## 📋 Descripción

QuizGame es una aplicación móvil de preguntas y respuestas que incluye un sistema completo de autenticación con Firebase, arquitectura escalable y diseño moderno.

---

## ✨ Características

### 🔐 Autenticación (Firebase)
- ✅ Registro con email y contraseña
- ✅ Login con validación
- ✅ Persistencia de sesión automática
- ✅ Logout
- ✅ Rutas protegidas
- ✅ Manejo de errores de Firebase

### 📱 Dashboard
- ✅ Navegación por pestañas (4 pantallas)
- ✅ Pantalla de Inicio con estadísticas
- ✅ Pantalla de Jugar con modos de juego
- ✅ Pantalla de Ranking global
- ✅ Pantalla de Perfil de usuario
- ✅ Animaciones y transiciones

### 🎨 UI/UX
- ✅ Diseño inspirado en Preguntados
- ✅ Animaciones fluidas
- ✅ Componentes reutilizables
- ✅ Validación en tiempo real
- ✅ Estados de loading
- ✅ Feedback visual de errores
- ✅ SafeArea para diferentes dispositivos

---

## 🚀 Quick Start

### Prerequisitos

- Node.js 18+
- npm o yarn
- Android Studio (para Android)
- Cuenta de Firebase

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Jaramc/quizgame.git
cd quizgame

# Instalar dependencias
npm install

# Configurar Firebase
# Ver guía completa en: docs/FIREBASE_SETUP.md
```

### Configuración

1. **Configurar Firebase** - Sigue la [guía completa](./docs/FIREBASE_SETUP.md)
2. **Actualizar credenciales** en `config/firebase.ts`
3. **Descargar `google-services.json`** a `android/app/`

### Ejecutar

```bash
# Desarrollo (Android)
npx expo run:android

# Metro bundler
npm start
```

---

## 📚 Documentación

Encuentra toda la documentación en la carpeta [`docs/`](./docs/):

- 🔥 **[Firebase Setup](./docs/FIREBASE_SETUP.md)** - Configuración paso a paso
- 📖 **[README Completo](./docs/README.md)** - Arquitectura y guías

---

## 🏗️ Arquitectura

**Organización por Features:**

```
quizgame/
├── app/                    # Pantallas y rutas (Expo Router)
├── components/             # Componentes reutilizables
│   └── auth/              # Componentes de autenticación
├── config/                # Configuraciones (Firebase)
├── contexts/              # React Contexts
│   └── auth/              # Context de autenticación
├── hooks/                 # Custom hooks
│   └── auth/              # Hooks de auth
├── services/              # APIs y servicios
│   └── auth/              # Firebase Auth service
├── styles/                # Estilos globales
│   └── auth/              # Estilos de auth
├── types/                 # TypeScript types
│   └── auth/              # Types de auth
├── docs/                  # 📚 Documentación
└── android/               # Proyecto Android nativo
```

Ver [documentación completa](./docs/README.md) para más detalles.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React Native + Expo
- **Routing**: Expo Router (file-based)
- **Language**: TypeScript
- **Auth**: Firebase Authentication
- **State**: React Context API
- **Storage**: AsyncStorage
- **Styling**: StyleSheet + Custom theme

---

## 📖 Guías

- 🔥 **[Configurar Firebase](./docs/FIREBASE_SETUP.md)** - Setup completo paso a paso
- 📚 **[Documentación Técnica](./docs/README.md)** - Arquitectura y convenciones

---

## 🔜 Roadmap

- [ ] Sistema de Quiz (preguntas y respuestas)
- [ ] Categorías de preguntas
- [ ] Sistema de puntajes
- [ ] Ranking global
- [ ] Modo multijugador
- [ ] Reset de contraseña
- [ ] Verificación de email
- [ ] Login social (Google, Facebook)

---

## 🤝 Contribuir

```bash
# Fork el proyecto
# Crea tu feature branch
git checkout -b feature/nueva-funcionalidad

# Commit tus cambios
git commit -m 'feat: agregar nueva funcionalidad'

# Push al branch
git push origin feature/nueva-funcionalidad

# Abre un Pull Request
```

---

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

---

## 👤 Autor

**Jaramc**
- GitHub: [@Jaramc](https://github.com/Jaramc)

---

## 🙏 Agradecimientos

Inspirado en la app Preguntados (Trivia Crack).

---

**Última actualización**: Octubre 2025
  art: '#9B59B6',          // Púrpura
  science: '#3498DB',      // Azul
  sports: '#E67E22',       // Naranja
  entertainment: '#E91E63', // Rosa
  geography: '#27AE60',    // Verde
  history: '#F39C12',      // Dorado
}
```

## 📦 Dependencias Principales

- `expo-router`: Navegación file-based
- `@react-native-async-storage/async-storage`: Persistencia
- `react-native-animatable`: Animaciones
- `expo-linear-gradient`: Gradientes (opcional)
- `@expo/vector-icons`: Íconos

## 🔄 Próximos Pasos

### Para Producción:
1. Integrar con API backend real
2. Implementar recuperación de contraseña
3. Autenticación con redes sociales
4. Verificación de email
5. Tokens JWT para seguridad

### Para el Juego:
1. Implementar sistema de categorías
2. Base de datos de preguntas
3. Sistema de puntuación
4. Ranking de jugadores
5. Modo multijugador

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web
```

## 📝 Notas para el Proyecto Universitario

Este sistema de autenticación está diseñado para ser:

- ✅ **Fácil de entender**: Código bien comentado
- ✅ **Modular**: Fácil de extender y modificar
- ✅ **Sin dependencias complejas**: No requiere backend externo
- ✅ **Funcional**: Listo para demostración
- ✅ **Educativo**: Muestra buenas prácticas de desarrollo

## 👨‍💻 Autor

Proyecto QuizGame - Sistema de Autenticación
Desarrollado con ❤️ usando React Native + Expo + TypeScript
