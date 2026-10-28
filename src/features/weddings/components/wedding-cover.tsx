import Image from "next/image";
import { buildInvitationModel } from "@/core/invitation/build-model";
import type { TemplateManifest } from "@/core/template/manifest";
import { SCREENS, screenSrc } from "@/features/marketing/home/screens";
import { ScaledScreen } from "@/features/marketing/home/scaled-screen";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

const FRAME =
  "relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-card shadow-[0_14px_30px_-18px_rgb(34_29_26/0.55)] transition-transform duration-500 hover:-translate-y-0.5";

/**
 * A website design's cover for the dashboard thumbnail. Designs that open with
 * an envelope show that envelope (the opening still) — what guests see first;
 * designs whose first screen is the page show that hero with the couple's own
 * names. Rendered in export mode (no opening overlay, no spinner).
 */
export function WeddingCover({
  template,
  partnerOne,
  partnerTwo,
  dateIso,
}: {
  template: TemplateManifest;
  partnerOne: string;
  partnerTwo: string;
  dateIso: string | null;
}) {
  // Opening designs: the envelope is the cover.
  if (template.features.opening !== "none" && SCREENS.has(template.id)) {
    return (
      <div className={FRAME}>
        <Image src={screenSrc(template.id, "opening")} alt="" fill sizes="(min-width: 640px) 140px, 100px" className="object-cover object-top" />
      </div>
    );
  }

  // Otherwise render the real first screen with the couple's names.
  const base = sampleBundle(template.id);
  base.wedding.partner_one_name = partnerOne;
  base.wedding.partner_two_name = partnerTwo;
  base.wedding.wedding_date = dateIso;
  const model = buildInvitationModel(base, template, { mode: "export", mediaUrl: sampleMediaUrl });
  const heroOnly = { ...model, sections: model.sections.filter((s) => s.type === "hero") };
  return (
    <div className={FRAME}>
      <ScaledScreen>
        <InvitationRenderer model={heroOnly} />
      </ScaledScreen>
    </div>
  );
}
