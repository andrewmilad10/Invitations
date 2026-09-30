import { InvitationRoot, Sections } from "../shared/invitation-root";
import { MusicToggle } from "../shared/music-toggle";
import type { TemplateRendererProps } from "../types";
import { cinematicSections } from "./sections";

/**
 * Cinematic template. The envelope opening and scroll motion are added in the
 * cinematic phase as a layer on top; the page underneath is complete and
 * readable without JavaScript.
 */
export default function CinematicRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model}>
      <main>
        <Sections model={model} components={cinematicSections} />
      </main>
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}
