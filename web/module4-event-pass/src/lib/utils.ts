// =============================================================================
// UTILIDADES - Module 4: Event Pass
// =============================================================================
// Funciones de utilidad compartidas en toda la aplicación.
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de forma inteligente.
 *
 * ## ¿Por qué usar cn()?
 * - clsx: Combina clases condicionales
 * - twMerge: Resuelve conflictos de Tailwind (ej: p-2 p-4 → p-4)
 *
 * @example
 * cn('p-2', condition && 'p-4', 'text-red-500')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Genera un ID único compatible con CUID2.
 *
 * ## Nota
 * En producción usaríamos @paralleldrive/cuid2.
 * Esta es una implementación simplificada para el curso.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

/**
 * Formatea una fecha para mostrar.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea una fecha corta.
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea un precio en dolares.
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Simula un delay (útil para demostrar estados de carga).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica si un evento ya pasó.
 */
export function isEventPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Calcula plazas disponibles.
 */
export function getAvailableSpots(capacity: number, registered: number): number {
  return Math.max(0, capacity - registered);
}

/**
 * Verifica si hay plazas disponibles.
 */
export function hasAvailableSpots(capacity: number, registered: number): boolean {
  return getAvailableSpots(capacity, registered) > 0;
}

/**
 * Formatea fecha para input datetime-local (YYYY-MM-DDTHH:MM)
 */
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formatea una fecha de forma relativa (ej: "En 3 días", "Mañana", "Hace 2 horas").
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = target.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Mañana';
  if (diffInDays === -1) return 'Ayer';

  if (diffInDays > 0) {
    if (diffInDays < 7) return `En ${diffInDays} días`;
    if (diffInDays < 30) return `En ${Math.floor(diffInDays / 7)} sem`;
    return `En ${Math.floor(diffInDays / 30)} meses`;
  } else {
    const absDays = Math.abs(diffInDays);
    if (absDays < 7) return `Hace ${absDays} días`;
    if (absDays < 30) return `Hace ${Math.floor(absDays / 7)} sem`;
    return `Hace ${Math.floor(absDays / 30)} meses`;
  }
}
