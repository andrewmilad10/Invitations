import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Vellum's motion vocabulary — declarative and server-renderable.
 *
 * These components only add `data-*` attributes; one client-side engine
 * (<MotionEngine />, see ./motion-engine.tsx) brings them to life with GSAP
 * ScrollTrigger. So pages stay server components, there is one animation
 * system to tune, and with JavaScript off or `prefers-reduced-motion` the
 * content is simply there, never hidden.
 *
 * Hierarchy (don't animate everything):
 *   hero, large photography, section headings, design cards, major CTAs → yes
 *   feature items, descriptions, secondary images                     → gently
 *   navigation, footer, small metadata                                 → no
 */

type Variant = "up" | "fade" | "left" | "right" | "scale";

interface BaseProps {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}

/** One element that rises (or fades/slides/settles) into place when ~20% of the screen has scrolled onto it. */
export function Reveal({ as: Tag = "div", variant = "up", delay, duration, className, style, children, id }: BaseProps & { variant?: Variant; delay?: number; duration?: number }) {
  return (
    <Tag id={id} data-motion={variant} data-delay={delay} data-duration={duration} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Reveal with the default rise — the most common case. */
export function FadeUp(props: BaseProps & { delay?: number; duration?: number }) {
  return <Reveal {...props} variant="up" />;
}

/** Reveal with opacity only. */
export function FadeIn(props: BaseProps & { delay?: number; duration?: number }) {
  return <Reveal {...props} variant="fade" />;
}

/**
 * Children appear one after another (title → text → cards → CTA) when the
 * container enters. `step` is the gap between children in ms (80–150).
 */
export function Stagger({ as: Tag = "div", step = 110, className, style, children, id }: BaseProps & { step?: number }) {
  return (
    <Tag id={id} data-stagger={step} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * For long grids: each child reveals as *it* reaches the viewport, and
 * children arriving together are gently staggered. Children added later
 * (filters, "show more") are picked up automatically.
 */
export function RevealGroup({ as: Tag = "div", step = 100, className, style, children, id }: BaseProps & { step?: number }) {
  return (
    <Tag id={id} data-reveal-group={step} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Editorial photo reveal: the frame opens from a slight crop while the
 * photo settles from a small zoom. Put the image (or its wrapper) inside.
 */
export function ImageReveal({ as: Tag = "div", className, style, children, id }: BaseProps) {
  return (
    <Tag id={id} data-image-reveal className={cn("overflow-hidden", className)} style={style}>
      <div data-image-media className="size-full">
        {children}
      </div>
    </Tag>
  );
}

/**
 * Very gentle depth for large background photos: moves `speed` × its
 * height (0.05–0.1) against the scroll. Desktop only. Give the element some
 * bleed (e.g. `-inset-y-[8%]`) so no edge shows.
 */
export function Parallax({ as: Tag = "div", speed = 0.08, from = "center", className, style, children }: BaseProps & { speed?: number; from?: "center" | "top" }) {
  return (
    <Tag data-parallax={speed} data-parallax-from={from} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * A large heading revealed line by line from behind a mask. Pass the lines
 * as you want them broken on wide screens; on narrow screens a line may wrap
 * and still reveals as one.
 */
export function RevealLines({ as: Tag = "h2", lines, className, lineClassName, id }: { as?: ElementType; lines: string[]; className?: string; lineClassName?: string; id?: string }) {
  return (
    <Tag id={id} data-lines className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span data-line className={cn("block", lineClassName)}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** A section heading + intro, revealed in sequence. */
export function SectionReveal({ as: Tag = "div", className, children, id }: BaseProps) {
  return (
    <Stagger as={Tag} id={id} step={100} className={className}>
      {children}
    </Stagger>
  );
}
