// =============================================================================
// COMPONENTE EVENT FORM - Module 4: Event Pass
// =============================================================================
// Formulario para crear/editar eventos usando Server Actions.
//
// ## 'use client'
// Este componente DEBE ser un Client Component porque:
// 1. Usa useActionState (hook de React 19)
// 2. Usa useFormStatus para estados de carga
// 3. Maneja interactividad del formulario
//
// ## useActionState (React 19)
// Nuevo hook que reemplaza el patrón anterior de useFormState.
// Maneja automáticamente:
// - Estado del formulario
// - Errores de validación
// - Estados pendientes
// =============================================================================

'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createEventAction, updateEventAction } from '@/actions/eventActions';
import { EVENT_CATEGORIES, EVENT_STATUSES, CATEGORY_LABELS, STATUS_LABELS } from '@/types/event';
import type { FormState, Event } from '@/types/event';
import { formatDateForInput } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

/**
 * Estado inicial del formulario.
 */
const initialState: FormState = {
  success: false,
  message: '',
};

interface EventFormProps {
  eventId?: string;
  initialData?: Event;
}

/**
 * Botón de submit con estado de carga.
 */
function SubmitButton({ isEditing }: { isEditing: boolean }): React.ReactElement {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending
        ? isEditing
          ? 'Guardando cambios...'
          : 'Creando evento...'
        : isEditing
          ? 'Guardar Cambios'
          : 'Crear Evento'}
    </Button>
  );
}

/**
 * Componente de error para campos.
 */
function FieldError({ errors }: { errors?: string[] }): React.ReactElement | null {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="mt-1 text-sm text-destructive">
      {errors.map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  );
}

/**
 * Formulario para crear/editar eventos.
 */
export function EventForm({ eventId, initialData }: EventFormProps): React.ReactElement {
  const isEditing = !!eventId && !!initialData;

  // Seleccionamos la acción correcta
  const action = isEditing
    ? updateEventAction.bind(null, eventId)
    : createEventAction;

  const [state, formAction] = useActionState(action, initialState);

  // Helper para valores por defecto (prioridad: state > initialData)
  const getValue = (field: keyof Event) => {
    if (state.values?.[field as keyof typeof state.values]) {
      return state.values[field as keyof typeof state.values];
    }
    if (initialData?.[field]) {
      // Formatear fechas para input datetime-local
      if ((field === 'date' || field === 'endDate') && typeof initialData[field] === 'string') {
        return formatDateForInput(initialData[field]);
      }
      return initialData[field];
    }
    return undefined;
  };

  const { toast } = useToast();
  const router = useRouter();

  // ===========================================================================
  // EDUCATIONAL NOTE: Client-Side Redirection vs Server-Side Redirect
  // ===========================================================================
  // We use client-side redirection (router.push) here instead of server-side
  // redirect() for better UX. Server-side redirect() immediately interrupts
  // the response, often preventing the toast from appearing or being seen.
  // By returning a success state and redirecting on the client, we can:
  // 1. Show the success toast
  // 2. Wait a brief moment (500ms) for the user to see it
  // 3. Navigate smoothly to the new page
  // ===========================================================================

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: '¡Éxito!',
          description: state.message,
          variant: 'default',
        });

        // Redirigir al detalle del evento creado/editado con un pequeño delay
        // para asegurar que el toast se pueda ver
        if (state.data && 'id' in state.data) {
          const eventId = state.data.id;
          setTimeout(() => {
            router.push(`/events/${eventId}`);
          }, 500);
        }
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, router]);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Modifica los detalles del evento.'
            : 'Completa el formulario para publicar tu evento.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Mensaje de error general */}
        {!state.success && state.message && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 text-destructive">
            <p>{state.message}</p>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>

            {/* Titulo */}
            <div className="space-y-2">
              <Label htmlFor="title">Titulo del evento *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Conferencia de Desarrollo Web 2026"
                defaultValue={getValue('title') as string}
                required
              />
              <FieldError errors={state.errors?.title} />
            </div>

            {/* Descripcion */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe tu evento en detalle (minimo 20 caracteres)"
                defaultValue={getValue('description') as string}
                rows={4}
                required
              />
              <FieldError errors={state.errors?.description} />
            </div>

            {/* Categoria y Estado */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select name="category" defaultValue={getValue('category') as string} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={state.errors?.category} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select name="status" defaultValue={(getValue('status') as string) ?? 'publicado'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={state.errors?.status} />
              </div>
            </div>
          </div>

          {/* Fecha y ubicacion */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fecha y Ubicacion</h3>

            {/* Fechas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha de inicio *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={getValue('date') as string}
                  required
                />
                <FieldError errors={state.errors?.date} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={getValue('endDate') as string}
                />
                <FieldError errors={state.errors?.endDate} />
              </div>
            </div>

            {/* Ubicacion */}
            <div className="space-y-2">
              <Label htmlFor="location">Lugar *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ej: Centro de Convenciones"
                defaultValue={getValue('location') as string}
                required
              />
              <FieldError errors={state.errors?.location} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Direccion completa *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Ej: Calle Principal 123, 28001 Madrid"
                defaultValue={getValue('address') as string}
                required
              />
              <FieldError errors={state.errors?.address} />
            </div>
          </div>

          {/* Capacidad y precio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Capacidad y Precio</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad maxima *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="100"
                  defaultValue={getValue('capacity') as string}
                  required
                />
                <FieldError errors={state.errors?.capacity} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0 para eventos gratuitos"
                  defaultValue={getValue('price') as string}
                  required
                />
                <FieldError errors={state.errors?.price} />
              </div>
            </div>
          </div>

          {/* Imagen y tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Imagen y Etiquetas</h3>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de imagen</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                defaultValue={getValue('imageUrl') as string}
              />
              <FieldError errors={state.errors?.imageUrl} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="react, javascript, conferencia"
                defaultValue={
                  state.values?.tags ?? initialData?.tags?.join(', ')
                }
              />
              <p className="text-sm text-muted-foreground">Maximo 5 etiquetas</p>
              <FieldError errors={state.errors?.tags} />
            </div>
          </div>

          {/* Informacion del organizador */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informacion del Organizador</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Nombre del organizador *</Label>
                <Input
                  id="organizerName"
                  name="organizerName"
                  placeholder="Tu nombre o empresa"
                  defaultValue={getValue('organizerName') as string}
                  required
                />
                <FieldError errors={state.errors?.organizerName} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Email del organizador *</Label>
                <Input
                  id="organizerEmail"
                  name="organizerEmail"
                  type="email"
                  placeholder="contacto@ejemplo.com"
                  defaultValue={getValue('organizerEmail') as string}
                  required
                />
                <FieldError errors={state.errors?.organizerEmail} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <SubmitButton isEditing={isEditing} />
        </form>
      </CardContent>
    </Card>
  );
}
