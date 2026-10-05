"use client";

import { useEffect } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitEnvelope } from "../envelope";
import type { IntroPhase } from "../intro";
import { showerPetals } from "./petals";
import s from "./blue.module.css";

/** Petals drift down as the flap lifts. */
function PetalsOnOpen({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    if (phase === "opening") showerPetals(16, 0.6);
  }, [phase]);
  return null;
}

/**
 * Something Blue's opening: the shared envelope in white paper with paper
 * flowers pressed into it, sealed in powder-blue wax; petals drift down as it
 * opens and the wreath blooms in as it fades.
 */
export function BlueOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  return (
    <KitEnvelope
      model={model}
      className={s.intro}
      extra={(phase) => <PetalsOnOpen phase={phase} />}
      seal={
        <span className={s.envSeal}>
          <span className={s.ring} aria-hidden />
          <span className={s.mono} aria-hidden>
            {a}&amp;{b}
          </span>
        </span>
      }
    />
  );
}
