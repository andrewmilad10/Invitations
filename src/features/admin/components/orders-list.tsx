import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { dayLabel, fmtMoney, fmtTime } from "../format";
import type { AdminOrder } from "../types";
import { LiveBadge, PaymentBadge, TagChips } from "./order-badges";

/**
 * Orders grouped by Cairo day ("Today", "Yesterday", a date), newest first,
 * one tappable row each, like a shop's order list. Server-rendered: no
 * JavaScript is needed to show it.
 */
export function OrdersList({ rows, designNames }: { rows: AdminOrder[]; designNames: Record<string, string> }) {
  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed px-6 py-14 text-center text-muted-foreground">No orders here.</p>;
  }
  const now = new Date();
  const groups: { label: string; rows: AdminOrder[] }[] = [];
  for (const r of rows) {
    const label = dayLabel(r.createdAt, now);
    const last = groups.at(-1);
    if (last?.label === label) last.rows.push(r);
    else groups.push({ label, rows: [r] });
  }
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {groups.map((g) => (
        <section key={g.label} aria-label={g.label}>
          <h2 className="border-b bg-muted/60 px-4 py-2 text-sm text-muted-foreground">{g.label}</h2>
          <ul>
            {g.rows.map((o) => (
              <li key={o.id} className="border-b last:border-0">
                <Link href={`/admin/orders/${o.id}`} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 px-4 py-3.5 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold tabular-nums">#{o.number}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {fmtTime(o.createdAt)}
                      {" · "}
                      {o.customerName ?? o.customerEmail ?? "Customer"}
                    </span>
                  </span>
                  <span className="flex items-start gap-1 text-right">
                    <span className="tabular-nums">{fmtMoney(o.amount)}</span>
                    <ChevronRight className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="col-span-2 flex flex-wrap items-center gap-1.5">
                    <PaymentBadge status={o.status} />
                    {o.status !== "cancelled" ? <LiveBadge live={o.live} /> : null}
                    {o.kind === "renewal" ? <span className="text-xs text-muted-foreground">Renewal</span> : null}
                    <TagChips tags={o.tags} />
                  </span>
                  <span className="col-span-2 -mt-0.5 truncate text-xs text-muted-foreground">
                    {o.names ?? "Invitation deleted"}
                    {o.templateId ? ` · ${designNames[o.templateId] ?? o.templateId}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
