"use client";

import { Monitor, RotateCcw, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest } from "@/templates/registry";
import { useEditor } from "./editor-context";
import { isPreviewMessage, type PreviewMessage } from "./preview-protocol";

/** Iframe preview that mirrors the editor's working bundle. */
export function PreviewPane({ className }: { className?: string }) {
  const { previewUrl, bundle } = useEditor();
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

  return (
    <div className={cn("flex min-h-0 flex-col bg-muted", className)}>
      <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-2">
        <p className="text-xs text-muted-foreground">Live preview</p>
        <div className="flex items-center gap-1" role="group" aria-label="Preview controls">
          {resolveTemplateManifest(bundle.wedding.template_id).features.opening !== "none" ? (
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
              className={cn("rounded-md p-2 text-muted-foreground hover:bg-secondary", device === d && "bg-secondary text-foreground")}
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
          src={previewUrl}
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
