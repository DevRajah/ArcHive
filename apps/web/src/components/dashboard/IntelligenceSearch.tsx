"use client";

import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIntelligenceSearch } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";

type SearchRepositoryResult = {
    id?: string;
    name: string;
    fullName?: string | null;
    semanticLabel?: string | null;
    repositoryTypes?: string[];
    dominantDomains?: string[];
    technologies?: string[];
};

function normalizeEnumInput(value: string) {
    return value.trim().replace(/\s+/g, "_").toUpperCase();
}

function normalizeTextInput(value: string) {
    return value.trim();
}

function useDebouncedValue(value: string, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function getRepositories(data: unknown): SearchRepositoryResult[] {
    if (Array.isArray(data)) {
        return data as SearchRepositoryResult[];
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const response = data as {
        repositories?: SearchRepositoryResult[];
        results?: SearchRepositoryResult[];
        data?: {
            repositories?: SearchRepositoryResult[];
            results?: SearchRepositoryResult[];
        };
    };

    return (
        response.repositories ||
        response.results ||
        response.data?.repositories ||
        response.data?.results ||
        []
    );
}

export function IntelligenceSearch() {
    const [query, setQuery] = useState("");
    const [repositoryType, setRepositoryType] = useState("");
    const [domain, setDomain] = useState("");
    const [technology, setTechnology] = useState("");

    const debouncedQuery = useDebouncedValue(query);
    const debouncedRepositoryType = useDebouncedValue(repositoryType);
    const debouncedDomain = useDebouncedValue(domain);
    const debouncedTechnology = useDebouncedValue(technology);

    const searchParams = {
        query: normalizeTextInput(debouncedQuery),
        repositoryType: debouncedRepositoryType
            ? normalizeEnumInput(debouncedRepositoryType)
            : "",
        domain: debouncedDomain ? normalizeEnumInput(debouncedDomain) : "",
        technology: normalizeTextInput(debouncedTechnology),
    };

    const hasSearch =
        Boolean(searchParams.query) ||
        Boolean(searchParams.repositoryType) ||
        Boolean(searchParams.domain) ||
        Boolean(searchParams.technology);

    const { data, isLoading, isError, error } = useIntelligenceSearch(
        hasSearch ? searchParams : {}
    );

    const repositories = getRepositories(data);

    function clearFilters() {
        setQuery("");
        setRepositoryType("");
        setDomain("");
        setTechnology("");
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-4 w-4 text-primary" />
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Intelligence Search</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Search repositories by semantic purpose, architecture domain,
                        repository type, or technology.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search intelligence..."
                />

                <Input
                    value={repositoryType}
                    onChange={(event) => setRepositoryType(event.target.value)}
                    placeholder="Repository type e.g. fintech platform"
                />

                <Input
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="Domain e.g. queue infrastructure"
                />

                <Input
                    value={technology}
                    onChange={(event) => setTechnology(event.target.value)}
                    placeholder="Technology e.g. BullMQ"
                />
            </div>

            <div className="mt-3 flex flex-col justify-between gap-3 text-xs text-muted-foreground md:flex-row md:items-center">
                <p>
                    Tip: repository type and domain are normalized automatically.
                    Multiple filters are combined together, so use one filter for broader
                    results.
                </p>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!hasSearch}
                >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Clear filters
                </Button>
            </div>

            {!hasSearch && (
                <div className="mt-6 rounded-xl border border-border bg-background p-5">
                    <p className="text-sm font-medium">
                        Start by searching one intelligence signal.
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Try BullMQ, queue infrastructure, realtime systems, or engineering
                        intelligence.
                    </p>
                </div>
            )}

            {hasSearch && isLoading && (
                <p className="mt-6 text-sm text-muted-foreground">
                    Searching repository intelligence...
                </p>
            )}

            {hasSearch && isError && (
                <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                    <p className="text-sm font-medium text-destructive">
                        Failed to search repository intelligence
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error instanceof Error
                            ? error.message
                            : "Please check backend connection."}
                    </p>
                </div>
            )}

            {hasSearch && !isLoading && !isError && repositories.length === 0 && (
                <div className="mt-6 rounded-xl border border-border bg-background p-5">
                    <p className="text-sm font-medium">
                        No matching intelligence results found.
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        This usually means no persisted architecture intelligence currently
                        matches the active filter.
                    </p>
                </div>
            )}

            {hasSearch && !isLoading && !isError && repositories.length > 0 && (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {repositories.map((repo, index) => {
                        const repositoryKey =
                            repo.id ||
                            repo.fullName ||
                            repo.name ||
                            `repository-${index}`;

                        const repositoryHref = repo.id
                            ? `/repositories/${repo.id}/intelligence`
                            : "";

                        return (
                            <Link
                                key={`${repositoryKey}-${index}`}
                                href={repositoryHref || "/repositories"}
                                className="group rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
                            >
                                <div className="flex justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold">
                                            {repo.fullName || repo.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {repo.semanticLabel || repo.fullName || repo.name || "Repository intelligence match"}                    </p>
                                    </div>

                                    {repo.id && (
                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                                    )}                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {repo.repositoryTypes?.slice(0, 3).map((type, typeIndex) => (
                                        <Badge
                                            key={`${type}-${typeIndex}`}
                                            variant="outline"
                                        >
                                            {formatFilterLabel(type)}
                                        </Badge>
                                    ))}

                                    {repo.dominantDomains
                                        ?.slice(0, 3)
                                        .map((domain, domainIndex) => (
                                            <Badge
                                                key={`${domain}-${domainIndex}`}
                                                variant="secondary"
                                            >
                                                {formatFilterLabel(domain)}
                                            </Badge>
                                        ))}

                                    {repo.technologies
                                        ?.slice(0, 3)
                                        .map((technology, technologyIndex) => (
                                            <Badge
                                                key={`${technology}-${technologyIndex}`}
                                                variant="outline"
                                            >
                                                {technology}
                                            </Badge>
                                        ))}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}