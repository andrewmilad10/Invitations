import type { NextConfig } from "next";

/**
 * The live Supabase project, used only for builds on Vercel when its
 * environment settings don't name one (values set in Vercel always win).
 * Both values are public by design: the publishable key is sent to every
 * visitor's browser, and Row Level Security protects the data. The secret
 * key is never here, nor anywhere else in the code.
 */
const LIVE_SUPABASE = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sehdfrbsfxmewskznqwf.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_icJ-qGcMzYm3HSW7aSslyg_-pu2JWt7",
};
const onVercel = process.env.VERCEL === "1";
const publicSettings: Record<string, string> = {};
if (onVercel && !process.env.NEXT_PUBLIC_SUPABASE_URL) Object.assign(publicSettings, LIVE_SUPABASE);
if (onVercel && !process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  publicSettings.NEXT_PUBLIC_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
}
// Server code reads process.env directly; give it the same values.
for (const [k, v] of Object.entries(publicSettings)) process.env[k] = v;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;

/**
 * Who may show Vellum inside a frame. Only the shop's live preview (/embed)
 * may be framed, and only by the Shopify store (and the Shopify admin's theme
 * editor); every other page refuses to be framed (no clickjacking).
 * Add the shop's own domain in SHOP_FRAME_ORIGINS, space-separated.
 */
const shopOrigins = ["https://*.myshopify.com", "https://admin.shopify.com", ...(process.env.SHOP_FRAME_ORIGINS ?? "").split(/\s+/).filter(Boolean)].join(" ");

/**
 * Sent with every page. Referrer-Policy keeps a guest's personal link
 * (/w/{slug}?g=…) from leaking to sites they click through to (maps,
 * gift pages): other sites only ever see the origin.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/**
 * Content Security Policy: what a page may load and talk to. Scripts only
 * from this site (Next.js needs its small inline start-up scripts), data only
 * to this site and Supabase, frames only Google Maps. So even an injected
 * script could not load code from elsewhere or send data anywhere else.
 */
const supabaseOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "";
  const u = new URL(raw);
  return `${u.origin} ${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
})();
const isDev = process.env.NODE_ENV !== "production";
function csp(frameAncestors: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co ${supabaseOrigin}`.trim(),
    `media-src 'self' blob: https://*.supabase.co ${supabaseOrigin}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${supabaseOrigin}`.trim(),
    "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const nextConfig: NextConfig = {
  env: publicSettings,
  poweredByHeader: false,
  // Never publish source maps: the browser only gets minified bundles.
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages: never cached anywhere, never indexed.
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/((?!embed/).*)", headers: [{ key: "Content-Security-Policy", value: csp("'self'") }, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      { source: "/embed/:path*", headers: [{ key: "Content-Security-Policy", value: csp(`'self' ${shopOrigins}`) }] },
    ];
  },
  images: {
    remotePatterns: [
      // Curated photo library (src/features/media/library.ts)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" },
      // Hosted Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Self-hosted / local Supabase (from env)
      ...(supabaseHost
        ? [
            {
              protocol: supabaseHost.protocol.replace(":", "") as "http" | "https",
              hostname: supabaseHost.hostname,
              port: supabaseHost.port,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    // Local Supabase runs on 127.0.0.1, which Next 16 blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
