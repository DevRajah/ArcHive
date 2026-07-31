import {
  FileBarChart,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReportsEmptyStateProps {
  onGenerate: () => void;
}

export function ReportsEmptyState({
  onGenerate,
}: ReportsEmptyStateProps) {
  return (
    <Card className="flex min-h-[420px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/50">
          <FileBarChart className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-6 text-xl font-semibold">
          No Executive Reports Yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Generate your first Executive Report to capture
          your organisation&apos;s engineering intelligence.
        </p>

        <Button
          className="mt-6"
          onClick={onGenerate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </Card>
  );
}