import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminStateCard } from "@/components/admin/AdminStateCard";
import { isAdminForbidden } from "@/lib/admin-errors";

interface AdminQueryErrorProps {
  error: unknown;
  title: string;
  fallback?: string;
  onRetry?: () => void;
}

export function AdminQueryError({
  error,
  title,
  fallback = "Please check the backend connection.",
  onRetry,
}: AdminQueryErrorProps) {
  if (isAdminForbidden(error)) {
    return <AdminAccessRequired />;
  }

  return (
    <AdminStateCard
      title={title}
      description={error instanceof Error ? error.message : fallback}
      onRetry={onRetry}
    />
  );
}