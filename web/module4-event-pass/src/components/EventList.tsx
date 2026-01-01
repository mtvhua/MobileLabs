// =============================================================================
// COMPONENTE EVENT LIST - Module 4: Event Pass
// =============================================================================
// Lista de eventos con layout responsive.
//
// ## Server Component
// Este componente es un Server Component que recibe los eventos
// como props desde un parent que hace el fetch.
// =============================================================================

import { EventCard } from './EventCard';
import type { Event } from '@/types/event';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EventListProps {
  events: Event[];
  emptyMessage?: string;
}

/**
 * Lista de eventos en grid responsive.
 */
export function EventList({
  events,
  emptyMessage = 'No se encontraron eventos',
}: EventListProps): React.ReactElement {
  if (events.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{emptyMessage}</h3>
        <p className="mb-4 mt-2 max-w-sm text-sm text-muted-foreground">
          No encontramos eventos que coincidan con tus filtros. Intenta ajustar la búsqueda.
        </p>
        <Link href="/events/new">
          <Button>Crear mi primer evento</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
