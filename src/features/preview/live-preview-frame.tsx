"use client";

import { Monitor, RotateCcw, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest } from "@/templates/registry";
import { isPreviewMessage, type PreviewMessage } from "./preview-protocol";

/**
 * Same-origin iframe that renders a WeddingBundle with the real template and
 * re-renders on every change (sent via postMessage, before anything is
 * saved). Used by the editor and by the no-account try flow.
 */
export function LivePreviewFrame({
  src,
  bundle,
  label = "Live preview",
  toolbarExtra,
  className,
}: {
  src: string;
  bundle: WeddingBundle;
  label?: string;
  toolbarExtra?: ReactNode;
  className?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  // Incremented on every "ready" from the iframe (initial load and any reload).
  const [readyCount, setReadyCount] = useState(0);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");

  const post = useCallback((message: PreviewMessage) => {
    frame.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (isPreviewMessage(event.data) && event.data.type === "vellum:preview-ready") setReadyCount((n) => n + 1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (readyCount > 0) post({ type: "vellum:bundle", bundle });
  }, [readyCount, bundle, post]);

  const hasOpening = resolveTemplateManifest(bundle.wedding.template_id).features.opening !== "none";

  return (
    <div className={cn("flex min-h-0 flex-col bg-muted", className)}>
      <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          {toolbarExtra}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Preview controls">
          {hasOpening ? (
            <button
              type="button"
              onClick={() => post({ type: "vellum:replay-opening" })}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Replay opening
            </button>
          ) : null}
          {(["desktop", "phone"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={cn("hidden rounded-md p-2 text-muted-foreground hover:bg-secondary sm:block", device === d && "bg-secondary text-foreground")}
              aria-label={d === "desktop" ? "Desktop" : "Phone"}
            >
              {d === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-0 lg:p-4">
        <iframe
          ref={frame}
          src={src}
          title="Invitation preview"
          className={cn(
            "h-full bg-white transition-[width] duration-300 lg:rounded-md lg:shadow-sm",
            device === "phone" ? "w-[390px] max-w-full" : "w-full",
          )}
        />
      </div>
    </div>
  );
}
