import { Button } from "@/components/ui/button";

interface AdminStateCardProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function AdminStateCard({
  title,
  description,
  onRetry,
}: AdminStateCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}