"use client";

import { useId, useState, type FormEvent } from "react";
import s from "./butter.module.css";

const T = {
  en: { name: "Your name", coming: "Will you join us?", yes: "Joyfully accepts", no: "Regretfully declines", guests: "Number of guests", note: "A note for the couple", send: "Send reply", link: "Reply online", thanks: "Thank you!", thanksNote: "This is how your guests will reply. Online replies are not open yet, so nothing was sent.", soon: "Online replies will open soon. Thank you!" },
  ar: { name: "اسمكم", coming: "هل ستشاركوننا؟", yes: "بكل سرور", no: "نعتذر بأسف", guests: "عدد الضيوف", note: "كلمة للعروسين", send: "إرسال الرد", link: "الرد عبر الإنترنت", thanks: "شكرًا لكم!", thanksNote: "هكذا سيرد ضيوفكم. الرد عبر الإنترنت لم يُفتح بعد، لذلك لم يُرسل شيء.", soon: "سيُفتح الرد عبر الإنترنت قريبًا. شكرًا لكم!" },
};

/**
 * The reply form written on the card above the lace envelope (name, yes or no,
 * guests, a note). Replies are not collected by Vellum yet, so nothing typed
 * here is sent or kept: the couple's own reply link opens when they have one;
 * otherwise the demo thanks the guest and says nothing was sent, and a real
 * invitation says online replies open soon.
 */
export function ReplyForm({ locale, linkUrl, linkLabel, demo }: { locale: string; linkUrl: string; linkLabel: string; demo: boolean }) {
  const t = locale === "ar" ? T.ar : T.en;
  const id = useId();
  const [done, setDone] = useState(false);
  const [coming, setComing] = useState<"yes" | "no">("yes");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (linkUrl) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className={s.thanks} role="status">
        <p className={s.thanksTitle}>{t.thanks}</p>
        <p className={s.small}>{demo ? t.thanksNote : t.soon}</p>
      </div>
    );
  }
  return (
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
  );
}
