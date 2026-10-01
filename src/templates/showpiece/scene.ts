import type { ComponentType, ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";

export type Phase = "closed" | "opening" | "leaving" | "done";

/**
 * One opening scene, drawn inside the shared overlay (which owns the phases,
 * scroll lock, replay and timing). Styles key off the overlay's
 * data-phase: "closed" until the guest taps, then "opening" and "leaving".
 */
export interface SceneProps {
  model: InvitationModel;
  phase: Phase;
  /** Starts the opening (the guest's tap). */
  open: () => void;
  /** The shared Skip button. */
  skip: ReactNode;
}

export interface SceneEntry {
  /** Class for the overlay itself (background, colour, perspective). */
  className: string;
  Scene: ComponentType<SceneProps>;
}

/** Picks the guest's language from a per-language table, English by default. */
export function copyFor<T>(model: InvitationModel, table: { en: T; ar: T }): T {
  return model.locale === "ar" ? table.ar : table.en;
}

/** A variant's hero artwork; `text` is the shared names / date / tagline block. */
export interface HeroArtProps {
  model: InvitationModel;
  text: ReactNode;
}

export interface EmblemProps {
  model: InvitationModel;
}
