import type { Metadata } from "next";
import Link from "next/link";
import { publicEnv } from "@/config/env";
import { WeddingsTable } from "@/features/admin/components/weddings-table";
import { fmtCount } from "@/features/admin/format";
import { loadWeddings, requireStaff } from "@/features/admin/queries";
import { WEDDING_FILTERS, type WeddingFilter } from "@/features/admin/types";
import { cn } from "@/lib/utils";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";

export const metadata: Metadata = { title: "Invitations" };

const LABEL: Record<WeddingFilter, string> = {
  all: "All",
  live: "Live",
  expiring: "Ending soon",
  expired: "Ended",
  deactivated: "Turned off",
  paid: "Paid",
  unpaid: "Not paid",
  draft: "Drafts",
};
const PAGE = 25;

export default async function AdminInvitations(props: PageProps<"/admin/invitations">) {
  const sp = await props.searchParams;
  const filter = WEDDING_FILTERS.find((f) => f === sp.filter) ?? "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const page = Math.max(0, Math.min(10_000, Number.parseInt(typeof sp.page === "string" ? sp.page : "0", 10) || 0));
  const [me, { total, rows }] = await Promise.all([requireStaff(), loadWeddings(filter, q, page, PAGE)]);
  const designNames = Object.fromEntries(TEMPLATE_MANIFESTS.map((t) => [t.id, t.name]));
  const href = (p: Record<string, string | number>) => {
    const u = new URLSearchParams({ filter, ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    if (u.get("filter") === "all") u.delete("filter");
    if (u.get("page") === "0") u.delete("page");
    return `/admin/invitations${u.size ? `?${u}` : ""}`;
  };
  const pages = Math.ceil(total / PAGE);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Invitations</h1>
        <p className="mt-1 text-muted-foreground">Every invitation, its state and how long it stays live. Open any one to check it.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
          {WEDDING_FILTERS.map((f) => (
            <Link key={f} href={href({ filter: f, page: 0 })} aria-current={f === filter ? "true" : undefined} className={cn("rounded-full border px-3.5 py-1.5 text-sm", f === filter ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-muted-foreground")}>
              {LABEL[f]}
            </Link>
          ))}
        </div>
        <form action="/admin/invitations" className="flex gap-2" role="search">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <label className="sr-only" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} maxLength={80} placeholder={me.role === "marketing" ? "Names or address" : "Names, address or email"} className="h-10 w-64 rounded-full border bg-card px-4 text-sm outline-none focus:border-primary" />
        </form>
      </div>
      <p className="text-sm text-muted-foreground">{fmtCount(total)} invitation{total === 1 ? "" : "s"}</p>
      <WeddingsTable rows={rows} role={me.role} siteUrl={publicEnv.siteUrl} designNames={designNames} />
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
