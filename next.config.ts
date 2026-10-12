import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;

/**
 * Who may show Vellum inside a frame. Only the shop's live preview (/embed)
 * may be framed, and only by the Shopify store (and the Shopify admin's theme
 * editor); every other page refuses to be framed (no clickjacking).
 * Add the shop's own domain in SHOP_FRAME_ORIGINS, space-separated.
 */
const shopOrigins = ["https://*.myshopify.com", "https://admin.shopify.com", ...(process.env.SHOP_FRAME_ORIGINS ?? "").split(/\s+/).filter(Boolean)].join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/((?!embed/).*)", headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      { source: "/embed/:path*", headers: [{ key: "Content-Security-Policy", value: `frame-ancestors 'self' ${shopOrigins}` }] },
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
