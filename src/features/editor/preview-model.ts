import { buildInvitationModel } from "@/core/invitation/build-model";
import type { InvitationModel } from "@/core/invitation/model";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { publicMediaUrl } from "@/features/media/urls";
import { resolveTemplateManifest } from "@/templates/registry";

/** Preview-mode model; used on the server (first render) and in the preview iframe. */
export function buildPreviewModel(bundle: WeddingBundle): InvitationModel {
  return buildInvitationModel(bundle, resolveTemplateManifest(bundle.wedding.template_id), {
    mode: "preview",
    mediaUrl: publicMediaUrl,
  });
}
