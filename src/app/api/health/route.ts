import { createAnonClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Asked at most every 15 seconds per server, however often it's called, so
// hitting this address can't put load on the database.
let last: { at: number; ok: boolean } | null = null;

/**
 * For an uptime monitor (e.g. UptimeRobot): 200 when the site and its
 * database answer, 503 when the database doesn't. Says nothing else.
 */
export async function GET() {
  if (!last || Date.now() - last.at > 15_000) {
    let ok = false;
    try {
      const { error } = await Promise.race([
        createAnonClient().rpc("get_public_invitation", { p_slug: "health-check" }),
        new Promise<{ error: Error }>((resolve) => setTimeout(() => resolve({ error: new Error("timeout") }), 4000)),
      ]);
      ok = !error;
    } catch {
      ok = false;
    }
    last = { at: Date.now(), ok };
  }
  return Response.json({ ok: last.ok }, { status: last.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
