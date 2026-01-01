'use client';

import { Send } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { updateEventAction } from '@/actions/eventActions';
import type { FormState } from '@/types/event';

interface PublishButtonProps {
    eventId: string;
}

const initialState: FormState = {
    success: false,
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="sm" className="gap-2" disabled={pending} variant="outline">
            <Send className="h-4 w-4" />
            {pending ? 'Publicando...' : 'Publicar'}
        </Button>
    );
}

export function PublishButton({ eventId }: PublishButtonProps): React.ReactElement {
    // Bind the event ID to the action
    const publishAction = updateEventAction.bind(null, eventId);
    const [state, formAction] = useActionState(publishAction, initialState);

    return (
        <form action={formAction}>
            <input type="hidden" name="status" value="publicado" />
            <SubmitButton />
            {!state.success && state.message && (
                <p className="text-xs text-destructive mt-1">{state.message}</p>
            )}
        </form>
    );
}
