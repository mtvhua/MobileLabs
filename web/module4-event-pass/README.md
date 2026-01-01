# Módulo 4 - EventPass

## Plataforma de Gestión de Eventos con Next.js 15

> Aplicación fullstack con Server Components, Server Actions y React 19.

---

### 6. UI/UX Improvements (Latest)

- **Toast Notifications**: Integrated `shadcn/ui` Toast for success/error feedback on Create, Edit, and Delete actions.
- **Debounced Search**: Filter events by title with a 500ms debounce to prevent excessive re-renders.
- **Loading States**: Added `loading.tsx` with skeletons for a smoother data fetching experience.
- **Relative Dates**: Events display relative dates (e.g., "In 3 days") for better context.
- **Client-Side Redirection**: Optimized navigation flow after form submission to ensure toast visibility using `router.push` with a micro-delay.

### 7. Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 16.1.1 | App Router, Server Actions |
| React | 19.2.1 | `useActionState`, `useTransition`, `useOptimistic` |
| Tailwind CSS | 4.1.8 | Styling (Utility-first) |
| Lucide React | Latest | Icons |
| Radix UI | Latest | Accessible UI Primitives (via Shadcn) |
| Zod | Latest | Schema Validation |

> Ver [TECH_STACK.md](./TECH_STACK.md) para detalles completos.

---

## Descripción del Proyecto

**EventPass** es una plataforma de gestión de eventos que demuestra las capacidades de Next.js 15 con App Router. Este proyecto enseña:

1. **Server Components** - Renderizado en servidor por defecto
2. **Server Actions** - Mutaciones sin API routes manuales
3. **React 19 Hooks** - useActionState, useFormStatus, useOptimistic
4. **App Router** - Layouts, rutas dinámicas, metadata API

---

## Contexto Pedagógico

### 1. Server Components vs Client Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVER VS CLIENT COMPONENTS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SERVER COMPONENTS (Por defecto)    │    CLIENT COMPONENTS              │
│   ──────────────────────────────────────────────────────────────────    │
│   ✅ Fetch de datos directo          │    ✅ Interactividad (onClick)    │
│   ✅ Acceso a backend/DB             │    ✅ Hooks de React              │
│   ✅ Menos JS al cliente             │    ✅ Browser APIs                │
│   ✅ Mejor SEO                       │    ✅ Estado local                │
│                                       │                                   │
│   Ejemplo:                           │    Ejemplo:                        │
│   async function Page() {            │    'use client'                   │
│     const data = await fetch()       │    function Button() {            │
│     return <div>{data}</div>         │      const [x, setX] = useState() │
│   }                                  │    }                              │
│                                       │                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Server Actions

```typescript
// actions/eventActions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  // 1. Esta función se ejecuta en el SERVIDOR
  // 2. Puede acceder a la base de datos directamente
  // 3. Es segura para secrets y credenciales

  const event = await db.event.create({
    data: { title: formData.get('title') }
  });

  // 4. Invalida la caché para mostrar datos frescos
  revalidatePath('/events');
}
```

### 3. React 19 Hooks

```typescript
// useActionState - Maneja estado de Server Actions
const [state, formAction] = useActionState(createEventAction, initialState);

// useFormStatus - Estado del formulario (pending, etc.)
const { pending } = useFormStatus();

// useOptimistic - Actualizaciones optimistas
const [optimisticValue, addOptimistic] = useOptimistic(value, reducer);
```

---

## Estructura del Proyecto

```
module4-event-pass/
├── package.json               # Dependencias y scripts
├── next.config.ts             # Configuración de Next.js
├── postcss.config.mjs         # Configuración de PostCSS (Tailwind v4)
├── tsconfig.json              # Configuración de TypeScript
├── eslint.config.mjs          # Configuración de ESLint
├── .gitignore                 # Archivos ignorados
├── .env.example               # Variables de entorno ejemplo
├── README.md                  # Esta documentación
├── TECH_STACK.md              # Versiones de dependencias
└── src/
    ├── app/                   # App Router (páginas y layouts)
    │   ├── layout.tsx         # Layout raíz
    │   ├── page.tsx           # Página principal
    │   ├── loading.tsx        # UI de carga
    │   ├── error.tsx          # UI de error
    │   ├── not-found.tsx      # Página 404
    │   ├── globals.css        # Estilos globales
    │   └── events/            # Rutas de eventos
    │       ├── page.tsx       # Lista de eventos
    │       ├── new/           # Crear evento
    │       │   └── page.tsx
    │       └── [id]/          # Detalle de evento (dinámica)
    │           └── page.tsx
    ├── actions/               # Server Actions
    │   └── eventActions.ts
    ├── components/            # Componentes React
    │   ├── ui/                # Shadcn UI components
    │   ├── EventCard.tsx
    │   ├── EventForm.tsx
    │   ├── EventList.tsx
    │   ├── RegisterButton.tsx
    │   ├── Header.tsx
    │   └── Footer.tsx
    ├── data/                  # Almacén de datos en memoria
    │   └── events.ts
    ├── lib/                   # Utilidades
    │   └── utils.ts
    └── types/                 # Tipos TypeScript
        └── event.ts
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA NEXT.JS 15                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   BROWSER                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  HTML + Minimal JS (solo para Client Components)                │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│   ════════════════════════════════│══════════════════════════════════   │
│                                   │                                      │
│   SERVER                          ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       APP ROUTER                                 │   │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │   │
│   │  │   Layout    │ │    Page     │ │    Server Actions       │   │   │
│   │  │  (Server)   │ │  (Server)   │ │    createEvent()        │   │   │
│   │  └─────────────┘ └──────┬──────┘ └───────────┬─────────────┘   │   │
│   │                         │                     │                 │   │
│   │                         ▼                     ▼                 │   │
│   │  ┌─────────────────────────────────────────────────────────┐   │   │
│   │  │                    DATA LAYER                            │   │   │
│   │  │    getEvents()  getEventById()  createEvent()           │   │   │
│   │  │              (In-memory / Futuro: DB)                    │   │   │
│   │  └─────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Server Actions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE SERVER ACTIONS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. FORMULARIO                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  <form action={createEventAction}>                              │   │
│   │    <input name="title" />                                       │   │
│   │    <button type="submit">Crear</button>                         │   │
│   │  </form>                                                        │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   │ FormData                             │
│                                   ▼                                      │
│   2. SERVER ACTION                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  'use server'                                                   │   │
│   │  async function createEventAction(formData: FormData) {        │   │
│   │    // Validar con Zod                                          │   │
│   │    // Guardar en DB                                            │   │
│   │    // revalidatePath('/events')                                │   │
│   │  }                                                              │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│                                   ▼                                      │
│   3. REVALIDACIÓN                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Next.js regenera las páginas afectadas                        │   │
│   │  El cliente recibe HTML actualizado                            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Comparación: Next.js App Router vs Pages Router

| Característica      | App Router (Next.js 13+)     | Pages Router (Legacy)       |
| ------------------- | ---------------------------- | --------------------------- |
| Componentes         | Server Components por defecto| Client Components           |
| Data Fetching       | async/await en componentes   | getServerSideProps, etc.    |
| Layouts             | Anidados, persistentes       | \_app.tsx global            |
| Mutaciones          | Server Actions               | API Routes manuales         |
| Streaming           | Soportado nativamente        | No soportado                |
| Metadata            | Metadata API                 | Head component              |

---

## Configuración y Ejecución

### Prerrequisitos

- Node.js 20.19+ o 22.12+
- npm 10+

### Instalación

```bash
# Navegar al directorio del módulo
cd web/module4-event-pass

# Instalar dependencias
npm install
```

### Comandos Disponibles

```bash
# Servidor de desarrollo con Turbopack
npm run dev

# Verificar tipos de TypeScript
npm run type-check

# Build de producción
npm run build

# Ejecutar versión de producción
npm start

# Ejecutar linter
npm run lint
```

---

## Características Principales

### 1. Listado de Eventos (Server Component)
- Renderizado en servidor
- Filtros via query params
- SEO optimizado

### 2. Detalle de Evento (Dynamic Route)
- Metadata dinámica para SEO
- Registro con actualización optimista
- notFound() para eventos inexistentes

### 3. Creación de Eventos (Server Action)
- Validación con Zod
- useActionState para estado
- useFormStatus para loading

### 4. Registro Optimista (useOptimistic)
- UI se actualiza inmediatamente
- Rollback automático si falla

---

## Notas Educativas

### Progressive Enhancement

Los formularios funcionan sin JavaScript:
1. El form se envía como POST normal
2. El servidor procesa y redirige
3. Con JS, se mejora con estados de carga

### Colocation

En App Router, cada carpeta puede tener:
- `page.tsx` - La página
- `layout.tsx` - Layout compartido
- `loading.tsx` - UI de carga
- `error.tsx` - Error boundary
- `not-found.tsx` - 404

---

## Experimentos Sugeridos

1. **Paginación**: Implementa paginación con searchParams
2. **Búsqueda en tiempo real**: Añade debounce al filtro de búsqueda
3. **Parallel Routes**: Crea un modal con @modal
4. **Intercepting Routes**: Implementa vista previa de eventos
5. **Streaming**: Usa Suspense para cargar partes de la página

---

## Conectar con Module 5

Module 5 (EventPass Pro) extiende este proyecto añadiendo:
- Firebase Authentication
- Firestore como base de datos
- Generación de descripciones con Gemini AI

---

## Licencia

Este proyecto es de uso educativo y fue creado como material de aprendizaje.

---

## Créditos

> Este proyecto ha sido generado usando Claude Code y adaptado con fines educativos por Adrián Catalán.
