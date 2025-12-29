// =============================================================================
// FIREBASE STORAGE - Module 5: EventPass Pro
// =============================================================================
// Funciones para subir y obtener archivos de Firebase Storage.
//
// ## Uso Principal: Cache de Posters Generados
// Las imágenes generadas por Gemini se guardan en Storage para:
// 1. Evitar regenerar (ahorro de quota/costos de API)
// 2. Servir más rápido en requests posteriores
// 3. Mantener consistencia (mismo poster siempre)
//
// ## Estructura de Archivos
// posters/
//   └── {eventId}.png  ← Poster generado por AI
// =============================================================================

import { getStorage } from 'firebase-admin/storage';
import adminApp from './admin';

/**
 * Bucket de Firebase Storage.
 *
 * ## Inicialización
 * Usamos el bucket por defecto configurado en Firebase.
 * En producción, este es el bucket asociado al proyecto.
 */
function getStorageBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    console.warn('⚠️ Firebase Storage: Bucket no configurado');
    return null;
  }

  try {
    return getStorage(adminApp).bucket(bucketName);
  } catch (error) {
    console.error('Error inicializando Storage:', error);
    return null;
  }
}

/**
 * Ruta en Storage para posters de eventos.
 */
function getPosterPath(eventId: string): string {
  return `posters/${eventId}.png`;
}

/**
 * Sube un poster generado a Firebase Storage.
 *
 * @param eventId - ID del evento (usado como nombre del archivo)
 * @param imageBuffer - Buffer de la imagen
 * @param mimeType - Tipo MIME (ej: image/png)
 * @returns URL pública de la imagen o null si hay error
 */
export async function uploadPosterToStorage(
  eventId: string,
  imageBuffer: Buffer,
  mimeType: string
): Promise<string | null> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return null;
  }

  const filePath = getPosterPath(eventId);
  const file = bucket.file(filePath);

  try {
    // Subir el archivo
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // Cache por 1 año
        metadata: {
          generatedBy: 'gemini-ai',
          eventId: eventId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Hacer el archivo público
    await file.makePublic();

    // Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log(`📤 Poster subido: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error subiendo poster a Storage:', error);
    return null;
  }
}

/**
 * Obtiene la URL de un poster existente en Storage.
 *
 * @param eventId - ID del evento
 * @returns URL pública si existe, null si no existe
 */
export async function getPosterFromStorage(eventId: string): Promise<string | null> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return null;
  }

  const filePath = getPosterPath(eventId);
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();

    if (!exists) {
      return null;
    }

    // Retornar URL pública
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (error) {
    console.error('Error verificando poster en Storage:', error);
    return null;
  }
}

/**
 * Elimina un poster de Storage.
 *
 * @param eventId - ID del evento
 * @returns true si se eliminó, false si no existía o hubo error
 */
export async function deletePosterFromStorage(eventId: string): Promise<boolean> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return false;
  }

  const filePath = getPosterPath(eventId);
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();

    if (!exists) {
      return false;
    }

    await file.delete();
    console.log(`🗑️ Poster eliminado: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error eliminando poster de Storage:', error);
    return false;
  }
}
