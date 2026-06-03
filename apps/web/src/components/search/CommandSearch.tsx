"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, GitBranch, Network, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTrackedRepositories } from "@/hooks/useRepositories";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const { data: repositories } = useTrackedRepositories();

  const repositoryItems = useMemo(() => {
    return repositories || [];
  }, [repositories]);

  function navigateTo(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search repositories, timelines, architecture..." />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigateTo("/dashboard")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>

          <CommandItem onSelect={() => navigateTo("/repositories")}>
            <FolderGit2 className="mr-2 h-4 w-4" />
            <span>Repositories</span>
          </CommandItem>

          <CommandItem onSelect={() => navigateTo("/repositories/import")}>
            <FolderGit2 className="mr-2 h-4 w-4" />
            <span>Import Repository</span>
          </CommandItem>
        </CommandGroup>

        {repositoryItems.length > 0 && (
          <CommandGroup heading="Tracked Repositories">
            {repositoryItems.map((repo) => (
              <CommandItem
                key={repo.id}
                value={`${repo.name} ${repo.fullName} ${repo.description || ""}`}
                onSelect={() => navigateTo(`/repositories/${repo.id}`)}
              >
                <FolderGit2 className="mr-2 h-4 w-4" />

                <div>
                  <p>{repo.fullName || repo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Repository overview
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {repositoryItems.length > 0 && (
          <CommandGroup heading="Repository Timelines">
            {repositoryItems.map((repo) => (
              <CommandItem
                key={`${repo.id}-timeline`}
                value={`${repo.name} timeline engineering history`}
                onSelect={() => navigateTo(`/repositories/${repo.id}/timeline`)}
              >
                <GitBranch className="mr-2 h-4 w-4" />

                <div>
                  <p>{repo.name} timeline</p>
                  <p className="text-xs text-muted-foreground">
                    Engineering evolution history
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {repositoryItems.length > 0 && (
          <CommandGroup heading="Architecture Intelligence">
            {repositoryItems.map((repo) => (
              <CommandItem
                key={`${repo.id}-architecture`}
                value={`${repo.name} architecture system design changes`}
                onSelect={() =>
                  navigateTo(`/repositories/${repo.id}/architecture`)
                }
              >
                <Network className="mr-2 h-4 w-4" />

                <div>
                  <p>{repo.name} architecture</p>
                  <p className="text-xs text-muted-foreground">
                    System architecture intelligence
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}