import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/session";

/** Chrome for the dashboard list and quick-start wizard (the editor is full-screen). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email;

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Brand />
            <nav aria-label="Account" className="hidden gap-6 text-sm sm:flex">
              <Link href="/dashboard" className="text-foreground">
                My weddings
              </Link>
              <Link href="/invitations" className="text-muted-foreground hover:text-foreground">
                Templates
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:inline">{name}</span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
