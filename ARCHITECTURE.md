# Arquitectura Visual AulaCore

## 📋 Descripción General

AulaCore es una plataforma profesional de gestión educativa institucional construida con:

- **Frontend**: Next.js 16 + TypeScript
- **UI**: Tailwind CSS + Shadcn/UI
- **Iconos**: Lucide React

## 🏗️ Estructura de Componentes

### `/src/components/layout`

#### `app-layout.tsx`
Componente envolvente principal que integra Sidebar, Header y contenido.

**Props:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole; // rector, director_grupo, docente, secretaria, padre_familia
  userName?: string;
}
```

**Uso:**
```tsx
<AppLayout userRole="rector" userName="Dr. García">
  {children}
</AppLayout>
```

#### `sidebar-updated.tsx`
Barra lateral con navegación dinámica según el rol del usuario.

**Features:**
- Logo AulaCore interactivo
- Menú dinámico según rol
- Indicador de ruta activa
- Badges de notificaciones
- Botón de cerrar sesión

#### `header-new.tsx`
Encabezado con información del usuario, selector de período académico y notificaciones.

**Features:**
- Barra de búsqueda
- Selector de período académico
- Campana de notificaciones
- Menú desplegable de usuario
- Mostrar rol del usuario

### `/src/lib/navigation.ts`

Sistema de navegación centralizado con soporte para múltiples roles.

**Roles Soportados:**
1. **rector** - Acceso completo al sistema
2. **director_grupo** - Gestión de su grupo
3. **docente** - Gestión de cursos y notas
4. **secretaria** - Soporte administrativo
5. **padre_familia** - Seguimiento de hijo/a

**Estructura:**
```typescript
export const NAVIGATION_MENUS: Record<UserRole, NavItem[]> = {
  rector: [...],
  director_grupo: [...],
  docente: [...],
  secretaria: [...],
  padre_familia: [...]
}
```

## 🎨 Diseño y Colores

### Paleta de Colores
- **Sidebar**: Gradient de Slate (900->950)
- **Accent**: Azul 600 (Links, Active states)
- **Fondo**: Slate 50 a 100
- **Texto**: Slate 900 (headings), Slate 600-700 (body)

### Componentes Shadcn/UI Utilizados
- Button
- Card
- Input
- DropdownMenu
- Form (preparado para futuro)

## 📱 Responsividad

Completamente responsive:
- **Desktop**: Sidebar 64 × 64 píxeles, full width
- **Tablet**: Adaptación flexible
- **Mobile**: Sidebar colapsable (preparado para futuro)

## 🚀 Uso Rápido

### Crear una Página con Layout

```tsx
import { AppLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <AppLayout userRole="docente" userName="Prof. López">
      <div className="space-y-6">
        <h1>Mi Página</h1>
        {/* Contenido */}
      </div>
    </AppLayout>
  );
}
```

### Agregar Nueva Ruta al Menú

1. Editar `/src/lib/navigation.ts`
2. Agregar nuevo `NavItem` al rol correspondiente
3. Los cambios se reflejan automáticamente en el Sidebar

```typescript
{
  label: 'Nueva Sección',
  href: '/nueva-seccion',
  icon: MyIcon,
  badge?: '3', // Opcional
}
```

## 🔄 Flujo de Navegación

```
App Layout
├── Sidebar (dinámico por rol)
│   └── Menu Items (de navigation.ts)
├── Header
│   ├── Search
│   ├── Academic Period Selector
│   ├── Notifications
│   └── User Menu
└── Main Content
    └── Children (renderizado aquí)
```

## 📦 Estructura de Carpetas

```
src/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (landing page)
│   └── dashboard/
│       └── page.tsx (demo dashboard)
├── components/
│   └── layout/
│       ├── index.ts (exports)
│       ├── app-layout.tsx
│       ├── sidebar-updated.tsx
│       ├── header-new.tsx
│       └── root-layout.tsx (legacy)
├── lib/
│   └── navigation.ts (menu config)
└── ...
```

## 🎯 Próximas Características

- [ ] Responsive sidebar colapsable en mobile
- [ ] Tema oscuro/claro toggle
- [ ] Notificaciones en tiempo real
- [ ] Dashboard personalizable
- [ ] Sistema de permisos granulares
- [ ] Auditoría de acciones

## 📝 Consideraciones de Escalabilidad

- **Modular**: Cada componente es independiente
- **Centralizado**: Navegación en un único archivo
- **Type-safe**: Todo utiliza TypeScript
- **Extensible**: Fácil agregar nuevos roles y rutas
- **Preparado para Auth**: Props de usuario listos para integración

## 🔗 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `navigation.ts` | Definición de menús por rol |
| `app-layout.tsx` | Componente principal |
| `sidebar-updated.tsx` | Navegación lateral |
| `header-new.tsx` | Barra superior |
| `dashboard/page.tsx` | Página de demostración |

---

**Versión**: 1.0  
**Última actualización**: Mayo 2026  
**Status**: ✅ Producción lista
