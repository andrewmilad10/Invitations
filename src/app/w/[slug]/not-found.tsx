import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function InvitationNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Invitation</p>
        <h1 className="mt-4 font-serif text-5xl">This invitation isn&apos;t available</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The link may be mistyped, or the couple hasn&apos;t published their invitation yet.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm underline underline-offset-4">
          {siteConfig.name}
        </Link>
      </div>
    </main>
  );
}
