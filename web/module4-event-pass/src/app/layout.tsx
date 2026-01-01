// =============================================================================
// ROOT LAYOUT - Module 4: Event Pass
// =============================================================================
// Layout raíz de la aplicación Next.js.
//
// ## App Router Layouts
// Los layouts en App Router:
// 1. Se aplican a todas las rutas hijas
// 2. Preservan estado entre navegaciones
// 3. Son Server Components por defecto
//
// ## Metadata API
// Next.js usa la Metadata API para SEO.
// Puedes definir metadata estática o dinámica.
// =============================================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

/**
 * Fuente Inter de Google Fonts.
 *
 * ## next/font
 * Next.js optimiza las fuentes automáticamente:
 * - Descarga en tiempo de build
 * - Self-hosting (sin llamadas a Google)
 * - Sin layout shift
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Metadata de la aplicación.
 *
 * ## Metadata API
 * Define metadatos SEO para la aplicación.
 * Estos se aplican a toda la app (pueden ser override por páginas).
 */
export const metadata: Metadata = {
  title: {
    template: '%s | EventPass',
    default: 'EventPass - Gestiona tus Eventos',
  },
  description:
    'Plataforma de gestión de eventos. Crea, promociona y gestiona eventos fácilmente.',
  keywords: ['eventos', 'conferencias', 'talleres', 'networking', 'gestión de eventos'],
};

/**
 * Layout raíz de la aplicación.
 *
 * @param children - Contenido de la página actual
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        {/* Header global */}
        <Header />

        {/* Contenido principal */}
        <main className="flex-1">{children}</main>

        {/* Footer global */}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
