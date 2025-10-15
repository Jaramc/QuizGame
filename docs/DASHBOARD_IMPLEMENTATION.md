# Dashboard - Implementación

## 📋 Descripción General

El dashboard es la interfaz principal de la aplicación después del inicio de sesión. Utiliza navegación por pestañas (tabs) con 4 pantallas principales y está construido con Expo Router.

---

## 🏗️ Estructura de Archivos

```
app/
└── (dashboard)/              # Carpeta con paréntesis para tabs en Expo Router
    ├── _layout.tsx          # Configuración de navegación por tabs
    ├── index.tsx            # Pantalla de Inicio (Home)
    ├── play.tsx             # Pantalla de Jugar
    ├── ranking.tsx          # Pantalla de Ranking
    └── profile.tsx          # Pantalla de Perfil
```

### ⚠️ Importante: Convención de Nombres
- La carpeta se llama `(dashboard)` con paréntesis
- Esto permite a Expo Router reconocerla como un grupo de pestañas
- Sin paréntesis, las rutas no funcionarían correctamente

---

## 🎯 Funcionalidades Implementadas

### 1. **Navegación por Pestañas** (`_layout.tsx`)

#### Características:
- 4 pestañas con iconos personalizados
- Estilo personalizado con colores del tema
- Barra de navegación posicionada en la parte inferior
- Altura optimizada para evitar interferencia con el contenido

#### Configuración:
```typescript
tabBarStyle: {
  backgroundColor: Colors.card,
  borderTopWidth: 1,
  borderTopColor: Colors.border,
  height: 65,
  paddingBottom: 10,
  paddingTop: 5,
  position: 'absolute',
  bottom: 0,
}
```

#### Pestañas:
1. **Inicio** - Icono: `home`
2. **Jugar** - Icono: `game-controller`
3. **Ranking** - Icono: `trophy`
4. **Perfil** - Icono: `person`

---

### 2. **Pantalla de Inicio** (`index.tsx`)

#### Secciones:
1. **Header**
   - Saludo personalizado con nombre de usuario
   - Botón de cierre de sesión

2. **Tarjetas de Estadísticas** (4 Cards)
   - 🏆 Partidas Ganadas (naranja)
   - ⭐ Puntos Totales (turquesa)
   - 🔥 Racha (amarillo)
   - ✅ Precisión (verde)

3. **Acciones Rápidas** (3 Botones)
   - Jugar Ahora → Navega a `/(dashboard)/play`
   - Ver Ranking → Navega a `/(dashboard)/ranking`
   - Mi Perfil → Navega a `/(dashboard)/profile`

4. **Categorías** (Scroll Horizontal)
   - Arte (rosado)
   - Ciencia (azul)
   - Deportes (naranja)
   - Entretenimiento (magenta)
   - Geografía (verde)
   - Historia (amarillo oscuro)

#### Animaciones:
- Entrada animada con `react-native-animatable`
- Delays escalonados para efecto cascada
- Duraciones: 800ms

#### Estilo de Scroll:
```typescript
scrollContent: {
  paddingBottom: 100, // Evita que la barra tape el contenido
}
```

---

### 3. **Pantalla de Jugar** (`play.tsx`)

#### Secciones:
1. **Header**
   - Título: "¡A Jugar!"
   - Subtítulo motivacional

2. **Modos de Juego** (3 Cards)
   - 🎮 **Modo Clásico**
     - Color: Naranja primario
     - Descripción: Tiempo ilimitado, máxima precisión
   
   - ⏱️ **Contrarreloj**
     - Color: Rojo
     - Descripción: Responde antes que termine el tiempo
   
   - 👥 **Multijugador**
     - Color: Púrpura
     - Descripción: Desafía a otros jugadores

3. **Categorías** (Grid 2 columnas)
   - Mismas categorías que en inicio
   - Diseño de cuadrícula responsive

#### Animaciones:
- Delays: 200ms, 400ms, 600ms para los modos
- Entrada desde abajo (fadeInUp)

---

### 4. **Pantalla de Ranking** (`ranking.tsx`)

#### Secciones:
1. **Header**
   - Título: "🏆 Ranking Global"
   - Subtítulo: "Los mejores jugadores"

2. **Podio Top 3**
   - Diseño especial para primeros 3 lugares
   - Trofeos dorados, plateados y bronce
   - Elevación visual del 1er lugar
   - Animación de entrada (bounceIn)

3. **Lista Top 10**
   - Tarjetas con avatar, nombre, puntos y posición
   - Trofeos para top 3
   - Números para posiciones 4-10
   - Separador sutil entre tarjetas

4. **Tu Posición** (Card especial)
   - Fondo degradado
   - Posición destacada del usuario
   - Mensaje motivacional

#### Mock Data:
```typescript
const topPlayers = [
  { id: 1, username: 'ProPlayer123', points: 15420, position: 1 },
  { id: 2, username: 'QuizMaster', points: 14850, position: 2 },
  // ... hasta 10 jugadores
];
```

---

### 5. **Pantalla de Perfil** (`profile.tsx`)

#### Secciones:
1. **Header del Perfil**
   - Avatar circular con borde degradado
   - Icono de editar en esquina superior derecha
   - Nombre de usuario
   - Email del usuario

2. **Estadísticas Personales** (4 Cards)
   - Layout 2x2
   - Total de Partidas
   - Nivel actual
   - Tasa de Victorias
   - Puntuación Total

3. **Menú de Opciones** (6 Items)
   - ⚙️ Configuración
   - 📊 Estadísticas Detalladas
   - 🏆 Logros
   - 🎨 Personalización
   - ℹ️ Acerca de
   - 🚪 Cerrar Sesión (con Alert de confirmación)

4. **Versión de la App**
   - Footer con número de versión: "v1.0.0"

#### Alert de Confirmación:
```typescript
Alert.alert(
  'Cerrar Sesión',
  '¿Estás seguro que deseas cerrar sesión?',
  [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Cerrar Sesión', style: 'destructive', onPress: logout }
  ]
);
```

---

## 🎨 Sistema de Colores

### Colores de Categorías:
```typescript
Colors.category = {
  art: '#E91E63',        // Rosa
  science: '#2196F3',    // Azul
  sports: '#FF9800',     // Naranja
  entertainment: '#9C27B0', // Púrpura
  geography: '#4CAF50',  // Verde
  history: '#FF6B35',    // Naranja oscuro
}
```

### Colores Base:
- **Primary**: `#FF6B35` (Naranja)
- **Success**: `#10B981` (Verde)
- **Accent**: `#FFD60A` (Amarillo)
- **Background**: `#F5F5F5` (Gris claro)
- **Card**: `#FFFFFF` (Blanco)

---

## 📐 Layout y Espaciado

### SafeAreaView:
```typescript
<SafeAreaView style={styles.safeArea} edges={['top']}>
```
- Solo aplica padding superior
- La barra de navegación gestiona el padding inferior

### ScrollView:
```typescript
<ScrollView 
  style={styles.container}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>
```

### Estilos de Padding:
```typescript
container: {
  flex: 1,
  paddingBottom: 80, // Espacio para barra de navegación
}

scrollContent: {
  paddingBottom: 100, // Padding adicional al final
}
```

**Razón**: Evita que la barra de navegación tape el contenido al hacer scroll hasta el final.

---

## 🔄 Navegación y Rutas

### Rutas Implementadas:

#### Desde Login/Welcome:
```typescript
router.replace('/(dashboard)');  // Redirige al dashboard
```

#### Navegación Interna:
```typescript
router.push('/(dashboard)/play');     // A pantalla de Jugar
router.push('/(dashboard)/ranking');  // A pantalla de Ranking
router.push('/(dashboard)/profile');  // A pantalla de Perfil
```

#### Cierre de Sesión:
```typescript
await logout();
router.replace('/auth/welcome');  // Regresa a pantalla de bienvenida
```

### Configuración en Root Layout:
```typescript
// app/_layout.tsx
<Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
```

---

## 🎭 Animaciones

### Biblioteca:
- `react-native-animatable`

### Tipos de Animaciones Usadas:
```typescript
animation="fadeInDown"  // Header
animation="fadeInUp"    // Contenido
animation="bounceIn"    // Elementos especiales (podio)
```

### Configuración:
```typescript
duration={800}    // Duración en milisegundos
delay={200}       // Retraso antes de iniciar
```

---

## 🔧 Problemas Resueltos

### 1. Error "Unmatched Route"
**Problema**: Al hacer login, mostraba error de ruta no encontrada.

**Solución**:
- Renombrar carpeta de `dashboard` a `(dashboard)`
- Actualizar rutas en `useLoginForm.ts` y `welcome.tsx`
- Actualizar Stack.Screen en `_layout.tsx`

### 2. Contenido Tapado por Barra de Navegación
**Problema**: Las categorías y contenido inferior quedaban tapados por la barra de tabs.

**Solución**:
```typescript
// En tabBarStyle
position: 'absolute',
bottom: 0,

// En cada pantalla
container: {
  paddingBottom: 80,
}
scrollContent: {
  paddingBottom: 100,
}

// En index.tsx categorías
categoriesScroll: {
  marginBottom: 100,
}
```

### 3. TypeScript Errors en Rutas
**Problema**: TypeScript no reconocía las nuevas rutas con paréntesis.

**Solución**:
```bash
npx expo customize tsconfig.json
npx expo start --clear
```
Esto regenera los tipos de rutas automáticamente.

---

## 📦 Dependencias Utilizadas

```json
{
  "expo-router": "Navegación file-based",
  "react-native-animatable": "Animaciones",
  "@expo/vector-icons": "Iconos (Ionicons)",
  "react-native-safe-area-context": "SafeAreaView",
  "expo-linear-gradient": "Gradientes (futuro)"
}
```

---

## ✅ Checklist de Implementación

- [x] Crear carpeta `(dashboard)` con paréntesis
- [x] Configurar `_layout.tsx` con Tabs
- [x] Implementar pantalla de Inicio con estadísticas
- [x] Implementar pantalla de Jugar con modos
- [x] Implementar pantalla de Ranking con podio
- [x] Implementar pantalla de Perfil con opciones
- [x] Configurar navegación entre pantallas
- [x] Ajustar estilos para barra de navegación
- [x] Agregar animaciones de entrada
- [x] Resolver problemas de padding/scroll
- [x] Actualizar rutas en hooks de autenticación
- [x] Probar flujo completo de login → dashboard
- [x] Probar cierre de sesión
- [x] Verificar responsive en diferentes tamaños

---

## 🚀 Próximos Pasos Sugeridos

1. **Conectar con Backend**
   - Obtener estadísticas reales del usuario
   - Obtener ranking real de la base de datos
   - Actualizar perfil en tiempo real

2. **Implementar Lógica de Juego**
   - Crear pantallas de juego para cada modo
   - Sistema de preguntas y respuestas
   - Temporizador para modo contrarreloj
   - Sistema multijugador

3. **Agregar Funcionalidades**
   - Edición de perfil
   - Cambio de avatar
   - Sistema de logros
   - Historial de partidas
   - Notificaciones

4. **Optimizaciones**
   - Cacheo de datos
   - Carga lazy de imágenes
   - Optimización de animaciones
   - Mejora de performance en listas largas

5. **Testing**
   - Tests unitarios para componentes
   - Tests de integración para flujos
   - Tests E2E para navegación

---

## 📝 Notas Adicionales

### Convenciones de Código:
- Uso de TypeScript estricto
- Componentes funcionales con hooks
- Estilos con StyleSheet.create()
- Colores centralizados en `@/styles/colors`
- Imports organizados alfabéticamente

### Performance:
- Todos los estilos están memoizados con StyleSheet
- ScrollViews optimizados con `showsVerticalScrollIndicator={false}`
- Animaciones con duración < 1 segundo para fluidez

### Accesibilidad:
- Uso de `TouchableOpacity` con `activeOpacity={0.7}`
- Textos legibles con buen contraste
- Iconos con tamaño mínimo de 24px
- Áreas de toque mínimas de 48x48

---

**Documentación creada**: Octubre 2025  
**Versión**: 1.0.0  
**Autor**: GitHub Copilot
