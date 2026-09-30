import type { EventModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";

/** Lazy-loaded map for an event. Not rendered in export mode (no iframes in PDFs). */
export function MapEmbed({ event, className }: { event: EventModel; className?: string }) {
  if (!event.mapEmbedUrl) return null;
  return (
    <iframe
      src={event.mapEmbedUrl}
      title={event.venueName ?? event.title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("block w-full border-0", className)}
    />
  );
}
