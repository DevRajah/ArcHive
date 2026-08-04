import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export function TeamMembersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <Skeleton className="h-10 w-36" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>

              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}