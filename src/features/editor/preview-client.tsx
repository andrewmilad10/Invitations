"use client";

import { useEffect, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { parseWeddingBundle, type WeddingBundle } from "@/core/wedding/bundle";
import { InvitationRenderer } from "@/templates/renderers";
import { buildPreviewModel } from "./preview-model";
import { isPreviewMessage, type PreviewMessage } from "./preview-protocol";

/**
 * Runs inside the editor's preview iframe (/preview/[id]). Starts from the
 * saved bundle, then re-renders from every bundle the editor posts — so
 * changes appear instantly, before they are saved. Opened directly (not in an
 * iframe) it is a full-page preview of the saved state.
 *
 * The first render uses the model built on the server, so hydration never
 * depends on the browser's Intl data matching Node's.
 */
export function PreviewClient({ initialBundle, initialModel }: { initialBundle: WeddingBundle; initialModel: InvitationModel }) {
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (!isPreviewMessage(event.data)) return;
      if (event.data.type === "vellum:bundle") {
        const next = parseWeddingBundle(event.data.bundle);
        if (next && next.wedding.id === initialBundle.wedding.id) setModel(buildPreviewModel(next));
      }
      if (event.data.type === "vellum:replay-opening") {
        window.dispatchEvent(new CustomEvent("invitation:replay-opening"));
      }
    };
    window.addEventListener("message", onMessage);
    if (window.parent !== window) {
      window.parent.postMessage({ type: "vellum:preview-ready" } satisfies PreviewMessage, window.location.origin);
    }
    return () => window.removeEventListener("message", onMessage);
  }, [initialBundle.wedding.id]);

  return <InvitationRenderer model={model} />;
}

