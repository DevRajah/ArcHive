import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export function TeamRepositoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <Skeleton className="h-10 w-44" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-4">
              <div className="flex justify-between gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-full" />
            </CardHeader>

            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}