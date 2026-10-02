import type { InvitationModel } from "@/core/invitation/model";
import AtelierRenderer from "./atelier/Renderer";
import CinematicRenderer from "./cinematic/Renderer";
import EditorialRenderer from "./editorial/Renderer";
import EssentialsRenderer from "./essentials/Renderer";
import GalerieRenderer from "./galerie/Renderer";
import ArchRenderer from "./kit/arch/Renderer";
import BlackTieRenderer from "./kit/blacktie/Renderer";
import EphemeraRenderer from "./kit/ephemera/Renderer";
import FilmRenderer from "./kit/film/Renderer";
import GlasshouseRenderer from "./kit/glasshouse/Renderer";
import GlossyRenderer from "./kit/glossy/Renderer";
import HeritageRenderer from "./kit/heritage/Renderer";
import HouseRenderer from "./kit/house/Renderer";
import JardinRenderer from "./kit/jardin/Renderer";
import LimoneRenderer from "./kit/limone/Renderer";
import MinimalRenderer from "./kit/minimal/Renderer";
import RomanceRenderer from "./kit/romance/Renderer";
import MaisonRenderer from "./maison/Renderer";
import PostaleRenderer from "./postale/Renderer";
import ShowpieceRenderer from "./showpiece/Renderer";
import { DEFAULT_TEMPLATE_ID } from "./registry";
import type { TemplateRenderer } from "./types";

/** Layout key (manifest.renderer) → renderer. A test checks every manifest's renderer exists. */
export const TEMPLATE_RENDERERS: Record<string, TemplateRenderer> = {
  cinematic: CinematicRenderer,
  editorial: EditorialRenderer,
  atelier: AtelierRenderer,
  maison: MaisonRenderer,
  galerie: GalerieRenderer,
  postale: PostaleRenderer,
  gate: ShowpieceRenderer,
  nile: ShowpieceRenderer,
  herbarium: ShowpieceRenderer,
  toast: ShowpieceRenderer,
  stars: ShowpieceRenderer,
  popup: ShowpieceRenderer,
  glass: ShowpieceRenderer,
  keepsake: ShowpieceRenderer,
  giza: ShowpieceRenderer,
  baron: ShowpieceRenderer,
  montaza: ShowpieceRenderer,
  luxor: ShowpieceRenderer,
  linen: EssentialsRenderer,
  monogram: EssentialsRenderer,
  split: EssentialsRenderer,
  modern: EssentialsRenderer,
  romance: RomanceRenderer,
  heritage: HeritageRenderer,
  minimal: MinimalRenderer,
  limone: LimoneRenderer,
  blacktie: BlackTieRenderer,
  jardin: JardinRenderer,
  glossy: GlossyRenderer,
  ephemera: EphemeraRenderer,
  arch: ArchRenderer,
  film: FilmRenderer,
  glasshouse: GlasshouseRenderer,
  house: HouseRenderer,
};

/** Renders a model with the layout of the template it was built for. */
export function InvitationRenderer({ model }: { model: InvitationModel }) {
  const Renderer = TEMPLATE_RENDERERS[model.template.renderer] ?? TEMPLATE_RENDERERS[DEFAULT_TEMPLATE_ID];
  return <Renderer model={model} />;
}
