import "server-only";

/**
 * Optional instant alerts for sensitive admin actions (payments, refunds,
 * team changes, invitations turned off). Set ALERT_WEBHOOK_URL to a Discord
 * or Slack incoming webhook, or a Telegram bot URL ending in
 * /sendMessage?chat_id=…; the message is sent as `content` (Discord), `text`
 * (Slack, Telegram). Short summaries only: no customer names, emails or
 * phone numbers. Never throws, and gives up after 3 seconds; the action
 * itself has already happened and is in the activity log either way.
 */
export async function alert(message: string) {
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!url || !/^https:\/\//.test(url)) return;
  const text = `Vellum admin: ${message}`.slice(0, 1500);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, text }),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
  } catch {
    // Alerts are best-effort.
  }
}
