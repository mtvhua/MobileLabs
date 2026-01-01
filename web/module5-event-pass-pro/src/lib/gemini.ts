// =============================================================================
// ADRIÁN CATALÁN - GEMINI AI CLIENT
// =============================================================================
// Configuración del cliente de Google Generative AI.
//
// ## Model Selection
// Usamos 'gemini-1.5-flash' por su velocidad y bajo costo, ideal para
// tareas interactivas como generar descripciones en tiempo real.
// =============================================================================

import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client
// We use the API key from environment variables (Server-side mostly)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Constants for models
export const GEMINI_MODELS = {
  TEXT: 'gemini-3-flash-preview', // Speed optimized
  IMAGE: 'gemini-3-pro-image-preview', // Quality optimized
};

/**
 * Get the generative AI client
 */
export const getGeminiClient = () => {
  return genAI;
};
