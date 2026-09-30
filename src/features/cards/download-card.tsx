"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSection } from "@/core/invitation/model";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { buildPreviewModel } from "@/features/preview/preview-model";
import { cn } from "@/lib/utils";
import { StationeryCard } from "@/templates/shared/stationery/card";

/** Width the card is drawn at before export (×2 pixel ratio → ~1800 px wide). */
const EXPORT_WIDTH = 900;

/**
 * "Download card": draws the couple's invitation card (their design,
 * colours, names, date, venue and photos) off screen and saves it as a PNG
 * they can send on WhatsApp or by email. Runs entirely in the browser.
 */
export function DownloadCardButton({ bundle, className, label = "Download card" }: { bundle: WeddingBundle; className?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const node = useRef<HTMLDivElement>(null);
  const model = busy ? buildPreviewModel(bundle) : null;

  useEffect(() => {
    if (!busy) return;
    let cancelled = false;
    (async () => {
      try {
        const el = node.current?.firstElementChild as HTMLElement | null;
        if (!el) throw new Error("Card not ready");
        const imgs = Array.from(el.querySelectorAll("img"));
        imgs.forEach((img) => (img.loading = "eager"));
        await Promise.all(imgs.map(whenLoaded));
        await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
        await document.fonts.ready;
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
        if (cancelled) return;
        const a = document.createElement("a");
        const names = `${bundle.wedding.partner_one_name}-${bundle.wedding.partner_two_name}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        a.href = dataUrl;
        a.download = `${names || "wedding"}-invitation.png`;
        a.click();
      } catch {
        toast.error("Couldn't create the image. Please try again.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [busy, bundle]);

  return (
    <>
      <Button type="button" variant="outline" size="sm" className={cn(className)} disabled={busy} onClick={() => setBusy(true)}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />} {label}
      </Button>
      {model ? (
        <div ref={node} aria-hidden lang={model.locale} dir={model.dir} className="pointer-events-none fixed -left-[10000px] top-0" style={{ width: EXPORT_WIDTH }}>
          <StationeryCard
            art={model.template.art}
            text={{
              partnerOne: model.wedding.partnerOne,
              partnerTwo: model.wedding.partnerTwo,
              eyebrow: getSection(model, "hero")?.content.eyebrow ?? null,
              dateLabel: model.wedding.date?.long ?? null,
              place: model.events.ceremony?.venueName ?? model.events.reception?.venueName ?? null,
            }}
            photos={[model.media.hero, ...model.media.gallery].filter((m) => m !== null).map((m) => ({ url: m.url, alt: m.alt }))}
            sizes={`${EXPORT_WIDTH * 2}px`}
            options={model.template.card}
            style={model.cssVars as CSSProperties}
          />
        </div>
      ) : null}
    </>
  );
}

function whenLoaded(img: HTMLImageElement): Promise<void> {
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}
