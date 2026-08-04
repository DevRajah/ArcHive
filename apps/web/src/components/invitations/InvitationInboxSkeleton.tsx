import { Skeleton } from "@/components/ui/skeleton";

export function InvitationInboxSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36 rounded-xl"
          />
        ))}
      </div>

      <Skeleton className="h-10 w-full max-w-xl" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[430px] rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}