import Link from "next/link";
import { ArrowRight, GitBranch, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.18),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <Network className="h-4 w-4 text-primary" />
            Engineering memory for GitHub repositories
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Understand how your software architecture evolves.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            ArcHive connects to GitHub, ingests repository events, detects
            architecture changes, and turns engineering activity into searchable
            system intelligence.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/connect-github">
                Connect GitHub
                <GitBranch className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">
                View Demo Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}