import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireStaff } from "@/features/admin/queries";
import { signOut } from "@/features/auth/actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
// Always read fresh from the database with the visitor's own session.
export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", marketing: "Marketing" } as const;

/** Only staff ever see this; everyone else gets a 404 (see requireStaff). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Brand />
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden /> Admin · {ROLE_LABEL[me.role]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-56 truncate text-sm text-muted-foreground md:inline">{me.email}</span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">My invitations</Link>
            </Button>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_1fr] lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminNav role={me.role} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
