"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitEnvelope } from "../envelope";
import s from "./swan.module.css";

/** Swan Lake's opening: the shared envelope in stitched linen, the embroidered wreath on the flap and the pearl seal. */
export function SwanOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  return (
    <KitEnvelope
      model={model}
      className={s.intro}
      flapArt={<span className={s.flapArt} />}
      seal={
        <span className={s.envSeal}>
          <span className={s.mono} aria-hidden>
            {a}
            <small>&amp;</small>
            {b}
          </span>
        </span>
      }
    />
  );
}
