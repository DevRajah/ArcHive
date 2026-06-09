import { Boxes, Clock3, Cpu, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArchitectureEvolutionDomain } from "@/types/architecture-evolution.types";
import { formatFilterLabel } from "@/lib/filters";

interface ArchitectureDomainOverviewProps {
  domains: ArchitectureEvolutionDomain[];
}

function formatDate(value?: string | null) {
  if (!value) return "No recent change";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No recent change";

  return date.toLocaleString();
}

export function ArchitectureDomainOverview({
  domains,
}: ArchitectureDomainOverviewProps) {
  if (domains.length === 0) return null;

  const totalChanges = domains.reduce(
    (sum, domain) => sum + domain.totalChanges,
    0
  );

  const totalTechnologies = new Set(
    domains.flatMap((domain) => domain.technologies || [])
  ).size;

  const mostActiveDomain = [...domains].sort(
    (a, b) => b.totalChanges - a.totalChanges
  )[0];

  const latestDomain = [...domains].sort((a, b) => {
    const aTime = a.latestChangeAt ? new Date(a.latestChangeAt).getTime() : 0;
    const bTime = b.latestChangeAt ? new Date(b.latestChangeAt).getTime() : 0;

    return bTime - aTime;
  })[0];

  const cards = [
    {
      label: "Visible Domains",
      value: domains.length,
      description: "Architecture domains currently in view",
      icon: Network,
    },
    {
      label: "Visible Changes",
      value: totalChanges,
      description: "Architecture changes after filtering",
      icon: Boxes,
    },
    {
      label: "Technologies",
      value: totalTechnologies,
      description: "Technologies across visible domains",
      icon: Cpu,
    },
    {
      label: "Latest Signal",
      value: latestDomain?.label || formatFilterLabel(latestDomain?.domain),
      description: formatDate(latestDomain?.latestChangeAt),
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>

              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold">{card.value}</h3>

            <p className="mt-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}

      <div className="rounded-xl border border-border bg-card p-5 md:col-span-2 xl:col-span-4">
        <p className="text-sm font-medium">Most Active Visible Domain</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>{mostActiveDomain.label || formatFilterLabel(mostActiveDomain.domain)}</Badge>

          <span className="text-sm text-muted-foreground">
            {mostActiveDomain.totalChanges} changes detected
          </span>
        </div>
      </div>
    </div>
  );
}