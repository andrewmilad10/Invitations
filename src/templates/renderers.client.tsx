"use client";

import dynamic from "next/dynamic";
import type { InvitationModel } from "@/core/invitation/model";
import { DEFAULT_TEMPLATE_ID } from "./registry";
import type { TemplateRenderer } from "./types";

/*
 * The renderer map for client components (the editor's live preview, the
 * try-flow frame). Each layout is its own chunk, so a preview downloads only
 * the layout it shows; server pages use ./renderers.tsx directly.
 * A test checks this map covers the same layout keys as the server map.
 */
const Atelier = dynamic(() => import("./atelier/Renderer"));
const Cinematic = dynamic(() => import("./cinematic/Renderer"));
const Editorial = dynamic(() => import("./editorial/Renderer"));
const Essentials = dynamic(() => import("./essentials/Renderer"));
const Galerie = dynamic(() => import("./galerie/Renderer"));
const Romance = dynamic(() => import("./kit/romance/Renderer"));
const Heritage = dynamic(() => import("./kit/heritage/Renderer"));
const Minimal = dynamic(() => import("./kit/minimal/Renderer"));
const Limone = dynamic(() => import("./kit/limone/Renderer"));
const Maison = dynamic(() => import("./maison/Renderer"));
const Postale = dynamic(() => import("./postale/Renderer"));
const Showpiece = dynamic(() => import("./showpiece/Renderer"));

export const CLIENT_RENDERERS: Record<string, TemplateRenderer> = {
  cinematic: Cinematic,
  editorial: Editorial,
  atelier: Atelier,
  maison: Maison,
  galerie: Galerie,
  postale: Postale,
  gate: Showpiece,
  nile: Showpiece,
  herbarium: Showpiece,
  toast: Showpiece,
  stars: Showpiece,
  popup: Showpiece,
  glass: Showpiece,
  keepsake: Showpiece,
  giza: Showpiece,
  baron: Showpiece,
  montaza: Showpiece,
  luxor: Showpiece,
  linen: Essentials,
  monogram: Essentials,
  split: Essentials,
  modern: Essentials,
  romance: Romance,
  heritage: Heritage,
  minimal: Minimal,
  limone: Limone,
};

export function ClientInvitationRenderer({ model }: { model: InvitationModel }) {
  const Renderer = CLIENT_RENDERERS[model.template.renderer] ?? CLIENT_RENDERERS[DEFAULT_TEMPLATE_ID];
  return <Renderer model={model} />;
}
