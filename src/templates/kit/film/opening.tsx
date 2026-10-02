"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro } from "../intro";
import s from "./film.module.css";

/**
 * Film Story's opening: a projector leader counts down 3 · 2 · 1 with a
 * sweeping hand, flickers and cuts to the film. It plays by itself; guests
 * can skip.
 */
export function FilmOpening({ model }: { model: InvitationModel }) {
  return (
    <KitIntro model={model} className={s.intro} timing={[3200, 600]} auto={300} label={model.wedding.coupleName}>
      {({ skip }) => (
        <>
          <div className={s.leader} aria-hidden>
            <span className={s.cross} />
            <span className={s.sweep} />
            <span className={s.ring} />
            <span className={s.count}>
              <b>3</b>
              <b>2</b>
              <b>1</b>
            </span>
          </div>
          <span className={s.flicker} aria-hidden />
          {skip}
        </>
      )}
    </KitIntro>
  );
}
