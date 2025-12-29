// =============================================================================
// API ROUTE: GENERAR POSTER - Module 5: EventPass Pro
// =============================================================================
// API Route para generar posters/imágenes de eventos con Gemini AI.
//
// ## Generación de Imágenes con Gemini
// Usamos el modelo gemini-2.0-flash-preview-image-generation que puede
// generar imágenes a partir de prompts de texto.
//
// ## Cache con Firebase Storage
// Las imágenes generadas se guardan en Storage para:
// 1. Evitar regenerar (ahorro de quota/costos)
// 2. Servir más rápido
// 3. Mantener consistencia
// =============================================================================

import { NextResponse } from 'next/server';
import { generateEventPoster } from '@/lib/gemini';
import { CATEGORY_LABELS, type EventCategory } from '@/types/event';

/**
 * POST /api/generate-poster
 *
 * Genera un poster de evento usando Gemini AI.
 *
 * Body:
 * - eventId: ID del evento (requerido)
 * - title: Título del evento (requerido)
 * - category: Categoría del evento (requerido)
 * - location: Ubicación del evento (requerido)
 * - date: Fecha del evento (requerido)
 *
 * Response:
 * - posterUrl: URL pública del poster generado
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parseamos el body
    const body = await request.json();
    const { eventId, title, category, location, date } = body;

    // Validación básica
    if (!eventId || !title || !category || !location || !date) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: eventId, title, category, location, date' },
        { status: 400 }
      );
    }

    // Formateamos la fecha para el prompt
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Traducimos la categoría
    const categoryLabel = CATEGORY_LABELS[category as EventCategory] ?? category;

    // Generamos el poster
    const posterUrl = await generateEventPoster({
      eventId,
      title,
      category: categoryLabel,
      location,
      date: formattedDate,
    });

    if (!posterUrl) {
      return NextResponse.json(
        { error: 'No se pudo generar el poster. Verifica la configuración de Gemini AI y Firebase Storage.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ posterUrl });
  } catch (error) {
    console.error('Error en /api/generate-poster:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
