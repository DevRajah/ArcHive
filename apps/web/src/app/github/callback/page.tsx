"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveSession } from "@/lib/auth";

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);

  const callbackData = useMemo(() => {
    return {
      userId: searchParams.get("userId"),
      username: searchParams.get("username") || undefined,
      avatarUrl: searchParams.get("avatarUrl") || undefined,
      token: searchParams.get("token") || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!callbackData.userId) {
      setError(
        "GitHub connection completed, but no userId was returned to the frontend."
      );
      return;
    }

    saveSession({
      userId: callbackData.userId,
      username: callbackData.username,
      avatarUrl: callbackData.avatarUrl,
      token: callbackData.token,
    });

    router.replace("/dashboard");
  }, [callbackData, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <GitBranch className="h-7 w-7 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold">GitHub connection issue</h1>

          <p className="mt-3 text-sm text-muted-foreground">{error}</p>

          <Button
            className="mt-6"
            onClick={() => router.push("/connect-github")}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>

        <h1 className="text-2xl font-bold">Completing GitHub connection</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          ArcHive is preparing your engineering intelligence workspace.
        </p>
      </div>
    </main>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>

            <h1 className="text-2xl font-bold">
              Completing GitHub connection
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              ArcHive is preparing your engineering intelligence workspace.
            </p>
          </div>
        </main>
      }
    >
      <GitHubCallbackContent />
    </Suspense>
  );
}