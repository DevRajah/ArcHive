import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminAccessRequired() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
        <ShieldAlert className="h-7 w-7 text-destructive" />
      </div>

      <h1 className="mt-5 text-2xl font-bold">
        Administrator Access Required
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Your account is authenticated, but it does not have permission to open
        ArcHive administration tools.
      </p>

      <Button asChild className="mt-6">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}