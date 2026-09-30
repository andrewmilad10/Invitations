import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Brand />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Digital wedding invitations</p>
        <h1 className="font-serif text-5xl leading-[1.05] sm:text-7xl">{siteConfig.tagline}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{siteConfig.description}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Create your invitation</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
