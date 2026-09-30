"use client";

import { Copy, Mail, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Share a published invitation: native share sheet (phones), copy link,
 * WhatsApp, email. Unpublished weddings explain why sharing is off.
 */
export function ShareMenu({ url, coupleName, published, size = "sm" }: { url: string; coupleName: string; published: boolean; size?: "sm" | "default" }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const message = `${coupleName} — you're invited! ${url}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!published) {
    return (
      <Button size={size} variant="ghost" disabled title="Publish your invitation to share it">
        <Share2 /> Share
      </Button>
    );
  }

  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm hover:bg-secondary";
  return (
    <div ref={root} className="relative">
      <Button size={size} variant="ghost" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Share2 /> Share
      </Button>
      {open ? (
        <div role="menu" className="absolute end-0 z-20 mt-1 w-56 overflow-hidden rounded-md border bg-card py-1 shadow-lg">
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                navigator.share({ title: coupleName, text: `${coupleName} — you're invited!`, url }).catch(() => undefined);
              }}
            >
              <Share2 className="size-4" /> Share…
            </button>
          ) : null}
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              navigator.clipboard?.writeText(url).then(() => toast.success("Link copied"));
            }}
          >
            <Copy className="size-4" /> Copy link
          </button>
          <a role="menuitem" className={item} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a role="menuitem" className={item} href={`mailto:?subject=${encodeURIComponent(`${coupleName} — wedding invitation`)}&body=${encodeURIComponent(message)}`} onClick={() => setOpen(false)}>
            <Mail className="size-4" /> Email
          </a>
          <a role="menuitem" className={cn(item, "border-t")} href={url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <ExternalLink className="size-4" /> Open invitation
          </a>
        </div>
      ) : null}
    </div>
  );
}
