"use client";

import { cn } from "@/lib/utils";
import { Caravan, Colonnade, Dunes, Montaza, Palace, Palm, Pyramids, venueLine, Waves } from "./landmarks";
import l from "./landmarks.module.css";
import { copyFor, type SceneEntry, type SceneProps } from "./scene";
import type { Variant } from "./variants";

/**
 * Openings of the Egypt venue Showpieces. Each scene sits in the shared
 * overlay and reacts to its data-phase (see ./scene.ts).
 */

const COPY = {
  en: {
    giza: "Under the pyramids of Giza", sunrise: "Watch the sun rise",
    baron: "An evening at the Baron Palace", light: "Light up the palace",
    montaza: "By the sea in Alexandria", tide: "Let the waves in",
    luxor: "At Luxor Temple", enter: "Step inside",
  },
  ar: {
    giza: "تحت أهرامات الجيزة", sunrise: "شاهدوا شروق الشمس",
    baron: "أمسية في قصر البارون", light: "أضيئوا القصر",
    montaza: "على شاطئ الإسكندرية", tide: "دعوا الأمواج تأتي",
    luxor: "في معبد الأقصر", enter: "ادخلوا المعبد",
  },
};

function Names({ model, className }: { model: SceneProps["model"]; className?: string }) {
  return <p className={cn(l.openNames, className)}>{model.wedding.partnerOne} &amp; {model.wedding.partnerTwo}</p>;
}

function GizaScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  return (
    <>
      <span aria-hidden className={l.gizaDawn} />
      <span aria-hidden className={l.nightStars} />
      <span aria-hidden className={l.risingSun} />
      <Pyramids className={l.openPyramids} litClass={l.dawnLit} />
      <Dunes className={cn(l.dunes, l.duneBack, l.openDune)} />
      <div aria-hidden className={l.openCaravan}><Caravan className={l.caravan} /></div>
      <div className={l.openTop}>
        <p className={l.openKicker}>{venueLine(model, t.giza)}</p>
        <Names model={model} />
        <button type="button" className={l.openBtn} onClick={open}>{t.sunrise}</button>
      </div>
      {skip}
    </>
  );
}

function BaronScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  return (
    <>
      <span aria-hidden className={l.burst} />
      <div className={l.openTop}>
        <p className={l.openKicker}>{venueLine(model, t.baron)}</p>
        <Names model={model} />
        <button type="button" className={l.openBtn} onClick={open}>{t.light}</button>
      </div>
      <button type="button" className={l.palaceBtn} onClick={open} aria-label={t.light}>
        <Palace className={l.openPalace} lineClass={l.drawLine} winClass={l.dark} />
      </button>
      <Palm className={cn(l.palm, l.palmL, l.openPalm)} />
      <Palm className={cn(l.palm, l.palmR, l.openPalm)} flip />
      {skip}
    </>
  );
}

function MontazaScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  return (
    <>
      <span aria-hidden className={l.seaSun} />
      <Montaza className={l.openMontaza} />
      <div aria-hidden className={l.sea}>
        <Waves className={cn(l.wave, l.w1)} />
        <Waves className={cn(l.wave, l.w2)} />
        <Waves className={cn(l.wave, l.w3)} />
      </div>
      <div className={l.openTop}>
        <p className={l.openKicker}>{venueLine(model, t.montaza)}</p>
        <Names model={model} />
        <button type="button" className={l.openBtn} onClick={open}>{t.tide}</button>
      </div>
      <div aria-hidden className={l.tide}>
        <Waves className={l.tideCrest} />
        <span className={l.tideBody} />
      </div>
      {skip}
    </>
  );
}

function LuxorScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  return (
    <>
      <div aria-hidden className={l.templeNight} />
      <Colonnade className={l.openColonnade} aisleClass={l.dolly} />
      <span aria-hidden className={l.doorLight} />
      <div className={cn(l.openTop, l.luxorTop)}>
        <p className={l.openKicker}>{venueLine(model, t.luxor)}</p>
        <Names model={model} />
        <button type="button" className={l.openBtn} onClick={open}>{t.enter}</button>
      </div>
      {skip}
    </>
  );
}

export const LANDMARK_SCENES: Partial<Record<Variant, SceneEntry>> = {
  giza: { className: l.gizaOpen, Scene: GizaScene },
  baron: { className: l.baronOpen, Scene: BaronScene },
  montaza: { className: l.montazaOpen, Scene: MontazaScene },
  luxor: { className: l.luxorOpen, Scene: LuxorScene },
};
