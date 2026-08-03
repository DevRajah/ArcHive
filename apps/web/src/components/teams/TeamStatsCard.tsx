import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface TeamStatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
}

export function TeamStatsCard({
  title,
  value,
  description,
  icon: Icon,
}: TeamStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight">
              {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}