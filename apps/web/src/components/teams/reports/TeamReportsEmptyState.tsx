import {
  FileBarChart2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamReportsEmptyStateProps {
  canGenerateReports: boolean;
  onGenerate: () => void;
}

export function TeamReportsEmptyState({
  canGenerateReports,
  onGenerate,
}: TeamReportsEmptyStateProps) {
  return (
    <Card className="flex min-h-[400px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/40">
          <FileBarChart2 className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-6 text-xl font-semibold">
          No Team Reports Yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Generate your first shared Executive Report to capture this
          workspace&apos;s engineering intelligence.
        </p>

        {canGenerateReports ? (
          <Button
            className="mt-6"
            onClick={onGenerate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        ) : null}
      </div>
    </Card>
  );
}