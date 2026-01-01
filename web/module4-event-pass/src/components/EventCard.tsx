// =============================================================================
// COMPONENTE EVENT CARD - Module 4: Event Pass
// =============================================================================
// Tarjeta para mostrar un evento en el listado.
//
// ## Server Component
// Este es un Server Component (por defecto en Next.js App Router).
// No tiene 'use client' porque no necesita interactividad del cliente.
// =============================================================================

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types/event';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/event';
import { formatShortDate, formatPrice, getAvailableSpots, formatRelativeDate } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

/**
 * Tarjeta de evento para listados.
 *
 * ## Diseño
 * - Imagen con overlay de fecha
 * - Información principal (título, ubicación, fecha)
 * - Badges de categoría y estado
 * - Footer con precio y acción
 */
export function EventCard({ event }: EventCardProps): React.ReactElement {
  const availableSpots = getAvailableSpots(event.capacity, event.registeredCount);
  const isSoldOut = availableSpots === 0;
  const isAvailable = event.status === 'publicado' && !isSoldOut;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Imagen del evento */}
      <div className="relative aspect-video">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Tag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay con fecha */}
        <div className="absolute left-3 top-3 rounded-lg bg-background/90 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-sm font-bold text-primary">{formatRelativeDate(event.date)}</p>
        </div>

        {/* Badge de estado si no está publicado */}
        {event.status !== 'publicado' && (
          <div className="absolute right-3 top-3">
            <Badge variant={event.status === 'cancelado' ? 'destructive' : 'secondary'}>
              {STATUS_LABELS[event.status]}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/events/${event.id}`}
            className="line-clamp-2 text-lg font-semibold hover:underline"
          >
            {event.title}
          </Link>
        </div>
        <Badge variant="outline" className="w-fit">
          {CATEGORY_LABELS[event.category]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatShortDate(event.date)}</span>
        </div>

        {/* Plazas disponibles */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            {isSoldOut ? (
              <span className="font-medium text-destructive">Agotado</span>
            ) : (
              `${availableSpots} plazas disponibles`
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <p className="text-lg font-bold text-primary">{formatPrice(event.price)}</p>
        <Button asChild variant={isAvailable ? 'default' : 'secondary'} size="sm">
          <Link href={`/events/${event.id}`}>{isAvailable ? 'Ver detalles' : 'Ver evento'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
