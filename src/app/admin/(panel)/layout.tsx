import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireStaff } from "@/features/admin/queries";
import { SiteHeader } from "@/features/marketing/site-header";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
// Always read fresh from the database with the visitor's own session.
export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", marketing: "Marketing" } as const;

/** Only staff ever see this; everyone else gets a 404 (see requireStaff). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader className="print:hidden" account={{ name: me.name || me.email?.split("@")[0] || "Staff", email: me.email, staff: true }} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_1fr] lg:py-10">
        <aside className="grid gap-3 lg:sticky lg:top-24 lg:self-start print:hidden">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border bg-card px-2.5 py-1 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-accent" aria-hidden /> Admin · {ROLE_LABEL[me.role]}
          </span>
          <AdminNav role={me.role} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
