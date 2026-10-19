"use client";

import type { InvitationModel } from "@/core/invitation/model";
import type { SectionContent } from "@/core/sections/registry";
import { ReplyButton } from "../../shared/reply/reply-button";
import { ReplyForm as SharedReplyForm } from "../../shared/reply/reply-form";
import s from "./lace.module.css";

/**
 * The reply written on the page: the shared reply (coming or not, how many,
 * the couple's questions, a note), saved to the couple's guest list, in this
 * design's colours. With the couple's own form link, a button opens it instead.
 */
export function ReplyForm({ model, content }: { model: InvitationModel; content: SectionContent<"rsvp"> }) {
  if (content.linkUrl) return <ReplyButton content={content} className={s.button} />;
  return <SharedReplyForm model={model} content={content} />;
}
