"use client";
/* eslint-disable @next/next/no-img-element -- watercolour pieces */

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { createPortal } from "react-dom";
import s from "./wisteria.module.css";

const ART = "/templates/wisteria-lake";

const T = {
  en: { name: "Your name", coming: "Will you join us?", yes: "Joyfully accepts", no: "Regretfully declines", guests: "Number of guests", note: "A note for the couple", send: "Send reply", close: "Close", thanks: "Thank you!", thanksNote: "This is how your guests will reply. Online replies are not open yet, so nothing was sent.", soon: "Online replies will open soon. Thank you!", link: "Reply online" },
  ar: { name: "اسمكم", coming: "هل ستشاركوننا؟", yes: "بكل سرور", no: "نعتذر بأسف", guests: "عدد الضيوف", note: "كلمة للعروسين", send: "إرسال الرد", close: "إغلاق", thanks: "شكرًا لكم!", thanksNote: "هكذا سيرد ضيوفكم. الرد عبر الإنترنت لم يُفتح بعد، لذلك لم يُرسل شيء.", soon: "سيُفتح الرد عبر الإنترنت قريبًا. شكرًا لكم!", link: "الرد عبر الإنترنت" },
};

/**
 * The reply envelope. The wax seal is a button: tapped, the seal presses down
 * and a cream reply card pops up out of the envelope into the middle of the
 * screen (the page dims behind it) with the reply date, the couple's words and a
 * small reply form (name, yes or no, guests, a note). Close, Escape or a tap
 * outside puts it away.
 *
 * Replies are not collected by Vellum yet, so nothing typed here is sent or
 * kept. When the couple has their own reply link, the button opens it. Without
 * one, the demo thanks the guest and says nothing was sent, and a real
 * invitation says online replies open soon.
 */
export function ReplyEnvelope({
  message,
  deadline,
  linkUrl,
  linkLabel,
  openLabel,
  hint,
  locale,
  demo,
  heading,
}: {
  message: string;
  deadline: string;
  linkUrl: string;
  linkLabel: string;
  openLabel: string;
  hint: string;
  locale: string;
  demo: boolean;
  heading: string;
}) {
  const t = locale === "ar" ? T.ar : T.en;
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState({ x: 0, y: 0 });
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [done, setDone] = useState(false);
  const [coming, setComing] = useState<"yes" | "no">("yes");

  useEffect(() => setHost(box.current?.closest<HTMLElement>("[data-kit]") ?? document.body), []);

  // While open: the page stays still, Escape closes, and the first field is ready to type in.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    const focus = window.setTimeout(() => card.current?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true }), 650);
    return () => {
      html.style.overflow = before;
      window.removeEventListener("keydown", key);
      clearTimeout(focus);
    };
  }, [open]);

  function show() {
    // the card starts small at the seal and grows to the middle of the screen
    const r = box.current?.querySelector("button")?.getBoundingClientRect();
    if (r) setFrom({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 });
    setOpen(true);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (linkUrl) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setDone(true);
  }

  const popup = open ? (
    <div className={s.popWrap} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className={s.popShade} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={s.popCard}
        style={{ "--fx": `${from.x}px`, "--fy": `${from.y}px` } as CSSProperties}
      >
        <button type="button" className={s.popClose} onClick={() => setOpen(false)} aria-label={t.close}>
          ×
        </button>
        <img src={`${ART}/corner.webp`} alt="" className={s.popFlower} width={728} height={900} aria-hidden="true" />
        <p id={`${id}-title`} className={s.popTitle}>{heading}</p>
        {deadline ? <p className={s.caps}>{deadline}</p> : null}
        {message ? <p className={s.replyMsg}>{message}</p> : null}
        {done ? (
          <div className={s.thanks} role="status">
            <p className={s.thanksTitle}>{t.thanks}</p>
            <p className={s.small}>{demo ? t.thanksNote : t.soon}</p>
          </div>
        ) : (
          <form className={s.form} onSubmit={submit}>
            <label className={s.field}>
              <span className={s.fieldLabel}>{t.name}</span>
              <input className={s.input} name="name" autoComplete="name" required maxLength={80} />
            </label>
            <fieldset className={s.choice}>
              <legend className={s.fieldLabel}>{t.coming}</legend>
              <div className={s.pills}>
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className={s.pill} data-on={coming === v || undefined}>
                    <input type="radio" name={`${id}-coming`} value={v} checked={coming === v} onChange={() => setComing(v)} />
                    {v === "yes" ? t.yes : t.no}
                  </label>
                ))}
              </div>
            </fieldset>
            {coming === "yes" ? (
              <label className={s.field}>
                <span className={s.fieldLabel}>{t.guests}</span>
                <select className={s.input} name="guests" defaultValue="1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className={s.field}>
              <span className={s.fieldLabel}>{t.note}</span>
              <textarea className={s.input} name="note" rows={2} maxLength={400} />
            </label>
            <button type="submit" className={s.button}>
              {linkUrl ? linkLabel || t.link : t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={box} className={s.replyBox} data-open={open || undefined}>
      <div className={s.envWrap}>
        <img src={`${ART}/envelope.webp`} alt="" className={s.envArt} width={1200} height={864} loading="lazy" aria-hidden="true" />
        <button type="button" className={s.sealBtn} onClick={show} aria-haspopup="dialog" aria-expanded={open} aria-label={openLabel}>
          <img src={`${ART}/seal.webp`} alt="" width={507} height={520} loading="lazy" />
        </button>
      </div>
      <p className={`${s.small} ${s.replyHint}`}>{hint}</p>
      {popup && host ? createPortal(popup, host) : null}
    </div>
  );
}
