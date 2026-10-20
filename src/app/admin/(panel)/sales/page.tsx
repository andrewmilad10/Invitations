import type { Metadata } from "next";
import Link from "next/link";
import { SalesTable } from "@/features/admin/components/sales-table";
import { fmtCount, fmtMoney } from "@/features/admin/format";
import { loadSales, requireStaff, SALES_PAGE } from "@/features/admin/queries";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";

export const metadata: Metadata = { title: "Sales" };

export default async function AdminSales(props: PageProps<"/admin/sales">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const page = Math.max(0, Math.min(10_000, Number.parseInt(typeof sp.page === "string" ? sp.page : "0", 10) || 0));
  const [, { total, paid, revenue, rows }] = await Promise.all([requireStaff(["owner", "admin"]), loadSales(q, page)]);
  const designNames = Object.fromEntries(TEMPLATE_MANIFESTS.map((t) => [t.id, t.name]));
  const pages = Math.ceil(total / SALES_PAGE);
  const href = (p: number) => {
    const u = new URLSearchParams({ ...(q ? { q } : {}), ...(p ? { page: String(p) } : {}) });
    return `/admin/sales${u.size ? `?${u}` : ""}`;
  };
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light sm:text-5xl">Sales</h1>
          <p className="mt-1 text-muted-foreground">Every invitation sold: who bought it, how they paid and who recorded it.</p>
        </div>
        <form action="/admin/sales" role="search" className="w-full sm:w-auto">
          <label className="sr-only" htmlFor="q">Search sales</label>
          <input id="q" name="q" type="search" defaultValue={q} maxLength={80} placeholder="Names, email or reference" className="h-11 w-full rounded-full border bg-card px-4 text-base outline-none focus:border-primary sm:h-10 sm:w-64 sm:text-sm" />
        </form>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Sales{q ? " matching" : ""}</div><div className="mt-1 font-serif text-3xl">{fmtCount(paid)}</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Revenue{q ? " matching" : ""}</div><div className="mt-1 font-serif text-3xl">{fmtMoney(revenue)}</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Average sale</div><div className="mt-1 font-serif text-3xl">{fmtMoney(paid ? revenue / paid : null)}</div></div>
      </div>
      <SalesTable rows={rows} designNames={designNames} exportHref={`/admin/sales/export${q ? `?q=${encodeURIComponent(q)}` : ""}`} />
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3 text-sm">
          {page > 0 ? <Link className="rounded-full border px-4 py-2 hover:border-muted-foreground" href={href(page - 1)}>Previous</Link> : null}
          <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
          {page + 1 < pages ? <Link className="rounded-full border px-4 py-2 hover:border-muted-foreground" href={href(page + 1)}>Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
