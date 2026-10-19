"use client";

import { useId, useState, type FormEvent } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { replyErrorText } from "@/core/replies/schema";
import type { SectionContent } from "@/core/sections/registry";
import { useReplyActions } from "./context";
import s from "./reply.module.css";

const T = {
  en: {
    dear: "Dear",
    name: "Your name",
    namePh: "As on the invitation",
    coming: "Will you join us?",
    yes: "Joyfully coming",
    no: "Can't make it",
    how: (n: number) => `How many of you${n > 1 ? ` (up to ${n})` : ""}`,
    fewer: "Fewer",
    more: "More",
    yesA: "Yes",
    noA: "No",
    note: "A note for the couple",
    optional: "Optional",
    send: "Send reply",
    sending: "Sending…",
    change: "You can change your reply later from this link.",
    thanksYes: (n: number) => (n === 1 ? "Thank you! We've saved your place." : `Thank you! We've saved ${n} places for you.`),
    thanksNo: "Thank you for letting us know. You'll be missed.",
    saved: "Your reply is saved.",
    demo: "This is a preview, so nothing was saved. Once the invitation is published, replies go straight to your guest list.",
    again: "Change my reply",
    yours: "Your reply",
  },
  ar: {
    dear: "عزيزنا",
    name: "اسمكم",
    namePh: "كما في الدعوة",
    coming: "هل ستشاركوننا؟",
    yes: "بكل سرور",
    no: "نعتذر",
    how: (n: number) => `عدد الحضور${n > 1 ? ` (حتى ${n})` : ""}`,
    fewer: "أقل",
    more: "أكثر",
    yesA: "نعم",
    noA: "لا",
    note: "كلمة للعروسين",
    optional: "اختياري",
    send: "إرسال الرد",
    sending: "جارٍ الإرسال…",
    change: "يمكنكم تغيير ردّكم لاحقًا من هذا الرابط.",
    thanksYes: (n: number) => (n === 1 ? "شكرًا لكم! حجزنا مكانكم." : `شكرًا لكم! حجزنا ${n} أماكن لكم.`),
    thanksNo: "شكرًا لإخبارنا. سنفتقدكم.",
    saved: "تم حفظ ردّكم.",
    demo: "هذه معاينة، لذلك لم يُحفظ شيء. بعد نشر الدعوة تصل الردود مباشرة إلى قائمة ضيوفكم.",
    again: "تغيير ردّي",
    yours: "ردّكم",
  },
};

/**
 * The reply, shared by every design: coming or not, how many (up to the
 * invitation's limit, or this guest's own), the couple's questions and a note.
 * From a personal link the guest's name is already there and their earlier
 * answer is shown. Saved through the page's actions; a preview saves nothing.
 */
export function ReplyForm({ model, content, onDone }: { model: InvitationModel; content: SectionContent<"rsvp">; onDone?: () => void }) {
  const ar = model.locale === "ar";
  const t = ar ? T.ar : T.en;
  const id = useId();
  const actions = useReplyActions();
  const live = model.mode === "live" && actions;
  const guest = model.guest;
  const max = Math.max(1, Math.min(20, guest?.maxParty ?? content.maxGuests ?? 6));
  const prev = guest?.reply ?? null;

  const [name, setName] = useState("");
  const [attending, setAttending] = useState(prev ? prev.attending : true);
  const [people, setPeople] = useState(Math.min(max, Math.max(1, prev?.partySize || Math.min(2, max))));
  const [note, setNote] = useState(prev?.note ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>(prev?.answers ?? {});
  const [state, setState] = useState<"form" | "sending" | "done">(prev ? "done" : "form");
  const [saved, setSaved] = useState<{ attending: boolean; people: number; demo: boolean }>({ attending: prev?.attending ?? true, people: prev?.partySize ?? 0, demo: false });
  const [error, setError] = useState("");
  const questions = (content.questions ?? []).filter((q) => q.text.trim());

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!guest && !name.trim()) {
      setError(replyErrorText("name", ar));
      return;
    }
    const n = attending ? people : 0;
    if (!live) {
      setSaved({ attending, people: n, demo: true });
      setState("done");
      onDone?.();
      return;
    }
    setState("sending");
    const res = await actions.submitReply({
      slug: model.wedding.slug,
      token: guest?.token ?? null,
      name: guest ? guest.name : name,
      attending,
      partySize: n,
      note,
      answers: Object.fromEntries(Object.entries(answers).filter(([k, v]) => v && questions.some((q) => q.id === k))),
    });
    if (res.ok) {
      setSaved({ attending, people: res.partySize, demo: false });
      setState("done");
      onDone?.();
    } else {
      setError(replyErrorText(res.error, ar));
      setState("form");
    }
  }

  if (state === "done") {
    return (
      <div className={s.done} role="status">
        <span className={s.tick} aria-hidden>
          ✓
        </span>
        {guest ? <p className={s.small}>{guest.name}</p> : null}
        <p className={s.doneTitle}>{saved.attending ? t.thanksYes(Math.max(1, saved.people)) : t.thanksNo}</p>
        <p className={s.small}>{saved.demo ? t.demo : t.saved}</p>
        <button type="button" className={s.ghost} onClick={() => setState("form")}>
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      {guest ? (
        <div className={s.hello}>
          <small>{guest.greeting || t.dear}</small>
          <b>{guest.name}</b>
          {guest.message ? <p>{guest.message}</p> : null}
        </div>
      ) : (
        <label className={s.field}>
          <span className={s.label}>{t.name}</span>
          <input className={s.input} id={`${id}-name`} value={name} maxLength={120} autoComplete="name" placeholder={t.namePh} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}

      <fieldset className={s.field} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className={s.label}>{t.coming}</legend>
        <div className={s.choice}>
          <button type="button" className={s.opt} aria-pressed={attending} onClick={() => setAttending(true)}>
            {t.yes}
          </button>
          <button type="button" className={s.opt} aria-pressed={!attending} onClick={() => setAttending(false)}>
            {t.no}
          </button>
        </div>
      </fieldset>

      {attending && max > 1 ? (
        <div className={s.field}>
          <span className={s.label} id={`${id}-n`}>
            {t.how(max)}
          </span>
          <div className={s.step} role="group" aria-labelledby={`${id}-n`}>
            <button type="button" aria-label={t.fewer} disabled={people <= 1} onClick={() => setPeople((p) => Math.max(1, p - 1))}>
              −
            </button>
            <output aria-live="polite">{people}</output>
            <button type="button" aria-label={t.more} disabled={people >= max} onClick={() => setPeople((p) => Math.min(max, p + 1))}>
              +
            </button>
          </div>
        </div>
      ) : null}

      {attending
        ? questions.map((q) =>
            q.kind === "yesno" ? (
              <fieldset key={q.id} className={s.field} style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={s.label}>{q.text}</legend>
                <div className={s.choice}>
                  {[t.yesA, t.noA].map((v) => (
                    <button key={v} type="button" className={s.opt} aria-pressed={answers[q.id] === v} onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}>
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <label key={q.id} className={s.field}>
                <span className={s.label}>{q.text}</span>
                <input className={s.input} value={answers[q.id] ?? ""} maxLength={300} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
              </label>
            ),
          )
        : null}

      <label className={s.field}>
        <span className={s.label}>{t.note}</span>
        <textarea className={s.input} rows={2} maxLength={500} placeholder={t.optional} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {error ? (
        <p className={s.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={s.send} disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.send}
      </button>
      {guest ? <p className={s.small}>{t.change}</p> : null}
    </form>
  );
}
