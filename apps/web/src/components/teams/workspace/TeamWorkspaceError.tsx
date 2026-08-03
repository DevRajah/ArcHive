import Link from "next/link";

import {
  ArrowLeft,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamWorkspaceErrorProps {
  message?: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function TeamWorkspaceError({
  message,
  isRetrying,
  onRetry,
}: TeamWorkspaceErrorProps) {
  return (
    <Card className="flex min-h-[440px] items-center justify-center border-dashed">
      <div className="max-w-lg px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <TriangleAlert className="h-7 w-7 text-destructive" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Unable to load Team Workspace
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message ||
            "ArcHive could not load this workspace. You may not have access, or the team may no longer exist."}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="outline"
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

          <Button asChild>
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Teams
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}