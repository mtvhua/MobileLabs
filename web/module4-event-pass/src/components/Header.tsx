'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Header de navegación principal.
 *
 * ## Client Component
 * Convertido a 'use client' para usar usePathname()
 * y resaltar la ruta activa.
 */
export function Header(): React.ReactElement {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EventPass</span>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-4">
          <Link
            href="/events"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/events') ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Eventos
          </Link>
          <Button asChild size="sm">
            <Link href="/events/new" className="gap-1">
              <Plus className="h-4 w-4" />
              Crear Evento
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
