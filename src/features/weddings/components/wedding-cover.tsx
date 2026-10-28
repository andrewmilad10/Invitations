import { buildInvitationModel } from "@/core/invitation/build-model";
import type { TemplateManifest } from "@/core/template/manifest";
import { ScaledScreen } from "@/features/marketing/home/scaled-screen";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

/**
 * A website design's real first screen (its hero), with the couple's own names
 * and date — the actual cover, scaled into the dashboard thumbnail. Rendered in
 * export mode, so there is no opening overlay and no spinner. Used instead of
 * the stationery card for website templates.
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
  const base = sampleBundle(template.id);
  base.wedding.partner_one_name = partnerOne;
  base.wedding.partner_two_name = partnerTwo;
  base.wedding.wedding_date = dateIso;
  const model = buildInvitationModel(base, template, { mode: "export", mediaUrl: sampleMediaUrl });
  const heroOnly = { ...model, sections: model.sections.filter((s) => s.type === "hero") };
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-card shadow-[0_14px_30px_-18px_rgb(34_29_26/0.55)] transition-transform duration-500 hover:-translate-y-0.5">
      <ScaledScreen>
        <InvitationRenderer model={heroOnly} />
      </ScaledScreen>
    </div>
  );
}
