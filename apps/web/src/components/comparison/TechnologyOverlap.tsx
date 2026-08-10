import {
  CheckCircle2,
  GitCompareArrows,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  formatIntelligenceLabel,
} from "@/lib/intelligence-labels";

interface TechnologyOverlapProps {
  title: string;

  leftName: string;
  rightName: string;

  leftItems?: string[];
  rightItems?: string[];

  description?: string;
}

function unique(
  items?: string[],
) {
  return Array.from(
    new Set(items || []),
  );
}

export function TechnologyOverlap({
  title,
  leftName,
  rightName,
  leftItems,
  rightItems,
  description,
}: TechnologyOverlapProps) {
  const left =
    unique(leftItems);

  const right =
    unique(rightItems);

  const shared =
    left.filter((item) =>
      right.includes(item),
    );

  const onlyLeft =
    left.filter(
      (item) =>
        !right.includes(item),
    );

  const onlyRight =
    right.filter(
      (item) =>
        !left.includes(item),
    );

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <GitCompareArrows className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description ||
                "Compare signals shared by both repositories and signals unique to either side."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {shared.length} shared
          </Badge>

          <Badge variant="outline">
            {onlyLeft.length} unique to{" "}
            {leftName}
          </Badge>

          <Badge variant="outline">
            {onlyRight.length} unique to{" "}
            {rightName}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />

            <p className="text-sm font-medium">
              Shared
            </p>

            <Badge
              variant="secondary"
              className="ml-auto"
            >
              {shared.length}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {shared.length ? (
              shared.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                >
                  {formatIntelligenceLabel(
                    item,
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No shared signals detected.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">
              Unique to {leftName}
            </p>

            <Badge variant="outline">
              {onlyLeft.length}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {onlyLeft.length ? (
              onlyLeft.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                >
                  {formatIntelligenceLabel(
                    item,
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No unique signals detected.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">
              Unique to {rightName}
            </p>

            <Badge variant="outline">
              {onlyRight.length}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {onlyRight.length ? (
              onlyRight.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                >
                  {formatIntelligenceLabel(
                    item,
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No unique signals detected.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}