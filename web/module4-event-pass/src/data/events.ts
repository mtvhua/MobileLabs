// =============================================================================
// DATOS DE EVENTOS - Module 4: Event Pass
// =============================================================================
// Almacén de datos en memoria para los eventos.
//
// ## ¿Por qué en memoria?
// Este módulo demuestra Server Components y Server Actions sin necesidad
// de una base de datos real. En Module 5 migraremos a Firebase/Firestore.
//
// ## Importante
// Los datos se resetean cada vez que se reinicia el servidor.
// Esto es intencional para el entorno de desarrollo.
// =============================================================================

import type { Event, EventFilters } from '@/types/event';
import { generateId, delay } from '@/lib/utils';

// =============================================================================
// DATOS INICIALES (SEED)
// =============================================================================

/**
 * Eventos de ejemplo para desarrollo.
 */
const initialEvents: Event[] = [
  {
    id: generateId(),
    title: 'Conferencia de Desarrollo Web 2026',
    description:
      'Únete a los mejores expertos en desarrollo web para explorar las últimas tendencias en React, Next.js y tecnologías frontend. Incluye talleres prácticos y sesiones de networking.',
    category: 'conferencia',
    status: 'publicado',
    date: '2026-02-15T09:00:00.000Z',
    endDate: '2026-02-15T18:00:00.000Z',
    location: 'Centro de Convenciones Madrid',
    address: 'Paseo de la Castellana 99, 28046 Madrid',
    capacity: 500,
    registeredCount: 342,
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    organizerName: 'TechEvents España',
    organizerEmail: 'info@techevents.es',
    tags: ['react', 'nextjs', 'frontend', 'javascript'],
    createdAt: '2025-12-01T10:00:00.000Z',
    updatedAt: '2025-12-20T15:30:00.000Z',
  },
  {
    id: generateId(),
    title: 'Taller de React Server Components',
    description:
      'Aprende a construir aplicaciones modernas con React Server Components y Server Actions. Taller práctico de 4 horas con ejercicios hands-on y código real.',
    category: 'taller',
    status: 'publicado',
    date: '2026-01-28T10:00:00.000Z',
    endDate: '2026-01-28T14:00:00.000Z',
    location: 'Campus Google Madrid',
    address: 'Calle Moreno Nieto 2, 28005 Madrid',
    capacity: 30,
    registeredCount: 28,
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    organizerName: 'React Madrid',
    organizerEmail: 'hola@reactmadrid.dev',
    tags: ['react', 'server-components', 'hands-on'],
    createdAt: '2025-12-10T09:00:00.000Z',
    updatedAt: '2025-12-22T11:00:00.000Z',
  },
  {
    id: generateId(),
    title: 'Networking Tech & Startups',
    description:
      'Evento de networking para profesionales tech y fundadores de startups. Conoce a inversores, desarrolladores y emprendedores en un ambiente distendido con bebidas y aperitivos.',
    category: 'networking',
    status: 'publicado',
    date: '2026-01-20T19:00:00.000Z',
    endDate: '2026-01-20T22:00:00.000Z',
    location: 'WeWork Castellana',
    address: 'Paseo de la Castellana 77, 28046 Madrid',
    capacity: 100,
    registeredCount: 67,
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    organizerName: 'Madrid Tech Community',
    organizerEmail: 'eventos@madridtech.io',
    tags: ['networking', 'startups', 'tech'],
    createdAt: '2025-12-05T14:00:00.000Z',
    updatedAt: '2025-12-18T16:45:00.000Z',
  },
  {
    id: generateId(),
    title: 'Concierto Sinfónico de Año Nuevo',
    description:
      'La Orquesta Filarmónica celebra el año nuevo con un repertorio clásico que incluye obras de Strauss, Beethoven y Mozart. Una velada mágica en el auditorio más prestigioso de la ciudad.',
    category: 'concierto',
    status: 'publicado',
    date: '2026-01-05T20:00:00.000Z',
    endDate: '2026-01-05T22:30:00.000Z',
    location: 'Auditorio Nacional',
    address: 'Calle Príncipe de Vergara 146, 28002 Madrid',
    capacity: 2300,
    registeredCount: 1850,
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    organizerName: 'Fundación Musical Madrid',
    organizerEmail: 'conciertos@fundacionmusical.es',
    tags: ['música', 'clásica', 'orquesta'],
    createdAt: '2025-11-15T08:00:00.000Z',
    updatedAt: '2025-12-28T09:00:00.000Z',
  },
  {
    id: generateId(),
    title: 'Exposición: Arte Digital y NFTs',
    description:
      'Explora la intersección entre arte y tecnología en esta exposición inmersiva. Descubre obras de artistas digitales pioneros y aprende sobre el futuro del arte en la era blockchain.',
    category: 'exposicion',
    status: 'publicado',
    date: '2026-02-01T10:00:00.000Z',
    endDate: '2026-03-15T20:00:00.000Z',
    location: 'Museo de Arte Contemporáneo',
    address: 'Calle Santa Isabel 52, 28012 Madrid',
    capacity: 200,
    registeredCount: 45,
    price: 12,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    organizerName: 'Museo de Arte Contemporáneo',
    organizerEmail: 'exposiciones@mac.es',
    tags: ['arte', 'digital', 'nft', 'tecnología'],
    createdAt: '2025-12-01T12:00:00.000Z',
    updatedAt: '2025-12-20T14:00:00.000Z',
  },
  {
    id: generateId(),
    title: 'Hackathon IA para el Bien Social',
    description:
      'Hackathon de 48 horas enfocado en crear soluciones de inteligencia artificial para problemas sociales. Premios de hasta $10,000 para los mejores proyectos. Comida y bebida incluidas.',
    category: 'otro',
    status: 'borrador',
    date: '2026-03-22T09:00:00.000Z',
    endDate: '2026-03-24T18:00:00.000Z',
    location: 'Impact Hub Madrid',
    address: 'Calle Alameda 22, 28014 Madrid',
    capacity: 150,
    registeredCount: 0,
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    organizerName: 'AI Spain',
    organizerEmail: 'hackathon@aispain.org',
    tags: ['hackathon', 'ia', 'social', 'premios'],
    createdAt: '2025-12-26T10:00:00.000Z',
    updatedAt: '2025-12-26T10:00:00.000Z',
  },
];

// =============================================================================
// ALMACÉN EN MEMORIA
// =============================================================================

/**
 * Array mutable que actúa como "base de datos".
 * Se inicializa con los eventos de ejemplo.
 */
const events: Event[] = [...initialEvents];

// =============================================================================
// FUNCIONES DE ACCESO A DATOS
// =============================================================================

/**
 * Obtiene todos los eventos con filtros opcionales.
 *
 * @param filters - Filtros a aplicar
 * @returns Lista de eventos filtrados
 */
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  // Simulamos latencia de red/base de datos
  await delay(300);

  let result = [...events];

  if (filters) {
    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por categoría
    if (filters.category) {
      result = result.filter((event) => event.category === filters.category);
    }

    // Filtro por estado
    if (filters.status) {
      result = result.filter((event) => event.status === filters.status);
    }

    // Filtro por rango de fechas
    if (filters.dateFrom) {
      result = result.filter((event) => new Date(event.date) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      result = result.filter((event) => new Date(event.date) <= new Date(filters.dateTo!));
    }

    // Filtro por precio máximo
    if (filters.priceMax !== undefined) {
      result = result.filter((event) => event.price <= filters.priceMax!);
    }
  }

  // Ordenar por fecha (próximos primero)
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Obtiene un evento por su ID.
 *
 * @param id - ID del evento
 * @returns El evento o null si no existe
 */
export async function getEventById(id: string): Promise<Event | null> {
  await delay(200);
  return events.find((event) => event.id === id) ?? null;
}

/**
 * Crea un nuevo evento.
 *
 * @param data - Datos del evento (sin id ni timestamps)
 * @returns El evento creado
 */
export async function createEvent(
  data: Omit<Event, 'id' | 'registeredCount' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  await delay(500);

  const now = new Date().toISOString();
  const newEvent: Event = {
    ...data,
    id: generateId(),
    registeredCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  events.push(newEvent);
  return newEvent;
}

/**
 * Actualiza un evento existente.
 *
 * @param id - ID del evento
 * @param data - Datos a actualizar
 * @returns El evento actualizado o null si no existe
 */
export async function updateEvent(
  id: string,
  data: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<Event | null> {
  await delay(400);

  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return events[index];
}

/**
 * Elimina un evento.
 *
 * @param id - ID del evento
 * @returns true si se eliminó, false si no existía
 */
export async function deleteEvent(id: string): Promise<boolean> {
  await delay(300);

  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return false;

  events.splice(index, 1);
  return true;
}

/**
 * Registra un usuario en un evento.
 *
 * @param id - ID del evento
 * @returns El evento actualizado o null si no hay plazas/no existe
 */
export async function registerForEvent(id: string): Promise<Event | null> {
  await delay(300);

  const event = events.find((e) => e.id === id);
  if (!event) return null;
  if (event.registeredCount >= event.capacity) return null;
  if (event.status !== 'publicado') return null;

  event.registeredCount += 1;
  event.updatedAt = new Date().toISOString();

  return event;
}

/**
 * Obtiene estadísticas generales.
 */
export async function getEventStats(): Promise<{
  total: number;
  published: number;
  upcoming: number;
  totalCapacity: number;
  totalRegistered: number;
}> {
  await delay(200);

  const now = new Date();
  const published = events.filter((e) => e.status === 'publicado');
  const upcoming = published.filter((e) => new Date(e.date) > now);

  return {
    total: events.length,
    published: published.length,
    upcoming: upcoming.length,
    totalCapacity: events.reduce((sum, e) => sum + e.capacity, 0),
    totalRegistered: events.reduce((sum, e) => sum + e.registeredCount, 0),
  };
}
