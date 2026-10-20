/**
 * The database's quota and rate-limit refusals (0020, 0022) carry a message
 * written for people ("A guest list can have up to 1,500 guests."). Show
 * that instead of a generic "didn't save"; everything else stays generic.
 */
export function limitError(error: { code?: string; message?: string } | null | undefined): { ok: false; error: string } | null {
  if (!error || (error.code !== "P0413" && error.code !== "P0429")) return null;
  return { ok: false, error: error.message || "You've reached a limit. Please try again later." };
}
