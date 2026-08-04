import Link from "next/link";

import {
  MailOpen,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InvitationInboxEmptyState() {
  return (
    <Card className="flex min-h-[420px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/40">
          <MailOpen className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-6 text-xl font-semibold">
          You Have No Team Invitations
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Invitations addressed to your ArcHive account will appear
          here when another workspace invites you.
        </p>

        <Button
          asChild
          variant="outline"
          className="mt-6"
        >
          <Link href="/teams">
            <UsersRound className="mr-2 h-4 w-4" />
            View Your Teams
          </Link>
        </Button>
      </div>
    </Card>
  );
}