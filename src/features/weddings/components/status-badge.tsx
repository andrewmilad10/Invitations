import type { WeddingStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const STYLES: Record<WeddingStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-secondary text-secondary-foreground" },
  published: { label: "Published", className: "bg-success/10 text-success" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: WeddingStatus }) {
  const s = STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s.className)}>
      <span className={cn("size-1.5 rounded-full", status === "published" ? "bg-success" : "bg-muted-foreground/50")} />
      {s.label}
    </span>
  );
}
