import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value?: number | string;
  description?: string;
  icon: LucideIcon;
}

export function AdminStatCard({
  label,
  value = 0,
  description,
  icon: Icon,
}: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h2 className="mt-3 text-3xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h2>
        </div>

        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}