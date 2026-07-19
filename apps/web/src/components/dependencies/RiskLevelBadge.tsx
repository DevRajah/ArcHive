import { AlertTriangle, CircleAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DependencyRiskLevel } from "@/types/dependency-intelligence.types";

export function RiskLevelBadge({
  riskLevel,
}: {
  riskLevel?: DependencyRiskLevel | null;
}) {
  const value = riskLevel || "LOW";

  const configuration =
    value === "CRITICAL"
      ? {
          icon: CircleAlert,
          className:
            "border-destructive/40 bg-destructive/10 text-destructive",
        }
      : value === "HIGH"
        ? {
            icon: AlertTriangle,
            className:
              "border-orange-500/40 bg-orange-500/10 text-orange-600",
          }
        : value === "MEDIUM"
          ? {
              icon: AlertTriangle,
              className:
                "border-amber-500/40 bg-amber-500/10 text-amber-600",
            }
          : {
              icon: ShieldCheck,
              className:
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
            };

  const Icon = configuration.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5", configuration.className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {value}
    </Badge>
  );
}