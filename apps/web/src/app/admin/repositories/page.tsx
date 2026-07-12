"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminRepositoryCard } from "@/components/admin/AdminRepositoryCard";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useAdminDeleteRepository,
  useAdminRepositories,
  useAdminReprocessRepositoryFromList,
} from "@/hooks/useAdmin";
import { getApiErrorMessage } from "@/lib/api-errors";
import { isAdminForbidden } from "@/lib/admin-errors";
import { AdminRepository } from "@/types/admin.types";

const PAGE_SIZE = 10;

export default function AdminRepositoriesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [tracked, setTracked] = useState("");
  const [page, setPage] = useState(1);

  const [repositoryToDelete, setRepositoryToDelete] =
    useState<AdminRepository | null>(null);

  const [activeReprocessId, setActiveReprocessId] =
    useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [language, tracked]);

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [feedback]);

  const { data, isLoading, isError, error, refetch } =
    useAdminRepositories({
      search: debouncedSearch,
      language,
      tracked,
      page,
    });

  const reprocessMutation =
    useAdminReprocessRepositoryFromList();

  const deleteMutation = useAdminDeleteRepository();

  const repositories = data?.repositories || [];
  const total = data?.total ?? repositories.length;

  function handleReprocess(repository: AdminRepository) {
    setActiveReprocessId(repository.id);

    reprocessMutation.mutate(repository.id, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: `${
            repository.fullName || repository.name
          } was queued for intelligence reprocessing.`,
        });
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(
            error,
            "Failed to reprocess repository."
          ),
        });
      },

      onSettled: () => {
        setActiveReprocessId(null);
      },
    });
  }

  function handleDelete() {
    if (!repositoryToDelete) return;

    const repository = repositoryToDelete;

    deleteMutation.mutate(repository.id, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          message: `${
            repository.fullName || repository.name
          } was deleted successfully.`,
        });

        setRepositoryToDelete(null);
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(
            error,
            "Failed to delete repository."
          ),
        });
      },
    });
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Repositories"
          description="Manage imported repositories, intelligence refresh state, architecture signals, and repository ownership."
        />

        {feedback && (
          <div
            className={`rounded-xl border p-4 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-destructive/30 bg-destructive/10"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                feedback.type === "success"
                  ? "text-emerald-500"
                  : "text-destructive"
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_0.5fr_0.4fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories..."
                className="pl-9"
              />
            </div>

            <Input
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="Filter by language"
            />

            <select
              value={tracked}
              onChange={(event) => setTracked(event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All repositories</option>
              <option value="true">Tracked only</option>
              <option value="false">Untracked only</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        )}

        {isError && isAdminForbidden(error) && (
          <AdminAccessRequired />
        )}

        {isError && !isAdminForbidden(error) && (
          <AdminStateCard
            title="Failed to load repositories"
            description={
              error instanceof Error
                ? error.message
                : "Please check backend connection."
            }
            onRetry={() => refetch()}
          />
        )}

        {!isLoading &&
          !isError &&
          repositories.length === 0 && (
            <AdminStateCard
              title="No repositories found"
              description="No repositories match the current filters."
            />
          )}

        {!isLoading &&
          !isError &&
          repositories.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {repositories.map((repository) => (
                  <AdminRepositoryCard
                    key={repository.id}
                    repository={repository}
                    isReprocessing={
                      reprocessMutation.isPending &&
                      activeReprocessId === repository.id
                    }
                    isDeleting={
                      deleteMutation.isPending &&
                      repositoryToDelete?.id === repository.id
                    }
                    onReprocess={handleReprocess}
                    onDelete={setRepositoryToDelete}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {repositories.length} of {total} repositories.
              </p>

              <AdminPagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}

        <ConfirmDialog
          open={Boolean(repositoryToDelete)}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) {
              setRepositoryToDelete(null);
            }
          }}
          title="Delete repository?"
          description={
            repositoryToDelete
              ? `This will permanently remove ${
                  repositoryToDelete.fullName ||
                  repositoryToDelete.name
                } and its associated ArcHive data.`
              : "This action cannot be undone."
          }
          confirmLabel="Delete Repository"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      </div>
    </AppShell>
  );
}