// =============================================================================
// PÁGINA DE EVENTOS - Module 4: Event Pass
// =============================================================================
// Lista de eventos con filtros usando searchParams.
//
// ## searchParams en Server Components
// Next.js pasa los query params como prop a las páginas.
// Esto permite filtrar datos en el servidor sin JavaScript del cliente.
//
// ## Dynamic Rendering
// Esta página usa dynamic rendering porque depende de searchParams.
// Next.js detecta esto automáticamente.
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventList } from '@/components/EventList';
import { EventFiltersForm } from './EventFiltersForm';
import { getEvents } from '@/data/events';
import type { EventCategory, EventStatus } from '@/types/event';

/**
 * Metadata de la página.
 */
export const metadata: Metadata = {
  title: 'Explorar Eventos',
  description: 'Descubre y filtra eventos por categoría, fecha, precio y más.',
};

/**
 * Props de la página con searchParams.
 *
 * ## searchParams
 * Next.js pasa los query params de la URL como prop.
 * Por ejemplo: /events?category=conferencia → { category: 'conferencia' }
 */
interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    priceMax?: string;
  }>;
}

/**
 * Página de listado de eventos.
 */
export default async function EventsPage({ searchParams }: EventsPageProps): Promise<React.ReactElement> {
  // Await searchParams (Next.js 15+ async searchParams)
  const params = await searchParams;

  // Construimos los filtros desde searchParams
  const filters = {
    search: params.search,
    category: params.category as EventCategory | undefined,
    status: params.status as EventStatus | undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
  };

  // Fetch de eventos con filtros
  const events = await getEvents(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explorar Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Evento
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <EventFiltersForm currentFilters={filters} />
      </div>

      {/* Lista de eventos */}
      <EventList
        events={events}
        emptyMessage="No se encontraron eventos con los filtros seleccionados"
      />
    </div>
  );
}
