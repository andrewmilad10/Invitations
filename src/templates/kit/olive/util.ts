import type { InvitationModel } from "@/core/invitation/model";

const first = (name: string) => Array.from(name.trim())[0] ?? "";

/** "S&Y" from the couple's names (Arabic uses و). */
export function initials(model: InvitationModel) {
  const { partnerOne, partnerTwo } = model.wedding;
  return `${first(partnerOne)}${model.locale === "ar" ? "و" : "&"}${first(partnerTwo)}`;
}
