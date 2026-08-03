import { Skeleton } from "@/components/ui/skeleton";

export function TeamDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Array.from({
          length: 9,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36 rounded-xl"
          />
        ))}
      </div>

      <Skeleton className="h-96 rounded-xl" />

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-xl" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>

      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  );
}