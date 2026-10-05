"use client";

import { useEffect } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { showerPetals } from "../blue/petals";
import { KitEnvelope } from "../envelope";
import type { IntroPhase } from "../intro";
import s from "./rosa.module.css";

const ROSE_PETALS = ["rgb(244 205 205)", "rgb(236 182 186)", "rgb(250 226 222)", "rgb(226 160 168)", "rgb(252 240 232)"];

function PetalsOnOpen({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    if (phase === "opening") showerPetals(18, 0.7, ROSE_PETALS);
  }, [phase]);
  return null;
}

/** Villa Rosa's opening: the shared envelope in blush paper with a die-cut lace flap and a rose-gold seal; petals fall as it opens. */
export function RosaOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  return (
    <KitEnvelope
      model={model}
      className={s.intro}
      extra={(phase) => <PetalsOnOpen phase={phase} />}
      seal={
        <span className={s.envSeal}>
          <span className={s.envMono} aria-hidden>
            {a}&amp;{b}
          </span>
        </span>
      }
    />
  );
}
