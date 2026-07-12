import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface AdminQuickLinkProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function AdminQuickLink({
  title,
  description,
  href,
  icon: Icon,
}: AdminQuickLinkProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold">{title}</h3>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  );
}