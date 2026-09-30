import type { ComponentType } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import type { SectionContent, SectionType } from "@/core/sections/registry";

/**
 * The presentation half of the template contract (the data half is
 * TemplateManifest in src/core/template/manifest.ts).
 *
 * Renderers must be isomorphic: they render on the server for public pages
 * and inside the client-side editor preview. Interactive pieces are small
 * "use client" islands.
 */
export interface TemplateRendererProps {
  model: InvitationModel;
}

export type TemplateRenderer = ComponentType<TemplateRendererProps>;

/** Props every section component receives. */
export interface SectionProps<T extends SectionType> {
  model: InvitationModel;
  content: SectionContent<T>;
}

/** A template's section components, one per supported section type. */
export type SectionComponents = { [T in SectionType]?: ComponentType<SectionProps<T>> };
