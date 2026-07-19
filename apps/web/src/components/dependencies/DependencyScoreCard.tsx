import type { LucideIcon } from "lucide-react";

export function DependencyScoreCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>

          <p className="mt-3 break-words text-2xl font-bold">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}