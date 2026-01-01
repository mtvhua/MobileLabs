import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactElement {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Filters Skeleton */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-20" />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Skeleton className="h-10 w-44" />
                    <Skeleton className="h-10 w-44" />
                    <Skeleton className="h-10 w-44" />
                </div>
            </div>

            {/* Event List Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        {/* Image */}
                        <Skeleton className="h-48 w-full rounded-t-lg" />

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
