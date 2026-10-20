import { ArrowRight, Clock3, Inbox } from "lucide-react";
import Link from "next/link";
import { fmtCount, fmtMoney } from "../format";
import { canSeeMoney, type StaffRole, type Today } from "../types";

const TZ = "Africa/Cairo";

/** "Good morning / afternoon / evening" by the current Cairo hour. */
function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * The top-of-Overview "today at a glance": a greeting, today's headline
 * figures, an hour-by-hour sparkline and quick links to what needs doing.
 * Styled in Vellum's own palette (cream and forest), not a dark dashboard.
 */
export function ActivityHeader({ today, name, role }: { today: Today; name: string | null; role: StaffRole }) {
  const money = canSeeMoney(role);
  const first = (name ?? "").trim().split(/\s+/)[0];
  const dateLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date());

  // The headline number: revenue today for owner/admin, new accounts for marketing.
  const headline = money
    ? { label: "Sales today", value: fmtMoney(today.revenueToday), sub: `${fmtCount(today.salesToday)} ${today.salesToday === 1 ? "invitation" : "invitations"} sold` }
    : { label: "New accounts today", value: fmtCount(today.accountsToday), sub: `${fmtCount(today.weddingsToday)} invitations started` };

  const tiles = [
    { label: "Live now", value: fmtCount(today.live), href: "/admin/invitations?filter=live" },
    money
      ? { label: "New orders today", value: fmtCount(today.ordersToday), href: "/admin/orders" }
      : { label: "Invitations started", value: fmtCount(today.weddingsToday), href: "/admin/invitations" },
    { label: "Replies today", value: fmtCount(today.repliesToday) as string, href: undefined as string | undefined },
  ];

  return (
    <section aria-label="Today" className="overflow-hidden rounded-3xl border bg-card">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_minmax(0,22rem)]">
        {/* Left: greeting + headline + tiles */}
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
          <h1 className="mt-1 font-serif text-3xl font-light sm:text-4xl">
            {greeting(today.nowHour)}
            {first ? <>, {first}</> : null}
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{headline.label}</p>
              <p className="font-serif text-4xl leading-none sm:text-5xl">{headline.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{headline.sub}</p>
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-3">
              {tiles.map((tile) =>
                tile.href ? (
                  <Link key={tile.label} href={tile.href} className="group">
                    <dt className="text-xs text-muted-foreground group-hover:text-foreground">{tile.label}</dt>
                    <dd className="font-serif text-2xl leading-tight">{tile.value}</dd>
                  </Link>
                ) : (
                  <div key={tile.label}>
                    <dt className="text-xs text-muted-foreground">{tile.label}</dt>
                    <dd className="font-serif text-2xl leading-tight">{tile.value}</dd>
                  </div>
                ),
              )}
            </dl>
          </div>

          {/* Quick actions: what needs attention, like a shop's home screen. */}
          <div className="mt-6 flex flex-wrap gap-2">
            {money && today.pendingOrders ? (
              <Link
                href="/admin/orders?tab=pending"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Inbox className="size-4" aria-hidden />
                Confirm {fmtCount(today.pendingOrders)} {today.pendingOrders === 1 ? "payment" : "payments"}
                {today.pendingAmount ? <span className="opacity-80">· {fmtMoney(today.pendingAmount)}</span> : null}
              </Link>
            ) : null}
            {today.expiringSoon ? (
              <Link
                href="/admin/invitations?filter=expiring"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-muted-foreground"
              >
                <Clock3 className="size-4 text-accent" aria-hidden />
                {fmtCount(today.expiringSoon)} ending soon
              </Link>
            ) : null}
            <a href="#report" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors hover:border-muted-foreground">
              Full report <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>

        {/* Right: today's sparkline */}
        <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{money ? "Sales through the day" : "New orders through the day"}</span>
          </div>
          <HourSparkline hours={today.hours} nowHour={today.nowHour} money={money} />
        </div>
      </div>
    </section>
  );
}

/** A clean line of today's activity by hour, with the current hour marked. */
function HourSparkline({ hours, nowHour, money }: { hours: Today["hours"]; nowHour: number; money: boolean }) {
  const value = (h: Today["hours"][number]) => (money ? (h.revenue ?? 0) : h.orders);
  const upto = hours.filter((h) => h.hour <= nowHour);
  const max = Math.max(1, ...upto.map(value));
  const W = 320;
  const H = 96;
  const pad = 6;
  const x = (hour: number) => pad + (hour / 23) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const pts = upto.map((h) => `${x(h.hour).toFixed(1)},${y(value(h)).toFixed(1)}`);
  const line = pts.join(" ");
  const area = pts.length ? `${x(0)},${H - pad} ${line} ${x(upto.at(-1)!.hour)},${H - pad}` : "";
  const last = upto.at(-1);
  const totalToday = upto.reduce((s, h) => s + value(h), 0);

  return (
    <figure className="mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label={`Today by hour: ${money ? fmtMoney(totalToday) : fmtCount(totalToday)} so far`}>
        {totalToday > 0 && last ? (
          <>
            <polygon points={area} className="fill-primary/10" />
            <polyline points={line} fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x(last.hour)} cy={y(value(last))} r="3.5" className="fill-primary" />
          </>
        ) : (
          <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} className="stroke-border" strokeWidth="1.5" strokeDasharray="2 4" />
        )}
      </svg>
      <figcaption className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>Now</span>
      </figcaption>
      <p className="mt-2 text-sm">
        <span className="font-serif text-xl">{money ? fmtMoney(totalToday) : fmtCount(totalToday)}</span> <span className="text-muted-foreground">so far today</span>
      </p>
    </figure>
  );
}
