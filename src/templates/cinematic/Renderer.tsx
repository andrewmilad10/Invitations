import { InvitationRoot, Sections } from "../shared/invitation-root";
import { MusicToggle } from "../shared/music-toggle";
import type { TemplateRendererProps } from "../types";
import { CinematicMotion } from "./motion";
import { EnvelopeOpening } from "./opening/envelope-opening";
import { cinematicSections } from "./sections";

/**
 * Cinematic template: the full invitation page renders underneath (readable
 * without JavaScript); the envelope opening is an overlay on top, and scroll
 * motion is layered on after it opens.
 */
export default function CinematicRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model}>
      <main>
        <Sections model={model} components={cinematicSections} />
      </main>
      {model.mode !== "export" && model.template.opening === "envelope" ? <EnvelopeOpening model={model} /> : null}
      <CinematicMotion model={model} />
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}
