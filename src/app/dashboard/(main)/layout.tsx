import { getStaff } from "@/features/admin/queries";
import { requireUser } from "@/features/auth/session";
import { SiteHeader } from "@/features/marketing/site-header";

/**
 * Signed-in pages share the public site's header, so the site feels the same
 * before and after logging in (the editor is full-screen and has its own).
 * The account is read here on the server, so the name shows at once.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, staff] = await Promise.all([requireUser("/dashboard"), getStaff()]);
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const account = { name: fullName || user.email?.split("@")[0] || "Account", email: user.email ?? null, staff: Boolean(staff) };

  return (
    <div className="min-h-dvh">
      <SiteHeader account={account} />
      {children}
    </div>
  );
}
