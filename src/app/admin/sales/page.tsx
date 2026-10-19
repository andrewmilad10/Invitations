import type { Metadata } from "next";
import { SalesTable } from "@/features/admin/components/sales-table";
import { fmtCount, fmtMoney } from "@/features/admin/format";
import { loadSales, requireStaff } from "@/features/admin/queries";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";

export const metadata: Metadata = { title: "Sales" };

export default async function AdminSales(props: PageProps<"/admin/sales">) {
  await requireStaff(["owner", "admin"]);
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const { total, rows } = await loadSales(q, 0, 500);
  const paid = rows.filter((r) => r.status === "paid");
  const designNames = Object.fromEntries(TEMPLATE_MANIFESTS.map((t) => [t.id, t.name]));
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light sm:text-5xl">Sales</h1>
          <p className="mt-1 text-muted-foreground">Every invitation sold: who bought it, how they paid and who recorded it.</p>
        </div>
        <form action="/admin/sales" role="search">
          <label className="sr-only" htmlFor="q">Search sales</label>
          <input id="q" name="q" defaultValue={q} maxLength={80} placeholder="Names, email or reference" className="h-10 w-64 rounded-full border bg-card px-4 text-sm outline-none focus:border-primary" />
        </form>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Sales{q ? " matching" : ""}</div><div className="mt-1 font-serif text-3xl">{fmtCount(paid.length)}</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Revenue{q ? " matching" : ""}</div><div className="mt-1 font-serif text-3xl">{fmtMoney(paid.reduce((s, r) => s + r.amount, 0))}</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">Average sale</div><div className="mt-1 font-serif text-3xl">{fmtMoney(paid.length ? paid.reduce((s, r) => s + r.amount, 0) / paid.length : null)}</div></div>
      </div>
      {total > rows.length ? <p className="text-sm text-muted-foreground">Showing the latest {rows.length} of {fmtCount(total)}.</p> : null}
      <SalesTable rows={rows} designNames={designNames} />
    </div>
  );
}
