import { Skeleton } from "@/components/ui/skeleton";

export function AdvisorLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-[360px] rounded-2xl" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-64 rounded-xl"
                        />
                    )
                )}
            </div>

            <Skeleton className="h-44 rounded-xl" />

            <div className="grid gap-5 xl:grid-cols-2">
                {Array.from({ length: 4 }).map(
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-72 rounded-xl"
                        />
                    )
                )}
            </div>

            <Skeleton className="h-[500px] rounded-xl" />
        </div>
    );
}