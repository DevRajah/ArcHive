import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message?: string;
}

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />

        <div>
          <p className="font-medium text-destructive">{title}</p>

          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}