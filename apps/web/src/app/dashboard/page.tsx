import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Engineering Dashboard
          </h1>

          <p className="text-muted-foreground mt-2">
            Monitor repository intelligence, architecture evolution, and
            engineering activity across your tracked systems.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Tracked Repositories
            </p>

            <h2 className="text-3xl font-bold mt-3">12</h2>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Engineering Events
            </p>

            <h2 className="text-3xl font-bold mt-3">8,421</h2>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Architecture Changes
            </p>

            <h2 className="text-3xl font-bold mt-3">214</h2>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Timeline Insights
            </p>

            <h2 className="text-3xl font-bold mt-3">1,204</h2>
          </div>
        </div>
      </div>
    </AppShell>
  );
}