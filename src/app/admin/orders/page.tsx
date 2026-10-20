import type { Metadata } from "next";
import Link from "next/link";
import { OrdersList } from "@/features/admin/components/orders-list";
import { fmtCount } from "@/features/admin/format";
import { loadOrders, ORDERS_PAGE, requireStaff } from "@/features/admin/queries";
import { ORDER_TAB_LABEL, ORDER_TABS, type OrderTab } from "@/features/admin/types";
import { cn } from "@/lib/utils";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrders(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const tab: OrderTab = ORDER_TABS.find((t) => t === sp.tab) ?? "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const page = Math.max(0, Math.min(10_000, Number.parseInt(typeof sp.page === "string" ? sp.page : "0", 10) || 0));
  const [, { total, counts, rows }] = await Promise.all([requireStaff(["owner", "admin"]), loadOrders(tab, q, page)]);
  const designNames = Object.fromEntries(TEMPLATE_MANIFESTS.map((t) => [t.id, t.name]));
  const pages = Math.ceil(total / ORDERS_PAGE);
  const href = (p: { tab?: OrderTab; page?: number }) => {
    const u = new URLSearchParams();
    const t = p.tab ?? tab;
    if (t !== "all") u.set("tab", t);
    if (q) u.set("q", q);
    if (p.page) u.set("page", String(p.page));
    return `/admin/orders${u.size ? `?${u}` : ""}`;
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light sm:text-5xl">Orders</h1>
          <p className="mt-1 text-muted-foreground">
            {counts.pending ? `${fmtCount(counts.pending)} waiting for payment. ` : ""}Couples order when they publish; mark each one paid when the money arrives.
          </p>
        </div>
        <form action="/admin/orders" role="search" className="w-full sm:w-auto">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <label className="sr-only" htmlFor="q">Search orders</label>
          <input id="q" name="q" type="search" defaultValue={q} maxLength={80} placeholder="#1001, name, phone, email" className="h-11 w-full rounded-full border bg-card px-4 text-base outline-none focus:border-primary sm:w-72 sm:text-sm" />
        </form>
      </div>

      <nav aria-label="Order filters" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {ORDER_TABS.map((t) => (
          <Link
            key={t}
            href={href({ tab: t })}
            aria-current={t === tab ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm",
              t === tab ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-muted-foreground",
            )}
          >
            {ORDER_TAB_LABEL[t]}
            {counts[t] ? <span className={cn("tabular-nums", t === tab ? "opacity-80" : "text-muted-foreground")}>{fmtCount(counts[t])}</span> : null}
          </Link>
        ))}
      </nav>

      {q ? <p className="text-sm text-muted-foreground">{fmtCount(total)} matching &ldquo;{q}&rdquo;</p> : null}
      <OrdersList rows={rows} designNames={designNames} />

      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3 text-sm">
          {page > 0 ? <Link className="rounded-full border px-4 py-2 hover:border-muted-foreground" href={href({ page: page - 1 })}>Previous</Link> : null}
          <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
          {page + 1 < pages ? <Link className="rounded-full border px-4 py-2 hover:border-muted-foreground" href={href({ page: page + 1 })}>Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
