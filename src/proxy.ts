import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, isStrictCspPath } from "@/lib/security/csp";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // The home page never reads the session: skip the Supabase round trip.
  if (path === "/") return NextResponse.next();
  if (!isStrictCspPath(path)) return updateSession(request);

  // Signed-in, admin and login pages: a strict script policy with a fresh
  // random nonce per request. Next.js reads it from the request header and
  // puts it on its own scripts; nothing else inline can run.
  const nonce = btoa(crypto.randomUUID());
  const policy = buildCsp({
    frameAncestors: "'self'",
    nonce,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    dev: process.env.NODE_ENV !== "production",
  });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", policy);
  const response = await updateSession(request);
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, image optimisation, metadata images,
    // the public invitation pages and the design galleries (none of which
    // read the session).
    "/((?!_next/static|_next/image|favicon.ico|w/|templates/|invitations|websites|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2?|mp3)$).*)",
  ],
};
