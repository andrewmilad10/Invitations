"use client";

import { Activity, Inbox, LayoutDashboard, ReceiptText, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { StaffRole } from "../types";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["owner", "admin", "marketing"] },
  { href: "/admin/orders", label: "Orders", icon: Inbox, roles: ["owner", "admin"] },
  { href: "/admin/invitations", label: "Invitations", icon: Sparkles, roles: ["owner", "admin", "marketing"] },
  { href: "/admin/sales", label: "Sales", icon: ReceiptText, roles: ["owner", "admin"] },
  { href: "/admin/team", label: "Team", icon: Users, roles: ["owner", "admin"] },
  { href: "/admin/activity", label: "Activity", icon: Activity, roles: ["owner", "admin"] },
] as const;

export function AdminNav({ role }: { role: StaffRole }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.filter((i) => (i.roles as readonly string[]).includes(role)).map(({ href, label, icon: Icon }) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
              on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
