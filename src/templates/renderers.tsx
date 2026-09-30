import type { InvitationModel } from "@/core/invitation/model";
import CinematicRenderer from "./cinematic/Renderer";
import EditorialRenderer from "./editorial/Renderer";
import { DEFAULT_TEMPLATE_ID } from "./registry";
import type { TemplateRenderer } from "./types";

/** Template id → renderer. Keep in sync with TEMPLATE_MANIFESTS (a test enforces it). */
export const TEMPLATE_RENDERERS: Record<string, TemplateRenderer> = {
  cinematic: CinematicRenderer,
  editorial: EditorialRenderer,
};

/** Renders a model with the renderer of the template it was built for. */
export function InvitationRenderer({ model }: { model: InvitationModel }) {
  const Renderer = TEMPLATE_RENDERERS[model.templateId] ?? TEMPLATE_RENDERERS[DEFAULT_TEMPLATE_ID];
  return <Renderer model={model} />;
}
