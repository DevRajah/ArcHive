import Link from "next/link";
import { GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RepositoryCardProps {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  status: "TRACKED" | "UNTRACKED";
}

export function RepositoryCard({
  id,
  name,
  description,
  language,
  stars,
  forks,
  status,
}: RepositoryCardProps) {
  return (
    <Link
      href={`/repositories/${id}`}
      className="block rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-card/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <Badge variant={status === "TRACKED" ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>

      <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
        <span>{language}</span>

        <span className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          {stars}
        </span>

        <span className="flex items-center gap-1">
          <GitFork className="h-4 w-4" />
          {forks}
        </span>
      </div>
    </Link>
  );
}