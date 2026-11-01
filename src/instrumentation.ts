import { type Instrumentation } from "next";

/**
 * Server-side error monitoring.
 *
 * Next calls `onRequestError` for every error the server captures — Server
 * Components, route handlers, server actions and the proxy. We forward a SAFE
 * summary to an observability webhook: the error message/digest, the HTTP
 * method, the route, and the path WITHOUT its query string. We never send
 * headers, cookies, query strings or request bodies, so no guest token or
 * personal data can leak into a log (docs/rules/security.md).
 *
 * It is a no-op until `ERROR_WEBHOOK_URL` is set, so shipping it changes
 * nothing until you point it at a channel. The payload is compatible with a
 * Slack/Discord incoming webhook (`text`) and also carries structured fields
 * for any other collector (e.g. a serverless function in front of Sentry).
 * Monitoring must never affect the request, so every failure here is swallowed.
 */

// Collapse repeats of the same error so a hot loop can't flood the channel.
const WINDOW_MS = 60_000;
const recent = new Map<string, number>();

function throttled(key: string): boolean {
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < WINDOW_MS) return true;
  recent.set(key, now);
  if (recent.size > 200) for (const [k, t] of recent) if (now - t > WINDOW_MS) recent.delete(k);
  return false;
}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;

  const message = (err instanceof Error ? err.message : String(err)).slice(0, 500);
  const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest?: unknown }).digest) : undefined;
  // Path only — the query string can carry a guest token, which never leaves in a log.
  const path = request.path.split("?")[0];

  // One line per distinct (where + message) per minute.
  if (throttled(`${context.routeType}:${context.routePath}:${message}`)) return;

  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
  const payload = {
    text: `🔴 Vellum ${env} · ${request.method} ${path}\n${message}${digest ? ` (digest ${digest})` : ""}\n${context.routerKind} · ${context.routeType} · ${context.routePath}`,
    env,
    method: request.method,
    path,
    message,
    digest,
    routerKind: context.routerKind,
    routeType: context.routeType,
    routePath: context.routePath,
    at: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Never let the monitor affect the request path.
  }
};
