import type { Metadata } from "next";
import { fmtDayTime, fmtMoney } from "@/features/admin/format";
import { loadActivity, requireStaff } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Activity" };

const WHAT: Record<string, string> = {
  "sale.record": "recorded a sale",
  "sale.refund": "refunded a sale",
  "wedding.deactivate": "turned off an invitation",
  "wedding.reactivate": "turned an invitation back on",
  "wedding.extend": "changed how long an invitation stays live",
  "staff.set": "changed the team",
};

function detail(action: string, d: Record<string, unknown>) {
  if (action === "sale.record") return `${fmtMoney(Number(d.amount))} by ${String(d.method ?? "")}, ${String(d.months ?? "")} months`;
  if (action === "sale.refund") return fmtMoney(Number(d.amount));
  if (action === "wedding.extend") return `${Number(d.days) > 0 ? "+" : ""}${String(d.days)} days`;
  if (action === "wedding.deactivate") return d.reason ? `Reason: ${String(d.reason)}` : "";
  if (action === "staff.set") return `${String(d.email ?? "")} → ${d.role ? String(d.role) : "removed"}`;
  return "";
}

export default async function AdminActivity() {
  await requireStaff(["owner", "admin"]);
  const rows = await loadActivity(300);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Activity</h1>
        <p className="mt-1 text-muted-foreground">Every change made in admin, who made it and when. Entries can&apos;t be edited or deleted.</p>
      </div>
      {rows.length ? (
        <ol className="grid gap-2">
          {rows.map((r, i) => (
            <li key={`${r.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
              <span>
                <b className="font-medium">{r.actor ?? "Someone removed"}</b> {WHAT[r.action] ?? r.action}
                {detail(r.action, r.details) ? <span className="text-muted-foreground"> · {detail(r.action, r.details)}</span> : null}
              </span>
              <time className="text-muted-foreground" dateTime={r.at}>{fmtDayTime(r.at)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-2xl border border-dashed px-6 py-14 text-center text-muted-foreground">Nothing yet. Changes made here will be listed.</p>
      )}
    </div>
  );
}
