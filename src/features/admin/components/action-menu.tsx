"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WIDTH = 224; // 14rem

/**
 * A "⋯" actions menu that renders in a fixed portal above everything, so it
 * is never clipped by a table's horizontal-scroll box. Closes on outside
 * click, Escape, scroll or resize.
 */
export function ActionMenu({ label, disabled, children }: { label: string; disabled?: boolean; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  function toggle() {
    const r = anchor.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(window.innerWidth - WIDTH - 8, r.right - WIDTH)) });
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node) && !anchor.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    // Close rather than chase the anchor when the page moves.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <span ref={anchor} className="inline-flex">
      <Button variant="ghost" size="sm" aria-label={label} aria-expanded={open} aria-haspopup="menu" disabled={disabled} onClick={toggle}>
        <MoreHorizontal />
      </Button>
      {open && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menu}
              role="menu"
              style={{ position: "fixed", top: pos.top, left: pos.left, width: WIDTH }}
              className="z-50 grid gap-0.5 rounded-xl border bg-card p-1.5 text-sm shadow-xl"
            >
              {children(close)}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

/** One row in an ActionMenu. */
export function MenuItem({ icon: Icon, children, onClick, danger }: { icon: LucideIcon; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-left", danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-muted")}
    >
      <Icon className="size-4" aria-hidden /> {children}
    </button>
  );
}
