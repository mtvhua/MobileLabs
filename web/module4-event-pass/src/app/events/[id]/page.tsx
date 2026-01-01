// =============================================================================
// PÁGINA DE DETALLE DE EVENTO - Module 4: Event Pass
// =============================================================================
// Página dinámica que muestra un evento específico.
//
// ## Dynamic Routes
// El [id] en el nombre de carpeta indica una ruta dinámica.
// Next.js pasa el valor como params.id.
//
// ## notFound()
// Función de Next.js para mostrar la página 404.
// =============================================================================

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Mail, Tag, ArrowLeft, Clock, User, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterButton } from '@/components/RegisterButton';
import { getEventById } from '@/data/events';
import { DeleteEventButton } from '@/components/DeleteEventButton';
import { PublishButton } from '@/components/PublishButton';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/event';
import { formatDate, formatPrice, getAvailableSpots, isEventPast } from '@/lib/utils';

/**
 * Props de la página con params dinámicos.
 */
interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Genera metadata dinámica para SEO.
 *
 * ## generateMetadata
 * Función especial de Next.js para generar metadata basada en params.
 * Se ejecuta en el servidor antes de renderizar la página.
 */
export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: 'Evento no encontrado',
    };
  }

  return {
    title: event.title,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160),
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

/**
 * Página de detalle de evento.
 */
export default async function EventDetailPage({
  params,
}: EventDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const event = await getEventById(id);

  // Si no existe el evento, mostramos 404
  if (!event) {
    notFound();
  }

  const availableSpots = getAvailableSpots(event.capacity, event.registeredCount);
  const isPast = isEventPast(event.date);
  const isAvailable = event.status === 'publicado' && !isPast && availableSpots > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón volver */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/events/${event.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contenido principal */}
        <div className="lg:col-span-2">
          {/* Imagen */}
          {event.imageUrl && (
            <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Título y badges */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="outline">{CATEGORY_LABELS[event.category]}</Badge>
              <Badge
                variant={
                  event.status === 'publicado'
                    ? 'success'
                    : event.status === 'cancelado'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {STATUS_LABELS[event.status]}
              </Badge>
              {event.status === 'borrador' && (
                <div className="ml-2">
                  <PublishButton eventId={event.id} />
                </div>
              )}
              {isPast && <Badge variant="secondary">Finalizado</Badge>}
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>
          </div>

          {/* Descripción */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold">Acerca del evento</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Tag className="h-4 w-4" />
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Organizador */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Organizador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{event.organizerName}</p>
              <a
                href={`mailto:${event.organizerEmail}`}
                className="mt-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {event.organizerEmail}
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">{formatPrice(event.price)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fecha */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  {event.endDate && (
                    <p className="text-sm text-muted-foreground">
                      Hasta: {formatDate(event.endDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">{event.address}</p>
                </div>
              </div>

              {/* Capacidad */}
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {event.registeredCount} / {event.capacity} registrados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {availableSpots > 0 ? `${availableSpots} plazas disponibles` : 'Evento agotado'}
                  </p>
                </div>
              </div>

              {/* Duración (si hay fecha fin) */}
              {event.endDate && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(
                        (new Date(event.endDate).getTime() - new Date(event.date).getTime()) /
                        (1000 * 60 * 60)
                      )}{' '}
                      horas
                    </p>
                  </div>
                </div>
              )}

              {/* Botón de registro */}
              <div className="pt-4">
                <RegisterButton
                  eventId={event.id}
                  availableSpots={availableSpots}
                  isAvailable={isAvailable}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
