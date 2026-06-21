"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface Repository {
  id: string;
  name: string;
  engineeringScore?: number;
}

interface Props {
  repositories?: Repository[];
}

export function RepositoryRanking({ repositories = [] }: Props) {
  const sorted = [...repositories].sort(
    (a, b) => (b.engineeringScore ?? 0) - (a.engineeringScore ?? 0)
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">
          Top Engineering Repositories
        </h2>

        <div className="mt-6 space-y-5">
          {sorted.slice(0, 5).map((repo) => (
            <Link
              key={repo.id}
              href={`/repositories/${repo.id}`}
              className="block rounded-lg border p-4 transition hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{repo.name}</div>

                  <Progress
                    className="mt-3 h-2 w-56"
                    value={repo.engineeringScore ?? 0}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {repo.engineeringScore ?? 0}
                  </span>

                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}