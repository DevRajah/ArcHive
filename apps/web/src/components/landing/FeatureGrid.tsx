import { Activity, GitBranch, Network, Shield, Workflow } from "lucide-react";

const features = [
  {
    title: "GitHub Repository Intelligence",
    description: "Import repositories and convert commits, PRs, and webhooks into engineering signals.",
    icon: GitBranch,
  },
  {
    title: "Architecture Evolution History",
    description: "Detect meaningful system-level changes across modules, services, queues, and database layers.",
    icon: Network,
  },
  {
    title: "Engineering Timelines",
    description: "Generate a chronological memory of how each repository changes over time.",
    icon: GitBranch,
  },
  {
    title: "Webhook Processing",
    description: "Process live GitHub events through backend queues and workers.",
    icon: Workflow,
  },
  {
    title: "Operational Intelligence",
    description: "Surface repository health, activity patterns, and technical decision signals.",
    icon: Activity,
  },
  {
    title: "Secure OAuth Flow",
    description: "Connect GitHub using authenticated OAuth and protected repository access.",
    icon: Shield,
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">
          Built like an engineering intelligence layer.
        </h2>
        <p className="mt-3 text-muted-foreground">
          ArcHive is not just a GitHub dashboard. It is designed to remember,
          analyze, and explain how software systems evolve.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">{feature.title}</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}