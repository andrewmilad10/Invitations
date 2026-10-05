"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitEnvelope } from "../envelope";
import s from "./cotton.module.css";

/** Cotton Press's opening: the shared envelope in charcoal cotton, sealed in gold wax, with a gold foil liner inside. */
export function CottonOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  return (
    <KitEnvelope
      model={model}
      className={s.intro}
      seal={
        <span className={s.envSeal}>
          <span className={s.ring} aria-hidden />
          <span className={s.mono} aria-hidden>
            {a}
            <i>&amp;</i>
            {b}
          </span>
        </span>
      }
    />
  );
}
