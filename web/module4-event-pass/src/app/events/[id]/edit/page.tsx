import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventForm } from '@/components/EventForm';
import { getEventById } from '@/data/events';

interface EditEventPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditEventPage({ params }: EditEventPageProps): Promise<React.ReactElement> {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button asChild variant="ghost" className="mb-6 gap-2">
                <Link href={`/events/${id}`}>
                    <ArrowLeft className="h-4 w-4" />
                    Volver al detalle
                </Link>
            </Button>

            <EventForm eventId={event.id} initialData={event} />
        </div>
    );
}
