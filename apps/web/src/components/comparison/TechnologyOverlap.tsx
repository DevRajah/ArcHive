import { Badge } from "@/components/ui/badge";

interface TechnologyOverlapProps {
  title: string;
  leftName: string;
  rightName: string;
  leftItems?: string[];
  rightItems?: string[];
}

function unique(items?: string[]) {
  return Array.from(new Set(items || []));
}

export function TechnologyOverlap({
  title,
  leftName,
  rightName,
  leftItems,
  rightItems,
}: TechnologyOverlapProps) {
  const left = unique(leftItems);
  const right = unique(rightItems);

  const shared = left.filter((item) => right.includes(item));
  const onlyLeft = left.filter((item) => !right.includes(item));
  const onlyRight = right.filter((item) => !left.includes(item));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-medium">Shared</p>
          <div className="flex flex-wrap gap-2">
            {shared.length ? (
              shared.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
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
          <p className="mb-3 text-sm font-medium">Unique to {leftName}</p>
          <div className="flex flex-wrap gap-2">
            {onlyLeft.length ? (
              onlyLeft.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
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
          <p className="mb-3 text-sm font-medium">Unique to {rightName}</p>
          <div className="flex flex-wrap gap-2">
            {onlyRight.length ? (
              onlyRight.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
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
    </div>
  );
}