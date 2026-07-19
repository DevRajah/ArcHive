import Link from "next/link";
import { Network } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DependencyEmptyState({
  title,
  description,
  showRepositoriesLink = false,
}: {
  title: string;
  description: string;
  showRepositoriesLink?: boolean;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <Network className="mx-auto h-10 w-10 text-muted-foreground" />

      <h2 className="mt-4 text-xl font-semibold">{title}</h2>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {showRepositoriesLink && (
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/repositories">Open Repositories</Link>
          </Button>
        </div>
      )}
    </div>
  );
}