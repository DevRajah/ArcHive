import {
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReportsErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ReportsErrorState({
  onRetry,
  isRetrying = false,
}: ReportsErrorStateProps) {
  return (
    <Card className="flex min-h-[360px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <TriangleAlert className="h-7 w-7 text-destructive" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Unable to load reports
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please try again. Your existing reports have not
          been affected.
        </p>

        <Button
          variant="outline"
          className="mt-6"
          disabled={isRetrying}
          onClick={onRetry}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${
              isRetrying ? "animate-spin" : ""
            }`}
          />

          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      </div>
    </Card>
  );
}