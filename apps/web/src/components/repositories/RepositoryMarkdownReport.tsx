"use client";

import { useState } from "react";
import { Check, Clipboard, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepositoryMarkdownReportResponse } from "@/types/repository-markdown-report.types";

interface RepositoryMarkdownReportProps {
    data?: RepositoryMarkdownReportResponse;
    isLoading?: boolean;
    repositoryName?: string;
}

export function RepositoryMarkdownReport({
    data,
    isLoading,
    repositoryName = "repository",
}: RepositoryMarkdownReportProps) {
    const [isCopied, setIsCopied] = useState(false);
    async function copyMarkdown() {
        if (!data?.markdown) return;

        await navigator.clipboard.writeText(data.markdown);

        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    function downloadMarkdown() {
        if (!data?.markdown) return;

        const blob = new Blob([data.markdown], {
            type: "text/markdown;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `${repositoryName.replaceAll("/", "-")}-intelligence-report.md`;
        anchor.click();

        URL.revokeObjectURL(url);
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    Preparing markdown report...
                </p>
            </div>
        );
    }

    if (!data?.markdown) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Markdown Intelligence Report</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    No markdown report is available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">
                            Markdown Intelligence Report
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Export this repository intelligence report for portfolio,
                            documentation, technical review, or evidence tracking.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={copyMarkdown}>
                        {isCopied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Clipboard className="mr-2 h-4 w-4" />
                                Copy
                            </>
                        )}
                    </Button>

                    <Button onClick={downloadMarkdown}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <pre className="mt-6 max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6 text-muted-foreground">
                {data.markdown}
            </pre>
        </div>
    );
}