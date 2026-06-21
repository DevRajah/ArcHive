"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  technologies?: string[];
}

export function TechnologyAdoption({
  technologies = [],
}: Props) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">
          Technology Adoption
        </h2>

        <div className="mt-5 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}