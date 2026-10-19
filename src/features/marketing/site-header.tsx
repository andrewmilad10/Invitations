"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const DESIGNS = [
  { href: "/websites", title: "Wedding websites", note: "Designs that open like real stationery" },
  { href: "/invitations", title: "Invitation cards", note: "Printable cards with a QR to your site" },
  { href: "/websites?sort=new", title: "New designs", note: "The latest additions" },
  { href: "/websites?sort=loved", title: "Most loved", note: "What couples choose most" },
];
const STYLES = [
  { href: "/websites?mood=floral", label: "Floral & romantic" },
  { href: "/websites?mood=classic", label: "Classic & foil" },
  { href: "/websites?mood=nights", label: "Egyptian nights" },
];
const LINKS = [
  { href: "/guests", label: "Guests & replies" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "Help" },
];

/**
 * Whether a visitor is signed in, read in the browser after the page shows
 * (the marketing pages stay static and fast). The Supabase client loads only
 * then, and only reads the session already in this browser's cookies.
 */
function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let alive = true;
    let stop: (() => void) | undefined;
    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (!alive) return;
      const supabase = createClient();
      void supabase.auth.getSession().then(({ data }) => alive && setSignedIn(Boolean(data.session)));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => alive && setSignedIn(Boolean(session)));
      stop = () => data.subscription.unsubscribe();
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, []);
  return signedIn;
}

/**
 * Public site header: a slim cream capsule that floats over the page and
 * stays at the top while scrolling. "Designs" opens a small menu (hover on a
 * computer, tap anywhere). On phones it folds into a menu button.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const signedIn = useSignedIn();
  const account = signedIn ? { href: "/dashboard", label: "My weddings" } : { href: "/login", label: "Log in" };
  const closeT = useRef<number>(0);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header style={{ viewTransitionName: "site-header" }} className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={cn(
            "pointer-events-auto mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-full border border-border bg-card/85 ps-5 pe-2 backdrop-blur-md transition-shadow duration-300 sm:h-[3.7rem] sm:ps-6",
            scrolled ? "shadow-[0_18px_38px_-20px_rgb(34_29_26/0.5)]" : "shadow-[0_14px_34px_-22px_rgb(34_29_26/0.45)]",
          )}
        >
          <Link href="/" className="font-serif text-[1.6rem] leading-none tracking-wide">
            {siteConfig.name}
          </Link>

          <nav aria-label="Main" className="mx-auto hidden items-center gap-1 text-[0.9rem] lg:flex">
            <div
              ref={dropRef}
              className="relative"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                window.clearTimeout(closeT.current);
                setMenu(true);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                closeT.current = window.setTimeout(() => setMenu(false), 160);
              }}
            >
              <button
                type="button"
                aria-expanded={menu}
                aria-controls="designs-menu"
                onClick={() => setMenu((m) => !m)}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", menu && "bg-muted text-foreground")}
              >
                Designs <ChevronDown className={cn("size-3.5 transition-transform", menu && "rotate-180")} />
              </button>
              <div
                id="designs-menu"
                className={cn(
                  "absolute -start-4 top-[calc(100%+0.7rem)] grid w-[34rem] grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-3 shadow-[0_24px_50px_-24px_rgb(34_29_26/0.35)] transition-[opacity,translate,visibility] duration-200",
                  menu ? "visible translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0",
                )}
              >
                {DESIGNS.map((d) => (
                  <Link key={d.href} href={d.href} onClick={() => setMenu(false)} className="grid gap-0.5 rounded-xl px-3 py-2.5 hover:bg-muted">
                    <span className="font-medium">{d.title}</span>
                    <span className="text-xs text-muted-foreground">{d.note}</span>
                  </Link>
                ))}
                <div className="col-span-2 mt-1 flex flex-wrap gap-1.5 border-t border-border px-1 pt-3">
                  {STYLES.map((s) => (
                    <Link key={s.href} href={s.href} onClick={() => setMenu(false)} className="rounded-full border border-border px-3 py-1 text-xs hover:border-muted-foreground">
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ms-auto hidden items-center gap-1 lg:flex">
            <Link href={account.href} className="rounded-full px-3 py-2 text-[0.9rem] text-muted-foreground hover:text-foreground">
              {account.label}
            </Link>
            <Link href="/websites" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[0.9rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Create invitation
            </Link>
          </div>

          <button
            type="button"
            className="ms-auto grid size-10 place-items-center rounded-full border border-border bg-card lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>
      {open ? (
        <div
          id="mobile-menu"
          data-lenis-prevent
          className="mobile-menu fixed inset-x-0 bottom-0 top-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-background px-5 pb-8 pt-24 lg:hidden"
        >
          <nav aria-label="Main" className="flex flex-col">
            {[{ href: "/websites", label: "Wedding websites" }, { href: "/invitations", label: "Invitation cards" }, ...LINKS].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-3xl">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 pt-8">
            <Link href="/websites" onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
              Create invitation
            </Link>
            <Link href={account.href} onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full border border-border">
              {account.label}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
