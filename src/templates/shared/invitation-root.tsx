import type { CSSProperties, ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import type { SectionComponents } from "../types";

/**
 * Root element of every invitation: applies the theme's CSS variables,
 * language and direction. Everything inside styles itself from --inv-*.
 */
export function InvitationRoot({
  model,
  className,
  children,
}: {
  model: InvitationModel;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      lang={model.locale}
      dir={model.dir}
      data-template={model.templateId}
      data-decor={model.template.decor}
      data-mode={model.mode}
      style={model.cssVars as CSSProperties}
      className={cn("group/inv min-h-dvh bg-inv-bg font-inv-body text-inv-fg antialiased", className)}
    >
      {children}
    </div>
  );
}

/** Renders the model's sections (already ordered and filtered) with a template's components. */
export function Sections({ model, components }: { model: InvitationModel; components: SectionComponents }) {
  return (
    <>
      {model.sections.map((section) => {
        const Component = components[section.type] as
          | React.ComponentType<{ model: InvitationModel; content: typeof section.content }>
          | undefined;
        if (!Component) return null;
        // Style hints travel on a layout-neutral wrapper: tone re-maps the
        // theme variables; spacing/align are read by the template's own
        // section components (group-data-*/sec) and shared CSS.
        return (
          <div
            key={section.type}
            className="group/sec contents"
            data-tone={section.style.tone}
            data-spacing={section.style.spacing}
            data-align={section.style.align}
            style={section.toneVars as React.CSSProperties}
          >
            <Component model={model} content={section.content} />
          </div>
        );
      })}
    </>
  );
}

/** Splits text on blank lines into paragraphs (content is plain text, never HTML). */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={cn("whitespace-pre-line", className)}>
          {p}
        </p>
      ))}
    </>
  );
}
