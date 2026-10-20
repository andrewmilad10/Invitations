"use client";

import { ChevronDown, LayoutGrid, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

/** Who is signed in, as the header shows it. */
export type HeaderAccount = { name: string; email: string | null; staff: boolean };

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

type SessionUser = { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined;
const toAccount = (u: SessionUser, staff = false): HeaderAccount | null =>
  u ? { name: (typeof u.user_metadata?.full_name === "string" && u.user_metadata.full_name.trim()) || u.email?.split("@")[0] || "Account", email: u.email ?? null, staff } : null;

/**
 * Who is signed in. Signed-in pages pass it from the server (no flicker);
 * the public pages stay static and fast, so there it's read in the browser
 * after the page shows: the Supabase client loads only then and reads the
 * session already in this browser's cookies. Staff (for the Admin link) is
 * asked of the database once, only for signed-in visitors.
 */
function useAccount(initial: HeaderAccount | null | undefined) {
  const [account, setAccount] = useState<HeaderAccount | null>(initial ?? null);
  useEffect(() => {
    if (initial !== undefined || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let alive = true;
    let stop: (() => void) | undefined;
    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (!alive) return;
      const supabase = createClient();
      const load = async (user: SessionUser) => {
        if (!user) return alive && setAccount(null);
        setAccount((a) => toAccount(user, a?.staff ?? false));
        const { data } = await supabase.rpc("admin_me");
        if (alive) setAccount(toAccount(user, Boolean(data)));
      };
      void supabase.auth.getSession().then(({ data }) => alive && load(data.session?.user));
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (alive && (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED")) void load(session?.user);
      });
      stop = () => data.subscription.unsubscribe();
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, [initial]);
  return account;
}

/** The signed-in person: their initial and first name, opening a small menu. */
function AccountMenu({ account }: { account: HeaderAccount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const first = account.name.split(/\s+/)[0];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center gap-2 rounded-full py-1 ps-1 pe-3 text-[0.9rem] transition-colors hover:bg-muted", open && "bg-muted")}
      >
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-forest font-serif text-base text-forest-foreground">
          {first.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-32 truncate">{first}</span>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div
        id="account-menu"
        className={cn(
          "absolute end-0 top-[calc(100%+0.7rem)] w-64 rounded-2xl border border-border bg-card p-2 shadow-[0_24px_50px_-24px_rgb(34_29_26/0.35)] transition-[opacity,translate,visibility] duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0",
        )}
      >
        <div className="border-b border-border px-3 pb-2.5 pt-1.5">
          <p className="truncate font-medium">{account.name}</p>
          {account.email ? <p className="truncate text-xs text-muted-foreground">{account.email}</p> : null}
        </div>
        <div className="grid pt-1.5">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
            <LayoutGrid className="size-4 text-muted-foreground" aria-hidden /> My invitations
          </Link>
          <Link href="/dashboard/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
            <UserRound className="size-4 text-muted-foreground" aria-hidden /> Account
          </Link>
          {account.staff ? (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
              <ShieldCheck className="size-4 text-muted-foreground" aria-hidden /> Admin
            </Link>
          ) : null}
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
              <LogOut className="size-4 text-muted-foreground" aria-hidden /> Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/** The page a link points at is the one being shown (or a page inside it). */
function isCurrent(path: string, href: string) {
  const base = href.split(/[?#]/)[0];
  if (!base || base === "/") return false;
  return path === base || path.startsWith(`${base}/`);
}

/**
 * The one header for the whole site, signed in or not: a slim cream capsule
 * that floats over the page and stays at the top while scrolling. "Designs"
 * opens a small menu (hover on a computer, tap anywhere); signed in, the
 * person's name opens their account menu and "My invitations" joins the
 * tabs. The current page's tab is marked. On phones it folds into a menu.
 * `account`: pass it from server-rendered signed-in pages; leave it out on
 * static pages and it's read in the browser.
 */
export function SiteHeader({ account: initialAccount, className }: { account?: HeaderAccount | null; className?: string } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const account = useAccount(initialAccount);
  const path = usePathname() ?? "/";
  const designsCurrent = isCurrent(path, "/websites") || isCurrent(path, "/invitations");
  const tabs = account ? [{ href: "/dashboard", label: "My invitations" }, ...LINKS] : LINKS;
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
      <header style={{ viewTransitionName: "site-header" }} className={cn("pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5", className)}>
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
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  (menu || designsCurrent) && "bg-muted text-foreground",
                )}
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
            {tabs.map((l) => {
              const current = isCurrent(path, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground",
                    current ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto hidden items-center gap-1 lg:flex">
            {account ? null : (
              <Link href="/login" className="rounded-full px-3 py-2 text-[0.9rem] text-muted-foreground hover:text-foreground">
                Log in
              </Link>
            )}
            <Link href="/websites" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[0.9rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Create invitation
            </Link>
            {account ? <AccountMenu account={account} /> : null}
          </div>

          {account ? (
            // Phones: the initial shows you're signed in and opens My invitations.
            <Link
              href="/dashboard"
              aria-label={`My invitations (${account.name})`}
              className="ms-auto grid size-10 place-items-center rounded-full bg-forest font-serif text-lg text-forest-foreground lg:hidden"
            >
              {account.name.charAt(0).toUpperCase()}
            </Link>
          ) : null}
          <button
            type="button"
            className={cn("grid size-10 place-items-center rounded-full border border-border bg-card lg:hidden", !account && "ms-auto")}
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
          {account ? (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-forest font-serif text-xl text-forest-foreground">
                {account.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{account.name}</span>
                {account.email ? <span className="block truncate text-sm text-muted-foreground">{account.email}</span> : null}
              </span>
            </div>
          ) : null}
          <nav aria-label="Main" className="flex flex-col">
            {[
              ...(account
                ? [{ href: "/dashboard", label: "My invitations" }, { href: "/dashboard/account", label: "Account" }, ...(account.staff ? [{ href: "/admin", label: "Admin" }] : [])]
                : []),
              { href: "/websites", label: "Wedding websites" },
              { href: "/invitations", label: "Invitation cards" },
              ...LINKS,
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(path, l.href) ? "page" : undefined}
                className={cn("border-b border-border py-4 font-serif text-3xl", isCurrent(path, l.href) && "text-accent")}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 pt-8">
            <Link href="/websites" onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
              Create invitation
            </Link>
            {account ? (
              <form action={signOut}>
                <button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border">
                  Log out
                </button>
              </form>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full border border-border">
                Log in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
