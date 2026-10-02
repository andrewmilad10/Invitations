import type { ReactNode } from "react";
import type { EventModel, InvitationModel, MediaAsset } from "@/core/invitation/model";
import type { SectionContent } from "@/core/sections/registry";
import { cn } from "@/lib/utils";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import k from "./kit.module.css";
import { KitMotion } from "./motion";

/**
 * Building blocks for kit templates. They carry no look of their own beyond
 * structure; every template styles them with its own classes.
 */

export { Paragraphs } from "../shared/invitation-root";

/** Reveal attributes: `<div {...fx("rise")}>`. Variants live in kit.module.css and the template's CSS. */
export const fx = (variant: string, delay?: number) => ({ "data-k": variant, ...(delay ? { style: { transitionDelay: `${delay}ms` } } : {}) });

/**
 * A template's root: theme variables, language, the motion engine and the
 * music toggle. `className` is the template's own root class (its CSS
 * module scopes everything under it).
 */
export function KitRoot({ model, kit, className, children, after }: { model: InvitationModel; kit: string; className?: string; children: ReactNode; after?: ReactNode }) {
  return (
    <InvitationRoot model={model} className="font-inv-body">
      <div data-kit={kit} className={cn(k.root, className)}>
        <main>{children}</main>
        {after}
        <KitMotion model={model} />
      </div>
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

/** A photo filling its box (the box sets size, shape and treatment). */
export function Pic({
  asset,
  className,
  sizes,
  priority,
  alt,
  children,
  ...rest
}: { asset: MediaAsset | null | undefined; className?: string; sizes: string; priority?: boolean; alt?: string; children?: ReactNode } & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  return (
    <div {...rest} className={cn("relative overflow-hidden", className)}>
      {asset ? (
        // The template's colour grade goes on this layer (`.root [data-grade]`),
        // so the theme's own photo tone on the <img> still applies.
        <span data-grade="" className="absolute inset-0 block">
          <InvitationImage asset={asset} alt={alt ?? asset.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </span>
      ) : null}
      {children}
    </div>
  );
}

/** A section element with the section's id and data attribute. */
export function Sec({ id, className, children, style }: { id: string; className?: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section id={id} data-section={id} className={className} style={style}>
      {children}
    </section>
  );
}

/** The countdown, styled entirely by the template. */
export function Clock({ model, className, unit, value, label }: { model: InvitationModel; className?: string; unit?: string; value?: string; label?: string }) {
  if (!model.countdownTarget) return null;
  return <Countdown model={model} className={className} unitClassName={unit} valueClassName={value} labelClassName={label} />;
}

/** An embedded map (never in exports). */
export function KitMap({ model, event, className }: { model: InvitationModel; event: EventModel; className?: string }) {
  if (model.mode === "export") return null;
  return <MapEmbed event={event} className={className} />;
}

/** The couple's reply link as a button (collecting replies in Vellum is Phase 2). */
export function ReplyLink({ content, className, children }: { content: SectionContent<"rsvp">; className?: string; children?: ReactNode }) {
  if (!content.linkUrl) return null;
  return (
    <a className={className} href={content.linkUrl} target="_blank" rel="noopener noreferrer">
      {children ?? (content.linkLabel || content.heading)}
    </a>
  );
}

/** A "Directions" link for an event. */
export function Directions({ model, event, className, children }: { model: InvitationModel; event: EventModel; className?: string; children?: ReactNode }) {
  if (!event.mapUrl) return null;
  return (
    <a className={className} href={event.mapUrl} target="_blank" rel="noopener noreferrer">
      {children ?? model.strings.directions}
    </a>
  );
}
