"use client";
/* eslint-disable @next/next/no-img-element -- watercolour pieces */

import type { InvitationModel } from "@/core/invitation/model";
import type { SectionContent } from "@/core/sections/registry";
import { ReplyButton } from "../../shared/reply/reply-button";
import { ReplyForm } from "../../shared/reply/reply-form";
import s from "./wisteria.module.css";

const ART = "/templates/wisteria-lake";

/**
 * The reply card on the page: cream paper with a wisteria sprig, the reply date,
 * the couple's words and the shared reply form (saved to the couple's guest
 * list). With the couple's own form link, a button opens it instead.
 */
export function ReplyCard({ model, content, heading }: { model: InvitationModel; content: SectionContent<"rsvp">; heading: string }) {
  return (
    <div className={s.replyCardBox}>
      <div className={s.popCard} aria-label={heading} role="group">
        <img src={`${ART}/corner.webp`} alt="" className={s.popFlower} width={728} height={900} aria-hidden="true" />
        {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
        {content.message ? <p className={s.replyMsg}>{content.message}</p> : null}
        {content.linkUrl ? <ReplyButton content={content} className={s.button} /> : <ReplyForm model={model} content={content} />}
      </div>
    </div>
  );
}
