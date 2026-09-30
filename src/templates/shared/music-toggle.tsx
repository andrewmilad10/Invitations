"use client";

import { Music2, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";

/**
 * Background music control. Browsers block autoplay until a user gesture, so
 * music starts only when the guest presses play (or, in the cinematic
 * template, opens the envelope — which dispatches `invitation:play-music`).
 * Never plays in preview or export mode.
 */
export function MusicToggle({ model, className }: { model: InvitationModel; className?: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const allowed = model.music.enabled && model.music.src && (model.mode === "live" || model.mode === "sample");

  useEffect(() => {
    if (!allowed) return;
    const play = () => {
      audio.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    window.addEventListener("invitation:play-music", play);
    return () => window.removeEventListener("invitation:play-music", play);
  }, [allowed]);

  if (!allowed) return null;

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audio} src={model.music.src!} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? model.strings.pauseMusic : model.strings.playMusic}
        className={cn(
          "fixed bottom-5 end-5 z-40 grid size-12 place-items-center rounded-full border border-inv-border bg-inv-surface/90 text-inv-fg shadow-inv backdrop-blur transition hover:scale-105",
          className,
        )}
      >
        {playing ? <Pause className="size-4" /> : <Music2 className="size-4" />}
      </button>
    </>
  );
}
