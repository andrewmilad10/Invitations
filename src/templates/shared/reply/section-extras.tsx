"use client";

import type { InvitationModel } from "@/core/invitation/model";
import s from "./reply.module.css";

/** Both families' names under the invitation words, in the design's own fonts. */
export function Families({ one, two, locale }: { one: string; two: string; locale: string }) {
  if (!one.trim() && !two.trim()) return null;
  const ar = locale === "ar";
  return (
    <div className={s.families} data-part="families">
      <p className={s.label}>{ar ? "بدعوة من" : "Invited by"}</p>
      <div className={s.familyRow}>
        {one.trim() ? <p>{one}</p> : null}
        {one.trim() && two.trim() ? <span aria-hidden>·</span> : null}
        {two.trim() ? <p>{two}</p> : null}
      </div>
    </div>
  );
}

const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** "Add to calendar": Google in a new tab, or a calendar file for Apple and Outlook. */
export function AddToCalendar({ model }: { model: InvitationModel }) {
  const start = model.countdownTarget;
  if (!start || model.mode === "export") return null;
  const ar = model.locale === "ar";
  const end = new Date(new Date(start).getTime() + 5 * 3600_000).toISOString();
  const first = model.events.ceremony ?? model.events.reception;
  const title = ar ? `زفاف ${model.wedding.coupleName}` : `${model.wedding.coupleName}'s wedding`;
  const place = [first?.venueName, first?.address].filter(Boolean).join(", ");
  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${stamp(start)}/${stamp(end)}`, location: place, details: model.mode === "live" && typeof window !== "undefined" ? window.location.origin + window.location.pathname : "" })}`;

  function ics() {
    const esc = (v: string) => v.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Vellum//Invitation//EN",
      "BEGIN:VEVENT",
      `UID:${model.wedding.id}@vellum`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(start!)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(title)}`,
      place ? `LOCATION:${esc(place)}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    a.download = "wedding.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className={s.calendar}>
      <a className={s.pill} href={google} target="_blank" rel="noopener noreferrer">
        {ar ? "أضيفوا إلى التقويم" : "Add to calendar"}
      </a>
      <button type="button" className={s.ghost} onClick={ics}>
        {ar ? "Apple / Outlook" : "Apple or Outlook"}
      </button>
    </div>
  );
}
