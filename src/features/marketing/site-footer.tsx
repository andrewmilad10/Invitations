import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">Wedding invitations and websites, designed like fine stationery.</p>
        </div>
        <nav aria-label="Product" className="grid content-start gap-2.5 text-sm">
          <p className="mb-1 font-medium">Product</p>
          <Link href="/templates" className="text-muted-foreground hover:text-foreground">Templates</Link>
          <Link href="/#features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">How it works</Link>
        </nav>
        <nav aria-label="Account" className="grid content-start gap-2.5 text-sm">
          <p className="mb-1 font-medium">Your invitation</p>
          <Link href="/templates" className="text-muted-foreground hover:text-foreground">Start creating</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Log in</Link>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">My weddings</Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} {siteConfig.name}. Photography via Unsplash.
        </p>
      </div>
    </footer>
  );
}
