"use client";

import { Check, MessageCircle } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { waLink } from "@/features/orders/types";
import { markReminderSent } from "../actions";
import { fmtDay } from "../format";
import { daysLeft, type ReminderRow } from "../types";

/**
 * Renewal reminders queued every night for invitations ending within 14
 * days: message the couple, then mark it sent (it leaves the list at once).
 */
export function Reminders({ rows, siteUrl }: { rows: ReminderRow[]; siteUrl: string }) {
  const [shown, remove] = useOptimistic(rows, (list, id: number) => list.filter((r) => r.id !== id));
  const [, start] = useTransition();
  if (!shown.length) return <p className="mt-4 text-sm text-muted-foreground">Nobody to remind right now.</p>;
  return (
    <ul className="mt-4 grid gap-2">
      {shown.map((r) => {
        const left = daysLeft(r.endsAt) ?? 0;
        const hello = r.customerName ? `Hello ${r.customerName.split(" ")[0]},` : "Hello,";
        const text = `${hello} your Vellum invitation for ${r.names} (${siteUrl}/w/${r.slug}) stays live until ${fmtDay(r.endsAt)}. Reply here if you'd like to keep it online for another 3 months.`;
        return (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t pt-2 text-sm">
            <span className="min-w-0">
              <span className="font-medium">{r.names}</span>
              <span className="text-muted-foreground"> · ends {fmtDay(r.endsAt)} ({left > 0 ? `${left} day${left === 1 ? "" : "s"} left` : "ended"})</span>
            </span>
            <span className="flex gap-1.5">
              {r.customerPhone ? (
                <Button asChild size="sm" variant="outline">
                  <a href={waLink(r.customerPhone, text)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              ) : r.customerEmail ? (
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:${r.customerEmail}?subject=${encodeURIComponent("Your invitation ends soon")}&body=${encodeURIComponent(text)}`}>Email</a>
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  start(async () => {
                    remove(r.id);
                    const res = await markReminderSent(r.id);
                    if (!res.ok) toast.error(res.error);
                  })
                }
              >
                <Check /> Mark as sent
              </Button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
