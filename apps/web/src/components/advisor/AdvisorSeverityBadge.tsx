import { cn } from "@/lib/utils";

import type { AdvisorSeverity } from "@/types/architecture-advisor.types";

const severityStyles: Record<
    AdvisorSeverity,
    string
> = {
    CRITICAL:
        "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",

    HIGH:
        "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",

    MEDIUM:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",

    LOW:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

    INFO:
        "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

export function AdvisorSeverityBadge({
    severity,
    className,
}: {
    severity: AdvisorSeverity;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
                severityStyles[severity] ??
                    severityStyles.INFO,
                className
            )}
        >
            {severity}
        </span>
    );
}