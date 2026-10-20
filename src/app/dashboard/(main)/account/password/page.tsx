import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewPasswordForm } from "@/features/auth/components/auth-forms";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Change password" };

/** Also where "Forgot your password?" links land, already signed in by the link. */
export default async function PasswordPage() {
  await requireUser("/dashboard/account/password");
  return (
    <main className="mx-auto grid max-w-xl gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/dashboard/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Account
      </Link>
      <h1 className="font-serif text-5xl font-light">Choose a new password</h1>
      <div className="rounded-2xl border bg-card p-6">
        <NewPasswordForm />
      </div>
    </main>
  );
}
