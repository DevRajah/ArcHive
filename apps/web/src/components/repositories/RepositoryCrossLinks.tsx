"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RepositoryCrossLink {
  label: string;
  description: string;
  href: string;
}

interface RepositoryCrossLinksProps {
  title?: string;
  links: RepositoryCrossLink[];
}

export function RepositoryCrossLinks({
  title = "Continue Exploring",
  links,
}: RepositoryCrossLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {link.description}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}