import {
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamRepositoriesErrorProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export function TeamRepositoriesError({
  isRetrying,
  onRetry,
}: TeamRepositoriesErrorProps) {
  return (
    <Card className="flex min-h-[360px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-14 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive" />

        <h2 className="mt-4 text-xl font-semibold">
          Unable to load team repositories
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ArcHive could not load repositories attached to this workspace.
        </p>

        <Button
          variant="outline"
          className="mt-6"
          disabled={isRetrying}
          onClick={onRetry}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${
              isRetrying
                ? "animate-spin"
                : ""
            }`}
          />

          {isRetrying
            ? "Retrying..."
            : "Retry"}
        </Button>
      </div>
    </Card>
  );
}