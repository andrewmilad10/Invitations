"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ReplyInput, ReplyResult, WishInput, WishResult } from "@/core/replies/schema";

/**
 * How the invitation saves what guests send. The live page provides the real
 * server actions; everywhere else (editor preview, samples, design pages) there
 * is none, so the forms show what would happen and save nothing.
 */
export interface ReplyActions {
  submitReply: (input: ReplyInput) => Promise<ReplyResult>;
  submitWish: (input: WishInput) => Promise<WishResult>;
}

const Ctx = createContext<ReplyActions | null>(null);
export const useReplyActions = () => useContext(Ctx);

export function ReplyActionsProvider({ children, ...actions }: ReplyActions & { children: ReactNode }) {
  return <Ctx.Provider value={actions}>{children}</Ctx.Provider>;
}
