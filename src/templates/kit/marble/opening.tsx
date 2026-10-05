"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitEnvelope } from "../envelope";
import s from "./marble.module.css";

/** Rose Marble's opening: the shared envelope in blush, sealed in rose-gold wax, with a marbled foil liner inside. */
export function MarbleOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  return (
    <KitEnvelope
      model={model}
      className={s.intro}
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
