# Plan para Issue #11: Three.js Galería 360 Basic

**Fecha de Análisis**: 2025-07-18 18:41 (ACTUALIZADO: 2025-07-18 19:15)
**Estado del Issue**: OPEN
**Labels**: frontend, external-integration, priority: P3

## ⚠️ CORRECCIÓN CRÍTICA DEL APPROACH

**ANÁLISIS VISUAL**: Basado en screenshot proporcionado, el requerimiento real es:
- **Galería cilíndrica infinita** con marcos de imágenes dispuestos en círculo
- **Fondo plano estático** (NO imagen 360° equirectangular)
- **Navegación horizontal** para rotar alrededor del cilindro
- **Hotspots informativos** en cada marco con contenido específico

## Clasificación: SIMPLE (CORREGIDA de COMPLEJO)

**Criterios de Clasificación Aplicados:**
- **CSS 3D Transforms nativo**: No requiere dependencias externas
- **Patrón conocido**: Carrusel cilíndrico es implementación estándar
- **Performance superior**: CSS hardware-accelerated vs WebGL overhead
- **Mantenimiento sencillo**: CSS + JavaScript básico vs Three.js complejo
- **Mobile-first**: CSS 3D tiene mejor soporte y performance en móvil
- **Resultado**: SIMPLE porque es un carrusel 3D con tecnologías nativas del browser

## Análisis del Issue

**Descripción del Problema (CORREGIDA):**
Implementar galería cilíndrica infinita con marcos de imágenes rotando en disposición circular, navegación horizontal suave, hotspots informativos, e integración con Sala 4.

**Stack Tecnológico Detectado:**
- Framework/Lenguaje Principal: Next.js 15 + React 19 + TypeScript
- Infraestructura: AWS serverless (S3/CloudFront static hosting)
- Package Manager: npm (workspaces con Turborepo)
- Arquitectura: Static export SPA con client-side rendering
- UI Stack: shadcn/ui + Tailwind CSS v4

**Estado Actual:**
- Trabajo en progreso: No
- Archivos afectados: apps/client/src/components/gallery360/ (no existe aún)
- Issues similares: Ninguno
- No requiere dependencias externas nuevas

**Impacto:**
- Frontend: Sí (nueva funcionalidad, pero con tech stack existente)
- Backend: No (solo validación estado de sala)
- Infraestructura: No
- Bundle Size: No (CSS puro)

## Investigación y Approach

**Alternativas Evaluadas:**

| Enfoque | Complejidad | Mantenibilidad | Performance | Fit Arquitectura | Riesgo | Score |
|---------|-------------|----------------|-------------|------------------|--------|---------|
| CSS 3D Transforms | 2/5 | 5/5 | 5/5 | 5/5 | 1/5 | 18/25 |
| Three.js WebGL | 4/5 | 3/5 | 3/5 | 3/5 | 3/5 | 16/25 |
| Panolens.js Library | 2/5 | 4/5 | 4/5 | 2/5 | 2/5 | 14/25 |
| React Spring 3D | 3/5 | 4/5 | 4/5 | 4/5 | 2/5 | 17/25 |

**Approach Seleccionado:** CSS 3D Transforms (Score: 18/25)

**Justificación:**
Para una galería cilíndrica infinita con enfoque en performance móvil:
- **Performance nativo**: CSS 3D hardware-accelerated por el browser, sin overhead de WebGL
- **Bundle size cero**: No agrega dependencias externas al proyecto
- **Mobile-first**: Superior performance y battery life en dispositivos móviles
- **Accesibilidad**: Mejor soporte nativo para screen readers y keyboard navigation
- **Mantenibilidad**: CSS + JavaScript vanilla es más fácil de mantener que Three.js
- **Fit perfecto**: Para carruseles cilíndricos, CSS 3D es la solución estándar recomendada

**Tecnologías/Paquetes Recomendados:**
- **CSS 3D Transforms**: `transform-style: preserve-3d`, `perspective`, `rotateY()`
- **CSS Transitions**: Para animaciones suaves
- **React hooks**: `useState`, `useEffect`, `useRef` para manejo de estado
- **Tailwind CSS v4**: Para styling responsivo (ya disponible en el proyecto)
- **Intersection Observer**: Para lazy loading de imágenes fuera de vista

**Consideraciones Especiales:**
- **Performance Móvil**: `will-change: transform` para optimización GPU
- **Infinite Loop**: Reset matemático de rotación para sensación infinita
- **Touch/Swipe**: Event listeners para gestos móviles
- **Lazy Loading**: Intersection Observer para cargar solo imágenes visibles
- **Accessibility**: ARIA labels, keyboard navigation, reduced motion support
- **Responsive**: Adaptación de radio y número de elementos según viewport

## Strategy de Branching y Sub-Issues

**Basado en análisis de guía de contribuciones:**

### Rama Sencilla
- **Estrategia recomendada**: Rama sencilla por ser componente cohesivo y simple
- **Justificación**: CSS 3D + JavaScript básico no requiere trabajo paralelo

### Nombres de Ramas Específicos
- **Rama principal**: `feature/issue-11-css3d-cylindrical-gallery-infinite`

## Checklist de Implementación

### Preparación y Setup

- [ ] **Verificar soporte CSS 3D**: Validar que browsers target soportan CSS 3D Transforms
- [ ] **Crear estructura directorio**: apps/client/src/components/gallery360/
- [ ] **Preparar imágenes de prueba**: Conjunto de imágenes con aspect ratio consistente

### Creación de Estructura de Trabajo

**Validación de Estado de Versión:**
- [ ] **Verificar si ya se incrementó la versión**: Revisar package.json en la rama actual
- [ ] **Validar version bump necesario**: Solo incrementar si no se hizo en /start-work

**Rama sencilla (DEFAULT):**
- [ ] **Crear rama**: `feature/issue-11-css3d-cylindrical-gallery-infinite`
- [ ] **Version bump condicional**: Incrementar solo si no se hizo automáticamente en /start-work
  - [ ] **Verificar**: `git log --oneline | grep "bump version"` para ver si ya se hizo
  - [ ] **Incrementar solo si necesario**: Version bump incremental (ej: 0.3.11 → 0.4.0 para nueva feature)

### Implementación Core

**Implementación directa (Issue SIMPLE):**

- [ ] **Crear CylindricalGallery component**: Estructura base React con CSS 3D container
- [ ] **Implementar CSS 3D cylinder**: Transform-style preserve-3d + perspective + rotateY positioning
- [ ] **Sistema de navegación**: Touch/swipe handlers + keyboard arrow controls
- [ ] **Infinite loop logic**: Matemática circular para rotación continua
- [ ] **Image frames con hotspots**: Estructuras DOM para marcos + íconos informativos
- [ ] **Lazy loading**: Intersection Observer para performance
- [ ] **Responsive adaptation**: Media queries para mobile/tablet/desktop
- [ ] **Accessibility features**: ARIA, keyboard nav, reduced motion

### Integración y Finalización

- [ ] **Integración con Sala 4**: Routing Next.js + validación estado de sala
- [ ] **Testing responsivo**: Validar en mobile, tablet, desktop
- [ ] **Performance testing**: Verificar 60fps en dispositivos móviles
- [ ] **Accesibilidad testing**: Keyboard navigation + screen reader
- [ ] **Cross-browser testing**: Safari, Chrome, Firefox, Edge
- [ ] **Commit final**: Una vez todas las validaciones pasan

### Pruebas del Proyecto (Según Documentación)

**CRÍTICO**: Ejecutar comandos de prueba definidos en la documentación del proyecto

- [ ] **Lint**: `npm run lint` - Validar código cumple estándares
- [ ] **Type Check**: `npm run type-check` - Verificar tipos TypeScript
- [ ] **Build**: `npm run build` - Confirmar build exitoso
- [ ] **Tests unitarios**: `npm run test` - Ejecutar suite de pruebas
- [ ] **E2E Tests**: `npm run test:e2e` - Validar flujo completo si definido
- [ ] **Export test**: `npm run export` - Validar static export funciona
- [ ] **Commit solo si todas las pruebas pasan**: No avanzar con pruebas fallidas

### Documentación y Validación

**Documentación concisa (solo si necesario):**
- [ ] **Documentar props component**: TypeScript interfaces para configuración
- [ ] **Ejemplos de uso**: Casos de uso específicos del proyecto
- [ ] **Performance notes**: Recomendaciones para optimización si aplicables

### Compliance Final

- [ ] **Version bump final condicional**: Solo si no se hizo previamente
- [ ] **Testing final pasa correctamente**: Ejecutar suite completa de pruebas
- [ ] **Commit final**: Solo después de que todas las validaciones pasan

## Criterios de Aceptación
- [ ] Galería cilíndrica con marcos de imágenes en disposición circular
- [ ] Navegación horizontal suave (touch/swipe + keyboard)
- [ ] Rotación infinita sin saltos visuales
- [ ] Hotspots informativos funcionales en cada marco
- [ ] Integración con Sala 4 mediante routing Next.js
- [ ] Validación de estado de sala antes de acceso
- [ ] Performance 60fps en dispositivos móviles
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Accesibilidad completa (keyboard + screen reader)
- [ ] Tests pasan correctamente sin degradación
- [ ] Build y export estático funcionan

## Estructura de Archivos

```
apps/client/src/components/gallery360/
├── CylindricalGallery.tsx          # Componente principal
├── CylindricalGallery.module.css   # CSS 3D styles
├── GalleryFrame.tsx                # Componente individual frame
├── GalleryHotspot.tsx              # Hotspot informativo
├── hooks/
│   ├── useInfiniteRotation.ts      # Lógica rotación infinita
│   ├── useSwipeNavigation.ts       # Touch/swipe gestures
│   └── useLazyLoading.ts           # Intersection Observer
├── types/
│   └── gallery.ts                  # TypeScript interfaces
└── index.ts                        # Exportaciones
```

## Implementación CSS 3D Core

```css
.cylindrical-gallery {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.gallery-container {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
  will-change: transform;
}

.gallery-frame {
  position: absolute;
  transform-style: preserve-3d;
  /* Posicionamiento calculado con rotateY() y translateZ() */
}
```

## Riesgos Identificados
1. **Browser compatibility**: CSS 3D puede tener limitaciones en browsers antiguos - Mitigación: feature detection + fallback 2D
2. **Performance en dispositivos antiguos**: Animaciones 3D pueden ser pesadas - Mitigación: reduced motion detection + optimizaciones CSS
3. **Touch gestures conflictos**: Puede interferir con navegación del browser - Mitigación: preventDefault controlado + gesture boundaries
4. **Memory leaks con imágenes**: Lazy loading mal implementado - Mitigación: cleanup proper en useEffect + Intersection Observer

## Estimación
- **Complejidad**: 2/5 - Simple (CSS 3D + JavaScript básico)
- **Dependencias Bloqueantes**: Ninguna (tecnologías nativas browser)

## Para Continuar

**Opción 1 - Trabajar directamente con Claude:**
1. Copiar el contenido completo de este archivo de plan
2. En una nueva conversación con Claude, decir: 
   ```
   "Vamos a implementar el issue #11 según este plan detallado actualizado:"
   ```
3. Pegar el contenido del plan para que Claude lo ejecute paso a paso

**Opción 2 - Usar flujo automatizado:**
```
/start-work .claude/artifact-temp/issue-plan-11.md
```

**REFERENCIAS DE ARCHIVO:**
- **Plan guardado en**: `.claude/artifact-temp/issue-plan-11.md`
- **Para adjuntar**: Copiar contenido del archivo y pegarlo en el contexto de Claude
- **Ubicación**: Proyecto actual, no en carpeta personal del usuario

## Referencias
- Issue Original: https://github.com/QuatioDevelop/sura-esenciafest-2025/issues/11
- Documentación Consultada: 
  - CSS 3D Transforms MDN documentation
  - Next.js 15 + CSS 3D integration guides
  - Mobile performance best practices for CSS animations
- Screenshot de Referencia: `/home/a-pedraza/screenshots/Screenshot 2025-07-17 232342.png`
- Approach Research: CSS 3D vs Three.js performance comparison para mobile