import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { DayBars } from "@/features/admin/components/day-bars";
import { fmtCount, fmtDayTime, fmtMoney } from "@/features/admin/format";
import { publicEnv } from "@/config/env";
import { Reminders } from "@/features/admin/components/reminders";
import { loadAlerts, loadOverview, loadReminders, requireStaff } from "@/features/admin/queries";
import { canSeeMoney } from "@/features/admin/types";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = { title: "Overview" };
const PERIODS = [7, 30, 90, 365] as const;

function Stat({ label, value, note, href, tone }: { label: string; value: string; note?: string; href?: string; tone?: "warn" }) {
  const body = (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-serif text-3xl leading-none", tone === "warn" && "text-accent")}>{value}</span>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
    </>
  );
  const cls = "flex flex-col gap-2 rounded-2xl border bg-card p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-muted-foreground")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function AdminOverview(props: PageProps<"/admin">) {
  const { days: raw } = await props.searchParams;
  const days = PERIODS.find((p) => String(p) === raw) ?? 30;
  const [me, o, alerts, reminders] = await Promise.all([requireStaff(), loadOverview(days), loadAlerts(7), loadReminders()]);
  const t = o.totals;
  const money = canSeeMoney(me.role);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
  const funnel = [
    { label: "Accounts", value: t.accounts },
    { label: "Started an invitation", value: t.weddings },
    { label: "Published", value: t.published },
    { label: "Paid", value: t.paidWeddings },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light sm:text-5xl">Overview</h1>
          <p className="mt-1 text-muted-foreground">How the business is doing, updated live.</p>
        </div>
        <div role="group" aria-label="Period" className="flex rounded-full border bg-card p-1">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin?days=${p}`}
              aria-current={p === days ? "true" : undefined}
              className={cn("rounded-full px-3.5 py-1.5 text-sm", p === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {p === 365 ? "1 year" : `${p} days`}
            </Link>
          ))}
        </div>
      </div>

      <section aria-label="This period" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {money ? <Stat label={`Revenue, last ${days} days`} value={fmtMoney(t.revenuePeriod)} note={`${fmtMoney(t.revenue)} all time`} href="/admin/sales" /> : null}
        <Stat label={`Invitations sold, last ${days} days`} value={fmtCount(t.salesPeriod)} note={`${fmtCount(t.sales)} all time`} href={money ? "/admin/sales" : undefined} />
        {t.pendingOrders || money ? (
          <Stat
            label="Waiting for payment"
            value={fmtCount(t.pendingOrders)}
            note={money && t.pendingAmount ? `${fmtMoney(t.pendingAmount)} to confirm` : "Orders placed, not paid yet"}
            href={money ? "/admin/orders?tab=pending" : undefined}
            tone={t.pendingOrders ? "warn" : undefined}
          />
        ) : null}
        <Stat label="Live now" value={fmtCount(t.live)} note={`${fmtCount(t.published)} published in total`} href="/admin/invitations?filter=live" />
        <Stat label="Ending in the next 14 days" value={fmtCount(t.expiringSoon)} note="Good moment to offer an extension" href="/admin/invitations?filter=expiring" tone={t.expiringSoon ? "warn" : undefined} />
        <Stat label={`New accounts, last ${days} days`} value={fmtCount(t.accountsNew)} note={`${fmtCount(t.accounts)} in total`} />
        <Stat label={`Invitations started, last ${days} days`} value={fmtCount(t.weddingsNew)} note={`${fmtCount(t.weddings)} in total`} href="/admin/invitations" />
        <Stat label="Ended or turned off" value={fmtCount(t.expired + t.deactivated)} note={`${fmtCount(t.expired)} ended · ${fmtCount(t.deactivated)} turned off`} href="/admin/invitations?filter=expired" />
        <Stat label="Guests and replies" value={fmtCount(t.replies)} note={`replies from ${fmtCount(t.guests)} listed guests and general links`} />
      </section>

      <section aria-label="By day" className="grid gap-4 xl:grid-cols-2">
        {money ? <DayBars title="Revenue per day" data={o.daily.map((d) => ({ day: d.day, value: d.revenue ?? 0 }))} format={fmtMoney} /> : null}
        <DayBars title="Invitations sold per day" data={o.daily.map((d) => ({ day: d.day, value: d.sales }))} format={fmtCount} />
        <DayBars title="New accounts per day" data={o.daily.map((d) => ({ day: d.day, value: d.accounts }))} format={fmtCount} />
        <DayBars title="Invitations started per day" data={o.daily.map((d) => ({ day: d.day, value: d.weddings }))} format={fmtCount} />
      </section>

      {money ? (
        <section aria-labelledby="reminders-title" className="rounded-2xl border bg-card p-5">
          <h2 id="reminders-title" className="font-serif text-2xl">
            Renewal reminders{reminders.length ? ` (${reminders.length})` : ""}
          </h2>
          <p className="text-sm text-muted-foreground">Added every night for invitations ending within 14 days. Message the couple, then mark it sent.</p>
          <Reminders rows={reminders} siteUrl={publicEnv.siteUrl} />
        </section>
      ) : null}

      {money ? (
        <section aria-labelledby="alerts-title" className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="alerts-title" className="flex items-center gap-2 font-serif text-2xl">
              <ShieldAlert className="size-5 text-accent" aria-hidden /> Security and money alerts
            </h2>
            <Link href="/admin/activity" className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
              Full activity log
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Last 7 days: team changes, refunds, invitations turned off and payments marked despite a warning.</p>
          {alerts.length ? (
            <ul className="mt-4 grid gap-2">
              {alerts.slice(0, 8).map((a, i) => (
                <li key={`${a.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t pt-2 text-sm">
                  <span>
                    {a.targetType === "order" && a.targetId ? (
                      <Link href={`/admin/orders/${a.targetId}`} className="hover:underline">
                        {a.text}
                      </Link>
                    ) : (
                      a.text
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fmtDayTime(a.at)} · {a.actor ?? "someone"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nothing to review.</p>
          )}
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-serif text-2xl">From visitor to customer</h2>
          <p className="text-sm text-muted-foreground">All time. Each step as a share of the one before.</p>
          <ol className="mt-5 grid gap-3">
            {funnel.map((f, i) => (
              <li key={f.label} className="grid gap-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="tabular-nums">
                    {fmtCount(f.value)} <span className="text-muted-foreground">{i ? pct(f.value, funnel[i - 1].value) : ""}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: funnel[0].value ? `${Math.max(2, (f.value / funnel[0].value) * 100)}%` : "0%" }} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-serif text-2xl">Most chosen designs</h2>
          <p className="text-sm text-muted-foreground">All time, by invitations started.</p>
          {o.designs.length ? (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Design</th>
                  <th className="py-2 text-right font-medium">Started</th>
                  <th className="py-2 text-right font-medium">Published</th>
                  <th className="py-2 text-right font-medium">Sold</th>
                </tr>
              </thead>
              <tbody>
                {o.designs.map((d) => (
                  <tr key={d.template_id} className="border-t">
                    <td className="py-2">
                      <Link href={`/websites/${d.template_id}`} className="hover:underline" target="_blank">
                        {resolveTemplateManifest(d.template_id).name}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmtCount(d.weddings)}</td>
                    <td className="py-2 text-right tabular-nums">{fmtCount(d.published)}</td>
                    <td className="py-2 text-right tabular-nums">{fmtCount(d.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">No invitations yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
