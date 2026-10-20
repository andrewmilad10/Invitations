"use client";

import { Activity, Inbox, LayoutDashboard, type LucideIcon, MoreHorizontal, ReceiptText, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { StaffRole } from "../types";

const PRIMARY = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, roles: ["owner", "admin", "marketing"] },
  { href: "/admin/orders", label: "Orders", icon: Inbox, roles: ["owner", "admin"] },
  { href: "/admin/invitations", label: "Invites", icon: Sparkles, roles: ["owner", "admin", "marketing"] },
  { href: "/admin/sales", label: "Sales", icon: ReceiptText, roles: ["owner", "admin"] },
] as const;
const MORE = [
  { href: "/admin/team", label: "Team", icon: Users, roles: ["owner", "admin"] },
  { href: "/admin/activity", label: "Activity", icon: Activity, roles: ["owner", "admin"] },
] as const;

const forRole = <T extends { roles: readonly string[] }>(items: readonly T[], role: StaffRole) => items.filter((i) => i.roles.includes(role));
const isOn = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

function Tab({ label, Icon, active, href, onClick, expanded }: { label: string; Icon: LucideIcon; active: boolean; href?: string; onClick?: () => void; expanded?: boolean }) {
  const inner = (
    <span className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-foreground" : "text-muted-foreground")}>
      <Icon className={cn("size-[1.35rem]", active && "text-accent")} aria-hidden />
      {label}
    </span>
  );
  return href ? (
    <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className="flex flex-1 active:bg-muted">
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-expanded={expanded} className="flex flex-1 active:bg-muted">
      {inner}
    </button>
  );
}

/**
 * App-style bottom navigation for Admin on phones (hidden on desktop, which
 * keeps the sidebar). Big tap targets; a "More" sheet holds Team and Activity.
 */
export function AdminBottomNav({ role }: { role: StaffRole }) {
  const path = usePathname() ?? "/admin";
  const [more, setMore] = useState(false);
  const primary = forRole(PRIMARY, role);
  const extra = forRole(MORE, role);
  const moreActive = extra.some((i) => isOn(path, i.href));

  useEffect(() => {
    if (!more) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [more]);

  return (
    <>
      {more ? (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMore(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-serif text-xl">More</span>
              <button type="button" onClick={() => setMore(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-1">
              {extra.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMore(false)}
                  className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-base", isOn(path, href) ? "bg-muted font-medium" : "hover:bg-muted")}
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
      >
        {primary.map(({ href, label, icon }) => (
          <Tab key={href} href={href} label={label} Icon={icon} active={isOn(path, href)} onClick={() => setMore(false)} />
        ))}
        {extra.length ? <Tab label="More" Icon={MoreHorizontal} active={moreActive} expanded={more} onClick={() => setMore((m) => !m)} /> : null}
      </nav>
    </>
  );
}
