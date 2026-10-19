"use client";

import { useRef, useState, type FormEvent } from "react";
import type { InvitationModel, PublicWish } from "@/core/invitation/model";
import { replyErrorText } from "@/core/replies/schema";
import type { SectionContent } from "@/core/sections/registry";
import { useReplyActions } from "./context";
import s from "./reply.module.css";

const SAMPLE: PublicWish[] = [
  { name: "Aunt Hoda", message: "Wishing you a lifetime of love and laughter!", at: "" },
  { name: "Karim & Salma", message: "Can't wait to dance with you both.", at: "" },
];
const SAMPLE_AR: PublicWish[] = [
  { name: "خالتو هدى", message: "أتمنى لكما عمرًا من الحب والضحك!", at: "" },
  { name: "كريم وسلمى", message: "متحمسون للرقص معكما.", at: "" },
];

/**
 * Wishes, for designs that don't draw their own: guests' messages and a small
 * form to add one. Previews show two example wishes and save nothing.
 */
export function WishesSection({ model, content }: { model: InvitationModel; content: SectionContent<"wishes"> }) {
  const ar = model.locale === "ar";
  const actions = useReplyActions();
  const live = model.mode === "live" && actions;
  const [list, setList] = useState<PublicWish[]>(live ? model.wishes : ar ? SAMPLE_AR : SAMPLE);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(model.guest?.name ?? "");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const sending = useRef(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    setError("");
    if (!name.trim() || !message.trim()) {
      setError(replyErrorText("invalid", ar));
      return;
    }
    if (!live) {
      setList((l) => [{ name: name.trim(), message: message.trim(), at: "" }, ...l]);
      setState("sent");
      return;
    }
    sending.current = true;
    setState("sending");
    const res = await actions.submitWish({ slug: model.wedding.slug, name, message }).catch(() => ({ ok: false as const, error: "offline" }));
    sending.current = false;
    if (res.ok) {
      // A wish that waits for the couple's approval isn't shown yet.
      if (!res.pending) setList((l) => [{ name: name.trim(), message: message.trim(), at: new Date().toISOString() }, ...l]);
      setPending(Boolean(res.pending));
      setState("sent");
      setMessage("");
    } else {
      setError(replyErrorText(res.error, ar));
      setState("idle");
    }
  }

  return (
    <section id="wishes" data-section="wishes" className={s.sec}>
      <div className={s.secIn}>
        <h2 className={s.secTitle}>{content.heading || (ar ? "اتركوا لنا أمنية" : "Leave us a wish")}</h2>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        {list.length ? (
          <div className={s.wishList}>
            {list.slice(0, 12).map((w, i) => (
              <figure key={`${w.at}-${i}`} className={s.wish}>
                <b>{w.name}</b>
                <p>{w.message}</p>
              </figure>
            ))}
          </div>
        ) : null}
        {state === "sent" ? (
          <p className={s.small} role="status">
            {!live
              ? ar
                ? "هذه معاينة، لذلك لم يُحفظ شيء."
                : "This is a preview, so nothing was saved."
              : pending
                ? ar
                  ? "شكرًا! وصلت أمنيتكم، وستظهر هنا بعد أن يقرأها العروسان."
                  : "Thank you! The couple will read your wish, and it will appear here once they do."
                : ar
                  ? "شكرًا! وصلت أمنيتكم."
                  : "Thank you! Your wish is on its way to us."}
          </p>
        ) : open ? (
          <form className={s.form} onSubmit={submit} noValidate>
            <label className={s.field}>
              <span className={s.label}>{ar ? "اسمكم" : "Your name"}</span>
              <input className={s.input} value={name} maxLength={80} autoComplete="name" onChange={(e) => setName(e.target.value)} />
            </label>
            <label className={s.field}>
              <span className={s.label}>{ar ? "أمنيتكم" : "Your wish"}</span>
              <textarea className={s.input} rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            {error ? (
              <p className={s.error} role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className={s.send} disabled={state === "sending"}>
              {state === "sending" ? (ar ? "جارٍ الإرسال…" : "Sending…") : ar ? "إرسال" : "Send wish"}
            </button>
          </form>
        ) : model.mode === "export" ? null : (
          <button type="button" className={s.pill} onClick={() => setOpen(true)}>
            {ar ? "اكتبوا أمنية" : "Write a wish"}
          </button>
        )}
      </div>
    </section>
  );
}

/** Gifts, for designs that don't draw their own: a few words and how to send, with a copy button. */
export function GiftsSection({ model, content }: { model: InvitationModel; content: SectionContent<"gifts"> }) {
  const ar = model.locale === "ar";
  const [copied, setCopied] = useState(false);
  if (!content.account && !content.note) return null;
  return (
    <section id="gifts" data-section="gifts" className={s.sec}>
      <div className={s.secIn}>
        <h2 className={s.secTitle}>{content.heading || (ar ? "هدية لنا" : "A gift for us")}</h2>
        {content.note ? <p className={s.lead}>{content.note}</p> : null}
        {content.account ? (
          <div className={s.gift}>
            {content.method ? <small>{content.method}</small> : null}
            <code>{content.account}</code>
            {model.mode !== "export" ? (
              <button
                type="button"
                className={s.pill}
                onClick={() => {
                  navigator.clipboard?.writeText(content.account).then(
                    () => setCopied(true),
                    () => setCopied(false),
                  );
                }}
              >
                {copied ? (ar ? "تم النسخ" : "Copied") : ar ? "نسخ" : "Copy"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** "Dear Mariam & family" for a few seconds at the top when a personal link is opened. */
export function GuestDear({ model }: { model: InvitationModel }) {
  const g = model.guest;
  if (!g) return null;
  return (
    <p className={s.dear} role="note" data-guest-dear>
      <small>{g.greeting || (model.locale === "ar" ? "عزيزنا" : "Dear")}</small>
      {g.name}
    </p>
  );
}
