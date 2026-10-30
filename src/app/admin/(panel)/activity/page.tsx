import type { Metadata } from "next";
import { fmtCount, fmtDayTime, fmtMoney } from "@/features/admin/format";
import { loadActivity, loadDraftLog, loadDraftStats, requireStaff } from "@/features/admin/queries";
import type { DraftLogRow, DraftStats } from "@/features/admin/types";

export const metadata: Metadata = { title: "Activity" };

const WHAT: Record<string, string> = {
  "sale.record": "recorded a sale",
  "sale.refund": "refunded a sale",
  "wedding.deactivate": "turned off an invitation",
  "wedding.reactivate": "turned an invitation back on",
  "wedding.extend": "changed how long an invitation stays live",
  "staff.set": "changed the team",
  "order.paid": "marked an order as paid",
  "order.cancel": "cancelled an order",
  "order.tags": "changed an order's tags",
  "reminder.sent": "sent a renewal reminder",
  "job.daily": "ran the nightly jobs",
};

function detail(action: string, d: Record<string, unknown>) {
  if (action === "sale.record") return `${fmtMoney(Number(d.amount))} by ${String(d.method ?? "")}, ${String(d.months ?? "")} months`;
  if (action === "sale.refund") return fmtMoney(Number(d.amount));
  if (action === "wedding.extend") return `${Number(d.days) > 0 ? "+" : ""}${String(d.days)} days`;
  if (action === "wedding.deactivate") return d.reason ? `Reason: ${String(d.reason)}` : "";
  if (action === "job.daily") return `${Number(d.unpaidOrdersCancelled ?? 0)} unpaid orders cancelled, ${Number(d.renewalRemindersQueued ?? 0)} reminders queued`;
  if (action === "order.paid") return `${fmtMoney(Number(d.amount))}${d.warning ? ` · after a warning: ${String(d.warning)}` : ""}`;
  if (action === "order.cancel") return d.reason ? `Reason: ${String(d.reason)}` : "";
  if (action === "staff.set") return `${String(d.email ?? "")} → ${d.role ? String(d.role) : "removed"}`;
  return "";
}

const DRAFT_WHAT: Record<DraftLogRow["action"], string> = {
  "draft.created": "started a draft",
  "draft.published": "published",
  "draft.deleted_user": "removed their own draft",
  "draft.expired": "removed — 14 days, never published",
};

function Drafts({ stats, log }: { stats: DraftStats; log: DraftLogRow[] }) {
  const cards = [
    { label: "Started", value: stats["draft.created"] },
    { label: "Published", value: stats["draft.published"] },
    { label: "Removed by couple", value: stats["draft.deleted_user"] },
    { label: "Removed after 14 days", value: stats["draft.expired"] },
  ];
  return (
    <section aria-labelledby="drafts-title" className="rounded-2xl border bg-card p-5">
      <h2 id="drafts-title" className="font-serif text-2xl">Drafts</h2>
      <p className="text-sm text-muted-foreground">
        Every draft is counted here for good — when one is started, published, removed by the couple, or cleared by us after 14 days
        unpublished. The counts stay even once the draft itself is gone.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col gap-1.5 rounded-xl border bg-background p-4">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <span className="font-serif text-3xl leading-none">{fmtCount(c.value)}</span>
          </div>
        ))}
      </div>
      {log.length ? (
        <ol className="mt-4 grid gap-2">
          {log.map((r, i) => (
            <li key={`${r.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t pt-2 text-sm">
              <span>
                <b className="font-medium">{r.names ?? r.slug ?? "A couple"}</b>{" "}
                <span className={r.action === "draft.expired" ? "text-muted-foreground" : ""}>{DRAFT_WHAT[r.action]}</span>
                {r.actor ? <span className="text-muted-foreground"> · {r.actor}</span> : null}
              </span>
              <time className="text-xs text-muted-foreground" dateTime={r.at}>{fmtDayTime(r.at)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No drafts yet.</p>
      )}
    </section>
  );
}

export default async function AdminActivity() {
  const [, rows, draftStats, draftLog] = await Promise.all([
    requireStaff(["owner", "admin"]),
    loadActivity(300),
    loadDraftStats(),
    loadDraftLog(50),
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Activity</h1>
        <p className="mt-1 text-muted-foreground">Every change made in admin, who made it and when. Entries can&apos;t be edited or deleted.</p>
      </div>

      <Drafts stats={draftStats} log={draftLog} />

      <h2 className="font-serif text-2xl">Staff activity</h2>
      {rows.length ? (
        <ol className="grid gap-2">
          {rows.map((r, i) => (
            <li key={`${r.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
              <span>
                <b className="font-medium">{r.actor ?? (r.action.startsWith("job.") ? "Vellum" : "Someone removed")}</b> {WHAT[r.action] ?? r.action}
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
