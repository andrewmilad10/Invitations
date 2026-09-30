"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/invitations", label: "Invitation cards" },
  { href: "/websites", label: "Wedding websites" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
];

/**
 * Public site header. Over a photo hero (`overlay`) it starts transparent
 * with light text and becomes solid once the page scrolls.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const light = overlay && !scrolled && !open;

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={cn(
        "z-50 transition-[background-color,color,border-color] duration-500 ease-out",
        overlay && "open-nav",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        light ? "bg-transparent text-white" : "border-b border-border/70 bg-background/92 text-foreground backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
        <Link href="/" className="font-serif text-[1.75rem] leading-none tracking-wide">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-[0.9rem] lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn("transition-opacity hover:opacity-100", light ? "opacity-85" : "opacity-75")}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className={cn("px-3 text-[0.9rem]", light ? "opacity-90 hover:opacity-100" : "opacity-75 hover:opacity-100")}>
            Log in
          </Link>
          <Button asChild className={cn("h-10 rounded-full px-5", light && "bg-white text-foreground hover:bg-white/90")}>
            <Link href="/invitations">Create invitation</Link>
          </Button>
        </div>

        <button type="button" className="-me-2 p-2 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col bg-background px-5 pb-8 pt-4 sm:top-20 lg:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-3xl">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/invitations" onClick={() => setOpen(false)}>
                Create invitation
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
