/**
 * Content Security Policy: what a page may load and talk to. Shared by
 * next.config.ts (public pages, cached and static) and the proxy (signed-in,
 * admin and login pages, which get a fresh random nonce per request).
 *
 * - Public pages: scripts only from this site (Next.js's small inline
 *   start-up scripts are allowed inline).
 * - Strict pages: only scripts carrying this request's nonce, plus what
 *   those scripts load ('strict-dynamic'); no other inline script runs, so
 *   injected markup can't execute code where accounts and money are.
 *
 * Styles keep 'unsafe-inline' (React style attributes need it; a nonce
 * would switch that off), which can't run code.
 */
export const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

export function buildCsp({ frameAncestors, nonce, supabaseUrl, dev, siteUrl }: { frameAncestors: string; nonce?: string; supabaseUrl?: string; dev: boolean; siteUrl?: string }) {
  // Production is HTTPS; a site served over plain http (only local test runs)
  // must not upgrade its calls to a local http Supabase.
  const upgrade = !dev && !siteUrl?.startsWith("http://");
  let supabase = "";
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    supabase = `${u.origin} ${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
  }
  const script = nonce
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}${dev ? " 'unsafe-eval'" : ""}`
    : `'self' 'unsafe-inline' ${TURNSTILE_ORIGIN}${dev ? " 'unsafe-eval'" : ""}`;
  return [
    "default-src 'self'",
    `script-src ${script}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co ${supabase}`.trim(),
    `media-src 'self' blob: https://*.supabase.co ${supabase}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${TURNSTILE_ORIGIN} ${supabase}`.trim(),
    `frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com ${TURNSTILE_ORIGIN}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(upgrade ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/** Pages that get the strict, per-request policy (all are rendered per request). */
export const STRICT_CSP_PREFIXES = ["/dashboard", "/admin", "/preview", "/login", "/register", "/forgot-password"];
export const isStrictCspPath = (path: string) => STRICT_CSP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
