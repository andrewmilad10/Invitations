import { cn } from "@/lib/utils";
import type { LiveState, OrderStatus } from "../types";

const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const dot = "size-1.5 rounded-full bg-current";

const PAYMENT: Record<OrderStatus, [string, string]> = {
  pending: ["Payment pending", "bg-accent/20 text-foreground"],
  paid: ["Paid", "bg-success/15 text-success"],
  refunded: ["Refunded", "bg-muted text-muted-foreground"],
  cancelled: ["Cancelled", "bg-muted text-muted-foreground"],
};

/** Payment state; the words carry the meaning, the colour only helps scanning. */
export function PaymentBadge({ status }: { status: OrderStatus }) {
  const [text, cls] = PAYMENT[status];
  return (
    <span className={cn(base, cls)}>
      <span className={cn(dot, status === "pending" && "bg-accent")} aria-hidden />
      {text}
    </span>
  );
}

const LIVE: Record<LiveState, [string, string]> = {
  live: ["Live", "bg-primary/10 text-foreground"],
  notLive: ["Not live yet", "border border-dashed border-muted-foreground/50 text-muted-foreground"],
  ended: ["Ended", "bg-muted text-muted-foreground"],
  off: ["Turned off", "bg-destructive/10 text-destructive"],
};

/** Whether the invitation behind the order is live (Shopify's "fulfilled"). */
export function LiveBadge({ live }: { live: LiveState | null }) {
  if (!live) return <span className={cn(base, "bg-muted text-muted-foreground")}>Invitation deleted</span>;
  const [text, cls] = LIVE[live];
  return <span className={cn(base, cls)}>{text}</span>;
}

export function TagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <>
      {tags.map((t) => (
        <span key={t} className="inline-flex rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
          {t}
        </span>
      ))}
    </>
  );
}
