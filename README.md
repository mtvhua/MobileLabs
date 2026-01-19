# Aplicaciones Web Avanzadas

Bienvenido al repositorio oficial del curso **Aplicaciones Web Avanzadas**.
Este repositorio contiene todo el material práctico, código fuente y presentaciones para los módulos del curso.

## Estructura del Repositorio

El contenido está dividido en dos grandes áreas:

### 📱 Mobile (Android)

Desarrollo de aplicaciones nativas modernas con Kotlin y Jetpack Compose.

| Módulo | Proyecto | Temas | Materials |
|--------|----------|-------|-------|
| 1 | [RPG Dice Roller](mobile/module1-rpgdiceroller/README.md) | Kotlin, Coroutines, Compose Básico | [slides](mobile/module1-rpgdiceroller/slides/slides.pdf) |
| 2 | [Stream UI](mobile/module2-streamui/README.md) | Navegación, MVVM, Inyección de Dependencias | [slides](mobile/module2-streamui/slides/slides.pdf) |
| 3 | [Amiibo Vault](mobile/module3-amiibovault/README.md) | Room, Retrofit, Arquitectura Offline-First | [slides](mobile/module3-amiibovault/slides/slides.pdf) |
| 4 | [City Spots](mobile/module4-cityspots/README.md) | Google Maps, Localización, Permisos | [slides](mobile/module4-cityspots/slides/slides.pdf) |
| 5 | [AI Chef](mobile/module5-aichef/README.md) | Firebase, IA Generativa (Gemini) | [slides](mobile/module5-aichef/slides/slides.md) |

📖 [Ver documentación completa del track Mobile](mobile/README.md)

---

### 🌐 Web

Desarrollo de aplicaciones web modernas con TypeScript, React y Next.js.

| Módulo | Nombre | Proyecto | Temas |
|--------|--------|----------|-------|
| 1 | Fundamentos | [Country Explorer](web/module1-country-explorer/README.md) | HTML/Tailwind/DOM, JS Async & Fetch, TypeScript |
| 2 | Frontend SPA | [Real Estate React](web/module2-real-estate/README.md) | React/Vite, Forms (Zod), Routing, LocalStorage |
| 3 | Backend API | [EstateHub API](web/module3-realestate-hub-api/README.md) | Node.js, Express, Controllers, Base de Datos |
| 4 | Next.js | [EventPass](web/module4-event-pass/README.md) | App Router, Server Components, Server Actions |
| 5 | Firebase, AI & Deploy | [EventPass Pro](web/module5-event-pass-pro/README.md) | Firebase Auth/Firestore, Gemini AI, Deploy |

📖 [Ver documentación completa del track Web](web/README.md)

---

## Comparación de Tracks

| Aspecto | Mobile (Android) | Web |
|---------|------------------|-----|
| **Lenguaje** | Kotlin | TypeScript |
| **UI Framework** | Jetpack Compose | React 19 / Next.js 15 |
| **Arquitectura** | MVVM + Clean Architecture | Server Components + Actions |
| **Persistencia Local** | Room Database | LocalStorage / SQLite |
| **Networking** | Retrofit + OkHttp | Fetch API / Prisma |
| **DI** | Koin / Hilt | React Context |
| **Cloud** | Firebase | Firebase |
| **IA** | Gemini (Firebase AI Logic) | Gemini API |
| **Deploy** | Play Store | Vercel / Cloud Run |

## Requisitos

### Android
*   **Android Studio**: Otter | 2025.2.2 o superior.
*   **JDK**: 17 o superior.

### Web
*   **Node.js**: 20.19+ o 22.12+ LTS.
*   **npm**: 10+ (incluido con Node.js).
*   **Editor**: VS Code con ESLint y Prettier.

## Cómo usar este repo

Este es un **Monorepo**. Puedes clonar todo el contenido una sola vez:

```bash
git clone https://github.com/ykro/aplicaciones-web-avanzadas.git
```

### Para proyectos Android:
1.  Abre Android Studio.
2.  Selecciona "Open" y navega a la carpeta del módulo (ej: `mobile/module1-rpgdiceroller`).

### Para proyectos Web:
1.  Abre tu terminal.
2.  Navega a la carpeta del módulo: `cd web/module1-country-explorer`
3.  Instala dependencias: `npm install`
4.  Inicia el servidor: `npm run dev`

## Licencia

Este proyecto es de uso educativo y fue creado como material de aprendizaje.

## Créditos

> Este proyecto ha sido generado usando Claude Code y adaptado con fines educativos por Adrián Catalán.
