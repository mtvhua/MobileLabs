'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deleteEventAction } from '@/actions/eventActions';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface DeleteEventButtonProps {
    eventId: string;
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps): React.ReactElement {
    // ===========================================================================
    // EDUCATIONAL NOTE: useTransition
    // ===========================================================================
    // We use useTransition here to mark the deletion as a background transition.
    // This allows the UI to stay responsive while the server action processes.
    // `isPending` tells us when the action is running so we can show a spinner.
    // ===========================================================================
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
            startTransition(async () => {
                const result = await deleteEventAction(eventId);

                if (result.success) {
                    toast({
                        title: 'Evento eliminado',
                        description: result.message,
                        variant: 'default',
                    });

                    // Delay para ver el toast
                    setTimeout(() => {
                        router.push('/events');
                    }, 500);
                } else {
                    toast({
                        title: 'Error',
                        description: result.message,
                        variant: 'destructive',
                    });
                }
            });
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
        >
            <Trash2 className="h-4 w-4" />
            {isPending ? 'Eliminando...' : 'Eliminar Evento'}
        </Button>
    );
}
