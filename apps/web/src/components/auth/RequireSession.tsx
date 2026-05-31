"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function RequireSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace("/connect-github");
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}