import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, image optimisation, metadata images and
    // the public invitation pages (which never need a session).
    "/((?!_next/static|_next/image|favicon.ico|w/|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2?|mp3)$).*)",
  ],
};
