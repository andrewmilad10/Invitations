import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TwoStep } from "@/features/admin/components/two-step";
import { getStaff } from "@/features/admin/queries";
import { SiteHeader } from "@/features/marketing/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Two-step login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Staff enter their authenticator code here before Admin opens (set it up the first time). */
export default async function AdminVerify() {
  const supabase = await createClient();
  const [me, factors] = await Promise.all([getStaff(), supabase.auth.mfa.listFactors()]);
  if (!me) notFound();
  if (me.verified) redirect("/admin");
  const factor = factors.data?.totp.find((f) => f.status === "verified") ?? null;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader account={{ name: me.name || me.email?.split("@")[0] || "Staff", email: me.email, staff: true }} />
      <main className="mx-auto grid max-w-xl gap-6 px-4 py-14 sm:px-6">
        <h1 className="font-serif text-4xl font-light sm:text-5xl">{factor ? "Enter your code" : "Protect Admin"}</h1>
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <TwoStep factorId={factor?.id ?? null} />
        </div>
        <p className="text-sm text-muted-foreground">
          Lost your phone? The owner can remove the old authenticator in Supabase (Authentication → Users → your account → Multi-factor), then you can set it up again.
        </p>
      </main>
    </div>
  );
}
