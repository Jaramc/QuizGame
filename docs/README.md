# 📚 Documentación del Proyecto QuizGame

Bienvenido a la documentación de QuizGame, una aplicación móvil de trivia construida con React Native y Expo.

---

## 📖 Guías Disponibles

### 🔥 [Firebase Setup - Guía Completa](./FIREBASE_SETUP.md)
Configuración paso a paso de Firebase Authentication para el sistema de registro e inicio de sesión.

**Incluye:**
- Creación del proyecto en Firebase Console
- Configuración de Authentication con Email/Password
- Integración con React Native
- Troubleshooting de errores comunes

---

## 🏗️ Arquitectura del Proyecto

```
quizgame/
├── app/                      # Navegación y pantallas (Expo Router)
│   ├── auth/                # Pantallas de autenticación
│   │   ├── welcome.tsx     # Pantalla de bienvenida
│   │   ├── login.tsx       # Inicio de sesión
│   │   └── register.tsx    # Registro de usuario
│   ├── _layout.tsx         # Layout principal con AuthProvider
│   └── index.tsx           # Pantalla home
│
├── components/              # Componentes reutilizables
│   ├── auth/               # Componentes de autenticación
│   │   ├── AuthButton.tsx  # Botón personalizado
│   │   └── AuthInput.tsx   # Input personalizado
│   └── ui/                 # Componentes UI generales
│
├── config/                  # Configuraciones
│   └── firebase.ts         # Configuración de Firebase
│
├── contexts/                # Contexts de React
│   └── auth/               # Context de autenticación
│       ├── AuthContext.tsx # Provider y lógica de auth
│       └── index.ts        # Barrel export
│
├── hooks/                   # Custom hooks
│   └── auth/               # Hooks de autenticación
│       ├── useAuth.ts      # Hook principal de auth
│       ├── useLoginForm.ts # Hook para formulario login
│       └── useRegisterForm.ts # Hook para formulario registro
│
├── services/                # Servicios y APIs
│   └── auth/               # Servicio de autenticación
│       ├── authService.ts  # Integración con Firebase Auth
│       └── index.ts        # Barrel export
│
├── styles/                  # Estilos
│   ├── auth/               # Estilos de autenticación
│   │   ├── auth.styles.ts  # Estilos de forms
│   │   └── welcome.styles.ts # Estilos de welcome
│   └── colors.ts           # Paleta de colores
│
├── types/                   # TypeScript types
│   └── auth/               # Types de autenticación
│       ├── auth.types.ts   # Interfaces de User, Credentials, etc.
│       └── index.ts        # Barrel export
│
├── android/                 # Proyecto Android nativo
└── docs/                    # 📚 Documentación (esta carpeta)
```

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **React Native** - Framework para apps móviles
- **Expo** - Toolchain y SDK
- **Expo Router** - Sistema de navegación basado en archivos
- **TypeScript** - Type safety

### Backend & Services
- **Firebase Authentication** - Sistema de autenticación
- **@react-native-firebase** - SDK nativo de Firebase

### State Management
- **React Context API** - Gestión de estado global
- **Custom Hooks** - Lógica reutilizable

### Storage
- **AsyncStorage** - Almacenamiento local

---

## 🚀 Quick Start

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar Firebase (ver guía)
# Editar: config/firebase.ts con tus credenciales

# Ejecutar en Android
npx expo run:android

# Ejecutar en desarrollo con Metro
npm start
```

### Configuración Requerida

1. **Firebase Setup**: Sigue la [guía de Firebase](./FIREBASE_SETUP.md)
2. **Credenciales**: Actualiza `config/firebase.ts`
3. **Google Services**: Descarga `google-services.json` a `android/app/`

---

## 📱 Características Implementadas

### ✅ Autenticación
- [x] Registro con email y contraseña
- [x] Login con email y contraseña
- [x] Logout
- [x] Persistencia de sesión
- [x] Validación de formularios
- [x] Manejo de errores

### 🔜 Próximamente
- [ ] Reset de contraseña
- [ ] Verificación de email
- [ ] Login social (Google, Facebook)
- [ ] Quiz game funcionalidad
- [ ] Sistema de puntajes
- [ ] Ranking de usuarios

---

## 🧪 Testing

```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Build Android
cd android && ./gradlew assembleRelease
```

---

## 📝 Convenciones del Código

### Estructura de Archivos
- **Organización por feature** (auth, quiz, profile, etc.)
- **Barrel exports** (index.ts en cada carpeta)
- **Co-location** (estilos junto a componentes)

### Naming
- **Componentes**: PascalCase (`AuthButton.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Types**: PascalCase (`User`, `LoginCredentials`)
- **Constantes**: UPPER_SNAKE_CASE (`FIREBASE_CONFIG`)

### TypeScript
- Interfaces para tipos de datos (`User`, `AuthState`)
- Types para utilidades y helpers
- Strict mode habilitado

---

## 🤝 Contribución

### Flujo de Trabajo
1. Crear feature branch: `git checkout -b feature/nombre`
2. Hacer cambios y commits
3. Push y crear Pull Request
4. Code review
5. Merge a main

### Commits
Usar conventional commits:
```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorización de código
test: agregar tests
```

---

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

---

## 👤 Autor

**Jaramc**
- GitHub: [@Jaramc](https://github.com/Jaramc)

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la [guía de Firebase](./FIREBASE_SETUP.md)
2. Verifica la sección de Troubleshooting
3. Abre un issue en el repositorio

---

**Última actualización**: Octubre 2025
