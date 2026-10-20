"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** True when the bot check is set up (both keys must be set; see .env.example). */
export const botCheckOn = Boolean(SITE_KEY);

/**
 * Cloudflare Turnstile: a quick, mostly invisible "are you a person" check on
 * sign-up, login and password reset. It puts its answer in a hidden
 * `cf-turnstile-response` field of the surrounding form, which the server
 * passes to Supabase Auth (Supabase checks it with the secret key). Renders
 * nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. `resetKey` changes
 * after each attempt: answers are single-use, so it asks for a fresh one.
 */
export function BotCheck({ resetKey }: { resetKey?: unknown }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);

  const mount = () => {
    if (!SITE_KEY || !box.current || !window.turnstile || id.current) return;
    id.current = window.turnstile.render(box.current, { sitekey: SITE_KEY, theme: "light", size: "flexible", appearance: "interaction-only" });
  };

  useEffect(() => {
    mount();
    return () => {
      if (id.current) window.turnstile?.remove(id.current);
      id.current = null;
    };
  }, []);

  useEffect(() => {
    if (id.current) window.turnstile?.reset(id.current);
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} />
      <div ref={box} className="min-h-0 empty:hidden" />
    </>
  );
}
