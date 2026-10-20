import { createAnonClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * For an uptime monitor (e.g. UptimeRobot): 200 when the site and its
 * database answer, 503 when the database doesn't. Says nothing else.
 */
export async function GET() {
  let db = false;
  try {
    const supabase = createAnonClient();
    const { error } = await Promise.race([
      supabase.rpc("get_public_invitation", { p_slug: "health-check" }),
      new Promise<{ error: Error }>((resolve) => setTimeout(() => resolve({ error: new Error("timeout") }), 4000)),
    ]);
    db = !error;
  } catch {
    db = false;
  }
  return Response.json({ ok: db }, { status: db ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
