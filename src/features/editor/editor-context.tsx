"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { WeddingBundle } from "@/core/wedding/bundle";
import type { MemberRole } from "@/lib/supabase/database.types";

type SaveResult = { ok: true } | { ok: false; error: string };
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorContextValue {
  weddingId: string;
  role: MemberRole;
  canEdit: boolean;
  siteUrl: string;
  /** URL of the preview iframe. */
  previewUrl: string;
  bundle: WeddingBundle;
  /** Apply a local change immediately (the preview updates at once). */
  update: (fn: (b: WeddingBundle) => WeddingBundle) => void;
  /**
   * Schedule a save. Calls with the same key are debounced (last one wins),
   * so typing produces one request per pause, not per keystroke.
   */
  save: (key: string, run: () => Promise<SaveResult>, delayMs?: number) => void;
  /** Resolve pending debounced saves now (e.g. before publishing). */
  flush: () => Promise<void>;
  status: SaveStatus;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}

export function EditorProvider({
  weddingId,
  role,
  siteUrl,
  initialBundle,
  previewUrl = `/preview/${weddingId}`,
  children,
}: {
  weddingId: string;
  role: MemberRole;
  siteUrl: string;
  initialBundle: WeddingBundle;
  previewUrl?: string;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState(initialBundle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timers = useRef(new Map<string, { timer: number; run: () => Promise<SaveResult> }>());
  // One save at a time per key: a change made while the previous save of the
  // same thing is still on its way waits for it, and only the latest is sent.
  const lanes = useRef(new Map<string, { next: (() => Promise<SaveResult>) | null; done: Promise<void> }>());
  const inFlight = useRef(0);
  const failed = useRef(false);

  const settle = useCallback(() => {
    if (inFlight.current === 0 && timers.current.size === 0 && lanes.current.size === 0) {
      setStatus(failed.current ? "error" : "saved");
      failed.current = false;
    }
  }, []);

  const execute = useCallback(async (run: () => Promise<SaveResult>) => {
    inFlight.current++;
    setStatus("saving");
    let result: SaveResult;
    try {
      result = await run();
    } catch {
      result = { ok: false, error: "Connection problem. Your last change wasn't saved." };
    }
    inFlight.current--;
    if (!result.ok) {
      failed.current = true;
      // the same message once, not once per failed request
      toast.error(result.error, { id: "editor-save-error" });
    }
  }, []);

  const send = useCallback(
    (key: string, run: () => Promise<SaveResult>): Promise<void> => {
      const busy = lanes.current.get(key);
      if (busy) {
        busy.next = run;
        return busy.done;
      }
      const lane: { next: (() => Promise<SaveResult>) | null; done: Promise<void> } = { next: run, done: Promise.resolve() };
      lanes.current.set(key, lane);
      lane.done = (async () => {
        while (lane.next) {
          const r = lane.next;
          lane.next = null;
          await execute(r);
        }
        lanes.current.delete(key);
        settle();
      })();
      return lane.done;
    },
    [execute, settle],
  );

  const save = useCallback<EditorContextValue["save"]>(
    (key, run, delayMs = 700) => {
      const existing = timers.current.get(key);
      if (existing) window.clearTimeout(existing.timer);
      setStatus("saving");
      const timer = window.setTimeout(() => {
        timers.current.delete(key);
        void send(key, run);
      }, delayMs);
      timers.current.set(key, { timer, run });
    },
    [send],
  );

  const flush = useCallback(async () => {
    const pending = [...timers.current.entries()];
    timers.current.clear();
    pending.forEach(([, p]) => window.clearTimeout(p.timer));
    await Promise.all([...pending.map(([key, p]) => send(key, p.run)), ...[...lanes.current.values()].map((l) => l.done)]);
    settle();
  }, [send, settle]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timers.current.size > 0 || lanes.current.size > 0 || inFlight.current > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      weddingId,
      role,
      canEdit: role === "owner" || role === "editor",
      siteUrl,
      previewUrl,
      bundle,
      update: (fn) => setBundle((b) => fn(b)),
      save,
      flush,
      status,
    }),
    [weddingId, role, siteUrl, previewUrl, bundle, save, flush, status],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
