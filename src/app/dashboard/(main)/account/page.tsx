import type { Metadata } from "next";
import { Download, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteAccount } from "@/features/account/delete-account";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Account" };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" });

/** Account: details, password, a copy of your data, and deleting the account. */
export default async function AccountPage() {
  const user = await requireUser("/dashboard/account");
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-5xl font-light">Account</h1>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif text-2xl">Your details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{name ?? "—"}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-muted-foreground">Member since</dt>
          <dd>{day(user.created_at)}</dd>
        </dl>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif text-2xl">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use a password you don&apos;t use anywhere else.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/account/password">
            <KeyRound /> Change password
          </Link>
        </Button>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif text-2xl">Your data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A copy of everything you&apos;ve given us: your invitations, guest lists, replies, wishes and orders, in one file.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <a href="/dashboard/account/export" download>
            <Download /> Download my data
          </a>
        </Button>
      </section>

      <section className="rounded-2xl border border-destructive/40 bg-card p-6">
        <h2 className="font-serif text-2xl">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This deletes your account, your invitations (their links stop working), photos, guest lists, replies and wishes. It can&apos;t be undone. Download your
          data first if you want a copy. Receipts for past payments are kept for our accounts, without your name or phone number.
        </p>
        <div className="mt-5">{user.email ? <DeleteAccount email={user.email} /> : null}</div>
      </section>
    </main>
  );
}
