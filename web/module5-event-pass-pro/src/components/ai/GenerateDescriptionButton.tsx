// =============================================================================
// COMPONENTE GENERATE DESCRIPTION BUTTON - Module 5: EventPass Pro
// =============================================================================
// Botón que conecta la UI del cliente con la generación de IA en el servidor.
//
// ## Arquitectura: Client sends to API Route
// 1. Este es un 'use client' component porque necesita interactividad (onClick).
// 2. Llama a nuestra API Route (/api/generate-description).
// 3. La API Route usa el SDK de Gemini (con la API key secreta).
// 4. Retorna el texto generado al cliente.
//
// esto evita exponer la API key de Google/Gemini en el navegador.
// =============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateDescriptionButtonProps {
  title: string;
  category: string;
  location: string;
  date: string;
  onGenerated: (description: string) => void;
  disabled?: boolean;
}

/**
 * Botón para generar descripción con IA.
 */
export function GenerateDescriptionButton({
  title,
  category,
  location,
  date,
  onGenerated,
  disabled,
}: GenerateDescriptionButtonProps): React.ReactElement {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    // Validación básica
    if (!title || !category || !location || !date) {
      setError('Completa el título, categoría, ubicación y fecha primero');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Llamamos a la API route (que usa Gemini en el servidor)
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, category, location, date }),
      });

      if (!response.ok) {
        throw new Error('Error al generar la descripción');
      }

      const data = await response.json();

      if (data.description) {
        onGenerated(data.description);
      } else {
        throw new Error('No se pudo generar la descripción');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating || disabled}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generar con IA
          </>
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
