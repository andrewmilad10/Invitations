"use client";
/* eslint-disable @next/next/no-img-element -- watercolour pieces */

import { useState } from "react";
import s from "./wisteria.module.css";

const ART = "/templates/wisteria-lake";

/**
 * The reply envelope. The wax seal is a button: tapped, the seal lifts away and
 * a cream reply card slides up out of the envelope with the couple's words and,
 * when they have one, their reply link.
 */
export function ReplyEnvelope({
  message,
  deadline,
  linkUrl,
  linkLabel,
  openLabel,
  hint,
}: {
  message: string;
  deadline: string;
  linkUrl: string;
  linkLabel: string;
  openLabel: string;
  hint: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.replyBox} data-open={open || undefined}>
      <div className={s.cardSlot}>
        <div className={s.slotInner}>
          <div className={s.replyCard} aria-hidden={!open} inert={!open}>
            {deadline ? <p className={s.caps}>{deadline}</p> : null}
            {message ? <p className={s.replyMsg}>{message}</p> : null}
            {linkUrl ? (
              <a className={s.button} href={linkUrl} target="_blank" rel="noopener noreferrer">
                {linkLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className={s.envWrap}>
        <img src={`${ART}/envelope.webp`} alt="" className={s.envArt} width={1200} height={864} loading="lazy" aria-hidden="true" />
        <button type="button" className={s.sealBtn} onClick={() => setOpen(true)} aria-expanded={open} aria-label={openLabel} disabled={open}>
          <img src={`${ART}/seal.webp`} alt="" width={507} height={520} loading="lazy" />
        </button>
      </div>
      <p className={`${s.small} ${s.replyHint}`}>{hint}</p>
    </div>
  );
}
