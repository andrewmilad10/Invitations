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
const BlackTie = dynamic(() => import("./kit/blacktie/Renderer"));
const Jardin = dynamic(() => import("./kit/jardin/Renderer"));
const Glossy = dynamic(() => import("./kit/glossy/Renderer"));
const Ephemera = dynamic(() => import("./kit/ephemera/Renderer"));
const Arch = dynamic(() => import("./kit/arch/Renderer"));
const Film = dynamic(() => import("./kit/film/Renderer"));
const Glasshouse = dynamic(() => import("./kit/glasshouse/Renderer"));
const House = dynamic(() => import("./kit/house/Renderer"));
const Swan = dynamic(() => import("./kit/swan/Renderer"));
const Cotton = dynamic(() => import("./kit/cotton/Renderer"));
const Marble = dynamic(() => import("./kit/marble/Renderer"));
const Blue = dynamic(() => import("./kit/blue/Renderer"));
const Voyage = dynamic(() => import("./kit/voyage/Renderer"));
const Rosa = dynamic(() => import("./kit/rosa/Renderer"));
const Pond = dynamic(() => import("./kit/pond/Renderer"));
const Burgundy = dynamic(() => import("./kit/burgundy/Renderer"));
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
  blacktie: BlackTie,
  jardin: Jardin,
  glossy: Glossy,
  ephemera: Ephemera,
  arch: Arch,
  film: Film,
  glasshouse: Glasshouse,
  house: House,
  swan: Swan,
  cotton: Cotton,
  marble: Marble,
  blue: Blue,
  voyage: Voyage,
  rosa: Rosa,
  pond: Pond,
  burgundy: Burgundy,
};

export function ClientInvitationRenderer({ model }: { model: InvitationModel }) {
  const Renderer = CLIENT_RENDERERS[model.template.renderer] ?? CLIENT_RENDERERS[DEFAULT_TEMPLATE_ID];
  return <Renderer model={model} />;
}
