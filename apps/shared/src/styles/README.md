# SURA Esencia Fest 2025 - Design System

Sistema de diseño centralizado con tokens de diseño y sistema de temas para las aplicaciones client y admin.

## 🎨 Características

- **Fuentes SuraSans**: Sistema tipográfico corporativo de SURA
- **Tokens de diseño**: Colores, tipografía y espaciado centralizados
- **Sistema de temas**: Variantes client (azul) y admin (rojo) - **TEMPORALES, pendientes de ajustar con diseños finales**
- **Componentes migrados**: BrandButton, BrandHeader, Card, Input
- **TypeScript**: Tipado completo para todos los tokens

## 📁 Estructura

```
src/styles/
├── fonts/
│   ├── fonts.css           # Declaraciones @font-face para SuraSans
│   └── *.otf              # Archivos de fuentes SuraSans
├── tokens/
│   ├── colors.ts          # Paleta de colores y tokens semánticos
│   ├── typography.ts      # Escalas tipográficas y configuración
│   ├── spacing.ts         # Sistema de espaciado y tokens semánticos
│   └── index.ts           # Exportación centralizada de tokens
├── themes/
│   ├── client.ts          # Tema azul para aplicación cliente (TEMPORAL)
│   ├── admin.ts           # Tema rojo para aplicación admin (TEMPORAL)
│   └── index.ts           # Exportación de temas
└── index.ts               # Exportación principal del sistema
```

## 🚀 Uso

### Importar tokens

```tsx
import { colors, typography, spacing } from '@sura-esenciafest/shared'

// O específicamente
import { colors } from '@sura-esenciafest/shared/styles/tokens/colors'
```

### Usar temas en componentes

```tsx
import { clientTheme, adminTheme } from '@sura-esenciafest/shared'

const MyComponent = ({ variant = 'client' }) => {
  const theme = variant === 'client' ? clientTheme : adminTheme
  
  return (
    <div style={{ backgroundColor: theme.colors.primary }}>
      Content
    </div>
  )
}
```

### Aplicar fuentes SuraSans

```tsx
// Los componentes migrados ya incluyen SuraSans automáticamente
<BrandButton>Texto con SuraSans</BrandButton>

// Para componentes custom
<div style={{ fontFamily: typography.fontFamily.sura.join(', ') }}>
  Texto con SuraSans
</div>
```

## 🎯 Componentes Migrados

### BrandButton
- ✅ Usa SuraSans como fuente principal
- ✅ Colores desde tokens de diseño
- ✅ Soporte para variants client/admin

### BrandHeader  
- ✅ Usa SuraSans para títulos y subtítulos
- ✅ Colores de fondo desde tokens
- ✅ Tamaños tipográficos desde tokens

### Card
- ✅ Usa SuraSans como fuente base
- ✅ Colores y bordes desde tokens
- ✅ CardTitle con escalas tipográficas correctas

### Input
- ✅ Usa SuraSans como fuente
- ✅ Colores y bordes desde tokens
- ✅ Tamaños tipográficos consistentes

## 📋 Tokens Disponibles

### Colores
- `colors.client.*` - Paleta azul para aplicación cliente ⚠️ **TEMPORAL**
- `colors.admin.*` - Paleta roja para aplicación admin ⚠️ **TEMPORAL**
- `colors.gray.*` - Escala de grises (50-950)
- `colors.background.*` - Fondos (primary, secondary, tertiary)
- `colors.text.*` - Textos (primary, secondary, muted)

> **⚠️ NOTA IMPORTANTE**: Los colores de temas client (azul) y admin (rojo) son temporales para development. Serán reemplazados con la paleta de colores oficial de SURA una vez se definan los diseños finales.

### Tipografía
- `typography.fontFamily.sura` - Familia SuraSans con fallbacks
- `typography.fontSize.*` - Escalas de tamaño (xs a 9xl)
- `typography.fontWeight.*` - Pesos (light: 300, regular: 400, bold: 700, black: 900)

### Espaciado
- `spacing.*` - Escala base (0 a 96)
- `semanticSpacing.component.*` - Espaciado de componentes (xs a 2xl)
- `semanticSpacing.layout.*` - Espaciado de layouts (xs a 2xl)

## ✅ Validaciones

El sistema ha sido probado con:
- **Lint**: Sin errores ESLint
- **Type-check**: Sin errores TypeScript  
- **Build**: Compilación exitosa en client y admin
- **Browser testing**: Verificado funcionamiento en ambas apps

### Resultados de pruebas:
- ✅ Cliente (puerto 3000): BrandButton con SuraSans y color azul correcto
- ✅ Admin (puerto 3001): Botones con SuraSans y color rojo correcto
- ✅ Fuentes cargan correctamente en ambas aplicaciones

## 🔧 Integración con Tailwind

El sistema está diseñado para trabajar junto con Tailwind CSS v4 existente:
- Los tokens complementan las utilidades de Tailwind
- Los componentes combinan clases Tailwind con estilos inline para tokens específicos
- Las fuentes SuraSans se aplican via JavaScript para máxima compatibilidad

## 📝 Próximos pasos

### 🎨 **CRÍTICO - Actualización de Temas (Pendiente diseños finales):**
1. **Reemplazar colores temporales**: Actualizar `colors.client.*` y `colors.admin.*` con paleta oficial de SURA
2. **Validar con diseños**: Ajustar tokens según especificaciones de diseño final
3. **Migrar componentes**: Actualizar todos los componentes que usan los colores temporales
4. **Testing visual**: Verificar que los cambios no rompan la UI existente

### 🔧 **Mejoras del Sistema:**
5. **Configurar Tailwind**: Integrar tokens en configuración de Tailwind CSS
6. **Componentes adicionales**: Migrar Button y otros componentes shadcn/ui
7. **CSS Variables**: Implementar sistema de variables CSS para temas dinámicos
8. **Documentación Storybook**: Crear documentación interactiva de componentes