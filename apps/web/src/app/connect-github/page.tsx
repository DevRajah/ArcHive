"use client";

import { GitBranch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConnectGitHubPage() {
    function handleConnectGitHub() {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        window.location.href = `${apiUrl}/github/oauth/login`;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <GitBranch className="h-7 w-7 text-primary" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    Connect your GitHub account
                </h1>

                <p className="mt-3 text-muted-foreground">
                    ArcHive uses GitHub OAuth to securely access repositories you choose
                    to import and analyze.
                </p>

                <div className="mt-6 rounded-xl border border-border bg-background p-4">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />

                        <div>
                            <p className="text-sm font-medium">Secure OAuth flow</p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Your repository intelligence is generated through authenticated
                                GitHub access and backend-controlled import workflows.
                            </p>
                        </div>
                    </div>
                </div>

                <Button onClick={handleConnectGitHub} className="mt-6 w-full" size="lg">
                    Continue with GitHub
                    <GitBranch className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </main>
    );
}