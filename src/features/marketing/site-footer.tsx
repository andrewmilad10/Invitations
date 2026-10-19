import Link from "next/link";
import { siteConfig } from "@/config/site";

const COLS: [string, [string, string][]][] = [
  ["Designs", [["/websites", "Wedding websites"], ["/invitations", "Invitation cards"], ["/websites?sort=new", "New designs"]]],
  ["For couples", [["/guests", "Guests & replies"], ["/#pricing", "Price"], ["/dashboard", "My invitations"]]],
  ["Help", [["/#how-it-works", "How it works"], ["/#faq", "Questions"], ["/login", "Log in"]]],
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-serif text-3xl">
            {siteConfig.name}
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">Wedding websites and invitation cards that open like real stationery, in English and Arabic.</p>
        </div>
        {COLS.map(([title, links]) => (
          <nav key={title} aria-label={title} className="grid content-start gap-2.5 text-sm">
            <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em]">{title}</p>
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} {siteConfig.name}. Designs and wording are our own.
        </p>
      </div>
    </footer>
  );
}
