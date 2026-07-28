"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface OrganizationEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export default function OrganizationEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className = "",
}: OrganizationEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="text-base font-semibold">
          {title}
        </h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}