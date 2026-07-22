import { Skeleton } from "@/components/ui/skeleton";

export function RepositoryHealthLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[390px] rounded-2xl" />

      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-5 w-[520px] max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-72 rounded-xl"
            />
          ),
        )}
      </div>

      <Skeleton className="h-[430px] rounded-xl" />

      <Skeleton className="h-[430px] rounded-xl" />

      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}