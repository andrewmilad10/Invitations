"use client";

import { useRef, type ReactNode } from "react";
import type { SectionContent } from "@/core/sections/registry";
import { useInvitationModel } from "./model-context";
import { ReplyForm } from "./reply-form";
import s from "./reply.module.css";

/**
 * A design's reply button. With the couple's own form link it opens that;
 * otherwise it opens the reply sheet (in the design's colours) and the answer
 * is saved to the couple's guest list.
 */
export function ReplyButton({ content, className, children }: { content: SectionContent<"rsvp">; className?: string; children?: ReactNode }) {
  const model = useInvitationModel();
  const dlg = useRef<HTMLDialogElement>(null);
  const ar = model?.locale === "ar";
  const label = children ?? (content.linkLabel || (ar ? "أكّدوا حضوركم" : "Reply here"));

  if (content.linkUrl) {
    return (
      <a className={className} href={content.linkUrl} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  if (!model || model.mode === "export") return null;
  return (
    <>
      <button type="button" className={className} onClick={() => dlg.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dlg} className={s.sheet} aria-label={content.heading || label?.toString()} onClick={(e) => e.target === dlg.current && dlg.current?.close()}>
        <div className={s.sheetIn} dir={model.dir} lang={model.locale}>
          <button type="button" className={s.close} aria-label={ar ? "إغلاق" : "Close"} onClick={() => dlg.current?.close()}>
            ✕
          </button>
          {content.heading ? <p className={s.sheetTitle}>{content.heading}</p> : null}
          <p className={s.sheetBy}>{content.deadline || "\u00a0"}</p>
          <ReplyForm model={model} content={content} />
        </div>
      </dialog>
    </>
  );
}
