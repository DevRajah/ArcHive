import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 w-[320px]">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            placeholder="Search repositories..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20" />

            <div>
              <p className="text-sm font-medium">Michael</p>

              <p className="text-xs text-muted-foreground">
                Software Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}