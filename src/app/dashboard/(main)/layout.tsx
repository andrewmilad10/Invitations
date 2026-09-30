import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/session";

/** Chrome for the dashboard list and wizard (the editor is full-screen). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email;

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
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
