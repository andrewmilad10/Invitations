"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";

const Ctx = createContext<InvitationModel | null>(null);

/** The invitation being shown, for shared pieces placed deep inside a design (the reply button). */
export function InvitationModelProvider({ model, children }: { model: InvitationModel; children: ReactNode }) {
  return <Ctx.Provider value={model}>{children}</Ctx.Provider>;
}
export const useInvitationModel = () => useContext(Ctx);
