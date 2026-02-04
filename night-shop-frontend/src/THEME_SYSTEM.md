# Sistema de Temas Dinámicos - Night Shop

## 📋 Descripción General

El sistema de temas permite a los usuarios cambiar entre modo claro/oscuro y personalizar todos los colores de la aplicación. Las preferencias se guardan automáticamente en localStorage.

## 🎨 Características

### 1. Modo Claro/Oscuro
- Toggle en el personalizador de temas
- Cambio automático de paleta de colores
- Persistencia de preferencia

### 2. Personalización de Colores
Los usuarios pueden modificar 6 colores principales:
- **Primary**: Color primario (botones, enlaces, etc.)
- **Secondary**: Color secundario (acentos)
- **Success**: Color de éxito (confirmaciones)
- **Warning**: Color de advertencia
- **Error**: Color de error
- **Info**: Color de información

### 3. Persistencia
Las preferencias se guardan en `localStorage` bajo la clave `themePreferences`:
```json
{
  "mode": "light",
  "colors": {
    "primary": "#1976d2",
    "secondary": "#dc004e",
    "success": "#4caf50",
    "warning": "#ff9800",
    "error": "#f44336",
    "info": "#2196f3"
  }
}
```

## 🔧 Componentes Principales

### ThemeContext.tsx
- Gestiona el estado del tema
- Proporciona funciones para cambiar modo y colores
- Crea el tema de MUI dinámicamente
- Hook: `useThemeContext()`

### ThemeCustomizer.tsx
- Interfaz para personalizar temas
- Color picker para cada color
- Vista previa de colores
- Botón para restaurar valores por defecto
- Ubicado en la barra de herramientas (MainLayout)

### EnhancedTable.tsx
- Tabla mejorada con striping
- Hover effects suave
- Responsive y accesible
- Soporta renderizado personalizado

### EnhancedCard.tsx
- Card mejorada con gradientes
- Animaciones suaves
- Soporte para modo claro/oscuro
- Efecto glassmorphism

## 🎯 Cómo Usar

### Para cambiar el tema:
1. Haz clic en el icono de engranaje (⚙️) en la barra superior
2. Selecciona modo claro/oscuro
3. Personaliza los colores usando los color pickers
4. Haz clic en "Guardar Cambios"

### Para restaurar valores por defecto:
1. Abre el personalizador de temas
2. Haz clic en "Restaurar"

### Para usar en componentes:
```tsx
import { useThemeContext } from '../context/ThemeContext';

const MyComponent = () => {
  const { preferences, setColors, setMode } = useThemeContext();
  
  return (
    <Box sx={{ color: preferences.colors.primary }}>
      Contenido
    </Box>
  );
};
```

## 🎨 Colores por Defecto

### Modo Claro
- Primary: #1976d2 (Azul)
- Secondary: #dc004e (Rosa)
- Success: #4caf50 (Verde)
- Warning: #ff9800 (Naranja)
- Error: #f44336 (Rojo)
- Info: #2196f3 (Azul claro)

### Modo Oscuro
- Primary: #90caf9 (Azul claro)
- Secondary: #f48fb1 (Rosa claro)
- Success: #81c784 (Verde claro)
- Warning: #ffb74d (Naranja claro)
- Error: #ef5350 (Rojo claro)
- Info: #64b5f6 (Azul más claro)

## 🚀 Mejoras Visuales Implementadas

### Dashboard
- KPIs con gradientes dinámicos
- Animaciones de hover (translateY)
- Sombras adaptadas al modo
- Colores basados en el tema

### Tablas
- Striping alternado
- Hover effects mejorados
- Tipografía mejorada
- Bordes sutiles

### Componentes Generales
- Transiciones suaves (0.3s)
- Sombras sofisticadas
- Efectos glassmorphism en cards
- Mejor contraste en modo oscuro

## 📱 Responsive Design
- Todos los componentes son responsive
- Funciona en móvil, tablet y desktop
- Temas se adaptan a diferentes tamaños de pantalla

## 🔄 Flujo de Actualización

1. Usuario abre el personalizador
2. Modifica colores/modo
3. Cambios se aplican inmediatamente en la UI
4. Se guardan en localStorage
5. Al recargar, se restauran automáticamente
