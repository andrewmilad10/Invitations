import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // The home page never reads the session: skip the Supabase round trip.
  if (request.nextUrl.pathname === "/") return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, image optimisation, metadata images,
    // the public invitation pages and the design galleries (none of which
    // read the session).
    "/((?!_next/static|_next/image|favicon.ico|w/|templates/|invitations|websites|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2?|mp3)$).*)",
  ],
};
