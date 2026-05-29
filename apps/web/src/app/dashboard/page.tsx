import { AppShell } from "@/components/layout/AppShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RepositoryHealthChart } from "@/components/dashboard/RepositoryHealthChart";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Engineering Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Monitor repository intelligence, architecture evolution, and
            engineering activity across your tracked systems.
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <RepositoryHealthChart />
          <RecentActivity />
        </div>
      </div>
    </AppShell>
  );
}