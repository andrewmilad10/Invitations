"use client";

import { Check, Copy, ExternalLink, Mail, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setWeddingPublished } from "@/features/weddings/actions";
import { cn } from "@/lib/utils";
import { updateSettings } from "./actions";
import { setSettings, setStatus } from "./bundle-updates";
import { useEditor } from "./editor-context";
import { publishChecklist } from "./publish-checklist";

/**
 * Publish flow: readiness checklist, link and visibility, then a "you're
 * live" state with sharing. Pending edits are saved first so guests see
 * exactly what the couple sees.
 */
export function PublishDialog({ open, onClose, onEditLink }: { open: boolean; onClose: () => void; onEditLink: () => void }) {
  const { weddingId, bundle, update, save, flush, siteUrl } = useEditor();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [justPublished, setJustPublished] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const url = `${siteUrl}/w/${bundle.wedding.slug}`;
  const couple = `${bundle.wedding.partner_one_name} & ${bundle.wedding.partner_two_name}`;
  const checklist = publishChecklist(bundle);
  const blocked = checklist.some((c) => c.required && !c.done);
  const live = bundle.wedding.status === "published";
  const s = bundle.settings;

  function setVisibility(visibility: "public" | "unlisted") {
    update((b) => setSettings(b, { visibility }));
    save("settings", () => updateSettings(weddingId, { locale: s.locale as "en" | "ar", timezone: s.timezone, visibility, musicEnabled: s.music_enabled }), 0);
  }

  function publish() {
    startTransition(async () => {
      await flush();
      const result = await setWeddingPublished(weddingId, true);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      update((b) => setStatus(b, "published"));
      setJustPublished(true);
    });
  }

  function close() {
    setJustPublished(false);
    onClose();
  }

  const message = `${couple} — you're invited! ${url}`;

  return (
    <dialog
      ref={dialog}
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-lg border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40"
      aria-labelledby="publish-title"
    >
      <div className="relative p-7 sm:p-9">
        <button type="button" onClick={close} className="absolute end-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Close">
          <X className="size-4" />
        </button>

        {live && justPublished ? (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Published</p>
            <h2 id="publish-title" className="mt-3 font-serif text-4xl font-light">Your invitation is live</h2>
            <p className="mt-3 text-sm text-muted-foreground">Share it with your guests. Any change you make from now on appears as soon as they refresh.</p>
            <LinkBox url={url} />
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button asChild variant="outline">
                <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`mailto:?subject=${encodeURIComponent(`${couple} — wedding invitation`)}&body=${encodeURIComponent(message)}`}>
                  <Mail /> Email
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open
                </a>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="publish-title" className="font-serif text-4xl font-light">Ready to share?</h2>
            <p className="mt-3 text-sm text-muted-foreground">Publishing makes your invitation available at its link. You can keep editing and unpublish at any time.</p>

            <ul className="mt-6 grid gap-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  <span className={cn("grid size-5 place-items-center rounded-full border", item.done ? "border-success bg-success text-white" : "border-input")}>
                    {item.done ? <Check className="size-3" /> : null}
                  </span>
                  <span className={item.done ? "" : "text-muted-foreground"}>
                    {item.label}
                    {!item.done ? <span className="ms-1 text-xs">{item.required ? "— required" : "— recommended"}</span> : null}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Your link</p>
              <LinkBox url={url} />
              <button
                type="button"
                className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={() => {
                  close();
                  onEditLink();
                }}
              >
                Change the link
              </button>
            </div>

            <fieldset className="mt-6 grid gap-2">
              <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Who can find it</legend>
              {(
                [
                  ["unlisted", "Only people with the link", "Recommended. Search engines won't list it."],
                  ["public", "Anyone", "It may appear in search results."],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-3", s.visibility === value ? "border-primary" : "border-border")}>
                  <input type="radio" name="visibility" className="mt-1 accent-[var(--primary)]" checked={s.visibility === value} onChange={() => setVisibility(value)} />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-8 flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>
                Not yet
              </Button>
              <Button onClick={publish} disabled={blocked || pending}>
                {pending ? "Publishing…" : "Publish invitation"}
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

function LinkBox({ url }: { url: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md border bg-background p-2 ps-3">
      <code className="min-w-0 flex-1 truncate text-sm">{url.replace(/^https?:\/\//, "")}</code>
      <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(url).then(() => toast.success("Link copied"))}>
        <Copy /> Copy
      </Button>
    </div>
  );
}
