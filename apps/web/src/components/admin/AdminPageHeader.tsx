import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
        </div>

        {action}
      </div>
    </div>
  );
}