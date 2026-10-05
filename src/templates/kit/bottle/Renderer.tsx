import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { kitCopy } from "../data";
import { fx, KitRoot, Sec } from "../pieces";
import { Anchor, WashingLine } from "../voyage/art";
import { voyageSections } from "../voyage/Renderer";
import v from "../voyage/voyage.module.css";
import { HoldSeal } from "./hold";
import { BottleScene } from "./scene";
import b from "./bottle.module.css";

/**
 * Message in a Bottle — a live 3D invitation. For live and sample visits a
 * three.js scene runs behind the page (see stage.ts): a glass bottle drifts
 * in on a real-time ocean; one tap and the cork pops, the letter slides out
 * and unrolls with the couple's names on it; as the guest scrolls the letter
 * rides away and the sun sets behind the cards, with stars by the end.
 * The cards are Set Sail's (ivory paper, the painted chart, the ship's log),
 * the reply is a wax seal to press and hold.
 * Without the scene (editor, exports, reduced motion, no WebGL) the hero is
 * the same letter, still, on the painted sea.
 */

const T = {
  en: { begins: "Our adventure begins", aboard: "Press and hold the seal to count yourself aboard", done: "You're aboard, see you on the shore", label: "Press and hold to reply", shore: "See you on the shore", essentials: "Travel essentials", pack: "Pack light, bring your dancing shoes", flick: "Give them a flick" },
  ar: { begins: "تبدأ مغامرتنا", aboard: "اضغطوا مطوّلاً على الختم لتأكيد حضوركم", done: "أنتم معنا، نراكم على الشاطئ", label: "اضغطوا مطوّلاً للرد", shore: "نراكم على الشاطئ", essentials: "لوازم الرحلة", pack: "خفّفوا الحقائب ولا تنسوا أحذية الرقص", flick: "حرّكوها بإصبعكم" },
};
const tr = (model: InvitationModel) => (model.locale === "ar" ? T.ar : T.en);

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || [place?.venueName, place?.address].filter(Boolean).join(", ");
  return (
    <header id="hero" data-section="hero" className={b.hero}>
      <div className={b.letter}>
        <p className={v.caps}>{content.eyebrow || kitCopy(model).together}</p>
        <p className={b.lead}>{tr(model).begins}</p>
        <h1 className={b.names}>
          <span>{wedding.partnerOne}</span>
          <span className={b.amp}>{model.locale === "ar" ? "و" : "&"}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <span className={b.rule} aria-hidden>
          <Anchor className={b.ruleIcon} />
        </span>
        {wedding.date || where ? (
          <p className={b.when}>
            {wedding.date?.long}
            {wedding.date && where ? <br /> : null}
            {where}
          </p>
        ) : null}
      </div>
    </header>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={v.sec}>
      <div className={v.card} {...fx("rise")}>
        <h2 className={v.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={cn(v.caps, v.gap)}>{content.deadline}</p> : null}
        {content.message ? <p className={v.body}>{content.message}</p> : null}
        <HoldSeal href={content.linkUrl || null} label={content.linkLabel || tr(model).label} hint={tr(model).aboard} done={tr(model).done} />
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={v.sec}>
      <div className={cn(v.card, v.essentials)} {...fx("rise")}>
        <h2 className={v.h2}>{tr(model).essentials}</h2>
        <p className={cn(v.caps, v.gap)}>{tr(model).pack}</p>
        <div className={b.flickable}>
          <WashingLine />
        </div>
        <p className={b.small}>{tr(model).flick}</p>
      </div>
      <div className={b.closing} {...fx("fade")}>
        <p className={b.shore}>{content.heading || tr(model).shore}</p>
        {content.message ? <p className={b.closingMsg}>{content.message}</p> : null}
        <p className={b.capsLight}>{content.signature || model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={b.footer}>
      {[model.wedding.coupleName, model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}
    </footer>
  );
}

const sections: SectionComponents = { ...voyageSections, hero: Hero, rsvp: Rsvp, closing: Closing, footer: Footer };

export default function BottleRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="bottle" className={cn(v.root, b.root)} after={model.mode === "export" ? null : <BottleScene model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}
