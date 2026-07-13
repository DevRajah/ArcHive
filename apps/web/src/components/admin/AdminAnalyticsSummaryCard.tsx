import { LucideIcon } from "lucide-react";

interface AdminAnalyticsSummaryCardProps {
  label: string;
  value: number;
  description?: string;
  icon: LucideIcon;
}

export function AdminAnalyticsSummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: AdminAnalyticsSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>

          <p className="mt-3 text-3xl font-bold">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}