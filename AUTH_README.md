# 🎮 QuizGame - Sistema de Autenticación

## 📋 Descripción

Sistema de autenticación completo para QuizGame, inspirado en la app Preguntados, desarrollado con React Native, Expo y TypeScript siguiendo las mejores prácticas de desarrollo.

## ✨ Características Implementadas

### 🔐 Autenticación
- ✅ Registro de usuarios con validación
- ✅ Login con email y contraseña
- ✅ Persistencia de sesión con AsyncStorage
- ✅ Logout funcional
- ✅ Rutas protegidas

### 🎨 UI/UX
- ✅ Animaciones fluidas con react-native-animatable
- ✅ Diseño moderno inspirado en Preguntados
- ✅ Inputs personalizados con validación en tiempo real
- ✅ Botones con estados de loading
- ✅ Manejo de errores visual
- ✅ Teclado adaptativo

### 🏗️ Arquitectura

```
app/
├── auth/                    # Pantallas de autenticación
│   ├── welcome.tsx         # Pantalla de bienvenida
│   ├── login.tsx           # Pantalla de login
│   └── register.tsx        # Pantalla de registro
├── (tabs)/                 # Navegación principal
│   └── index.tsx           # Home con perfil de usuario
├── _layout.tsx             # Layout principal con AuthProvider
└── index.tsx               # Punto de entrada y redirección

components/
└── auth/                   # Componentes reutilizables de auth
    ├── AuthInput.tsx       # Input personalizado
    └── AuthButton.tsx      # Botón personalizado

contexts/
└── AuthContext.tsx         # Context global de autenticación

hooks/
└── useAuth.ts              # Hook para acceder al contexto

styles/
├── colors.ts               # Sistema de colores
└── auth.styles.ts          # Estilos de autenticación

types/
└── auth.types.ts           # Tipos TypeScript
```

## 🎯 Buenas Prácticas Aplicadas

### 1. **Separación de Responsabilidades**
- Lógica separada en Context (`AuthContext.tsx`)
- Estilos en archivos dedicados (`auth.styles.ts`, `colors.ts`)
- Tipos en archivos TypeScript dedicados (`auth.types.ts`)
- Componentes reutilizables (`AuthInput`, `AuthButton`)

### 2. **Código Modular y Escalable**
- Componentes pequeños y enfocados
- Custom hooks para encapsular lógica (`useAuth`)
- Validaciones centralizadas
- Fácil extensión para APIs reales

### 3. **TypeScript**
- Tipado fuerte en toda la aplicación
- Interfaces bien definidas
- Autocompletado y detección de errores

### 4. **Performance**
- Lazy loading de pantallas
- Optimización de re-renders
- Persistencia eficiente con AsyncStorage

## 🚀 Cómo Funciona

### Flujo de Autenticación

1. **Inicio**: `app/index.tsx` verifica si hay usuario autenticado
2. **No autenticado**: Redirige a `welcome.tsx`
3. **Login/Register**: Usuario completa el formulario
4. **Validación**: Se validan los datos del formulario
5. **Autenticación**: Se guarda en AsyncStorage
6. **Redirección**: Se redirige a la app principal
7. **Persistencia**: Al reabrir la app, mantiene la sesión

### Uso del Hook useAuth

```typescript
import { useAuth } from '@/hooks/useAuth';

function MiComponente() {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  
  // Usar las funciones de autenticación
}
```

## 🎨 Sistema de Colores

Paleta de colores inspirada en Preguntados:

```typescript
{
  primary: '#FF6B35',      // Naranja vibrante
  secondary: '#4ECDC4',    // Turquesa
  accent: '#FFE66D',       // Amarillo
  
  // Categorías
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
