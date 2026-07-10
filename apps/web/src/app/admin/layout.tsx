import { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">
        <AdminSidebar />
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}