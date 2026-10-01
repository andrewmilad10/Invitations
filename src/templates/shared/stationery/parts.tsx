import { SmartImage as Image } from "@/components/smart-image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pieces shared by every card layout: the words a card can carry, photos,
 * small lines of type, the date row and a few line icons.
 */

export interface StationeryText {
  partnerOne: string;
  partnerTwo: string;
  eyebrow?: string | null;
  dateLabel?: string | null;
  place?: string | null;
  /** A short invitation line, e.g. "invite you to celebrate their wedding". */
  line?: string | null;
  /** The date in parts, for layouts that set the day, month and year apart. */
  date?: { weekday: string; day: string; month: string; year: string; short: string } | null;
  /** The ceremony time, e.g. "7:00 pm". */
  time?: string | null;
  /** Show the Bismillah above the words. */
  blessing?: boolean;
  /** For the details enclosure. */
  details?: { heading: string; sections: { title: string; body: string }[] } | null;
}

/** How the reverse of a card is printed (the card studio sets this). */
export interface BackDesign {
  layout: "blank" | "monogram" | "photo" | "note" | "pattern";
  note?: string;
  photo?: StationeryPhoto | null;
  /** A link to print as a QR code. */
  qr?: string | null;
}

export interface StationeryPhoto {
  url: string;
  alt: string;
}

export function initial(s: string) {
  return Array.from(s.trim())[0]?.toUpperCase() ?? "";
}

export function Photo({ photo, sizes, className }: { photo: StationeryPhoto | undefined; sizes: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-[color-mix(in_oklab,var(--inv-accent)_18%,var(--inv-surface))]", className)}>
      {photo?.url ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          unoptimized={/^(\/|blob:|data:)/.test(photo.url)}
          className="object-cover"
          style={{ filter: "var(--inv-photo-filter, none)" }}
        />
      ) : null}
    </div>
  );
}

/** Eyebrow line (small, spaced). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn("text-[3.1cqmin] uppercase tracking-[0.2em] opacity-75", className)}>{children}</p>;
}

export function DateLine({ text, className }: { text: StationeryText; className?: string }) {
  if (!text.dateLabel && !text.place) return null;
  return (
    <div className={cn("text-[3.3cqmin] uppercase tracking-[0.18em]", className)}>
      {text.dateLabel ? <p>{text.dateLabel}</p> : null}
      {text.place ? <p className="mt-[1.2cqmin] opacity-70">{text.place}</p> : null}
    </div>
  );
}

/** بسم الله الرحمن الرحيم, set in Amiri in the accent colour. */
export function Blessing({ className }: { className?: string }) {
  return (
    <p lang="ar" dir="rtl" className={cn("text-[6.4cqmin] leading-[1.3] text-inv-accent", className)} style={{ fontFamily: "var(--font-amiri), serif" }}>
      بسم الله الرحمن الرحيم
    </p>
  );
}

/**
 * Month above; weekday · day · time across, divided by rules ("rules") or
 * short vertical bars ("bars"); year below. Falls back to the plain date line.
 */
export function DateRow({ text, variant = "rules", className, dayClassName }: { text: StationeryText; variant?: "rules" | "bars" | "plain"; className?: string; dayClassName?: string }) {
  const d = text.date;
  if (!d) return text.dateLabel ? <p className={cn("text-[3.2cqmin] uppercase tracking-[0.24em]", className)}>{text.dateLabel}</p> : null;
  const side = "flex-1 whitespace-nowrap text-[3cqmin] uppercase tracking-[0.2em]";
  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <p className="text-[3cqmin] uppercase tracking-[0.3em]">{d.month}</p>
      <div className="my-[1.2cqmin] flex w-full items-center gap-[3cqmin]">
        <p className={cn(side, "text-end", variant === "rules" && "border-y border-current py-[1.6cqmin]")}>{d.weekday}</p>
        {variant === "bars" ? <span className="h-[11cqmin] w-px bg-inv-accent" /> : null}
        <p className={cn("font-inv-heading text-[11cqmin] leading-none", dayClassName)}>{d.day}</p>
        {variant === "bars" ? <span className="h-[11cqmin] w-px bg-inv-accent" /> : null}
        <p className={cn(side, "text-start", variant === "rules" && "border-y border-current py-[1.6cqmin]")}>{text.time ?? "\u00a0"}</p>
      </div>
      <p className="text-[3cqmin] uppercase tracking-[0.3em]">{d.year}</p>
    </div>
  );
}

// ── Line icons (currentColor) ───────────────────────────────────────────────

const icon = "fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]";

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn(icon, className)} strokeWidth="1.3">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      {[8, 12, 16].flatMap((x) => [13, 16.5].map((y) => <rect key={`${x}-${y}`} x={x - 1.1} y={y - 1.1} width="2.2" height="2.2" rx="0.4" />))}
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn(icon, className)} strokeWidth="1.3">
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function HouseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn(icon, className)} strokeWidth="1.3">
      <path d="M3 10.5 12 4l9 6.5M5.5 9v11h13V9" />
      <path d="M9.5 20v-5h5v5M12 11.2c-.9-1-2.6-.4-2.4 1 .2 1.2 2.4 2.4 2.4 2.4s2.2-1.2 2.4-2.4c.2-1.4-1.5-2-2.4-1z" />
    </svg>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn(icon, className)} strokeWidth="1.3">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function RingsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 24" className={cn(icon, className)} strokeWidth="1.2">
      <ellipse cx="15" cy="12" rx="9" ry="7.5" transform="rotate(-18 15 12)" />
      <ellipse cx="15" cy="12" rx="6.6" ry="5.2" transform="rotate(-18 15 12)" />
      <ellipse cx="25" cy="12" rx="9" ry="7.5" transform="rotate(14 25 12)" />
      <ellipse cx="25" cy="12" rx="6.6" ry="5.2" transform="rotate(14 25 12)" />
    </svg>
  );
}

/** A QR code drawn as squares in the current text colour. */
export function QrCode({ matrix, className }: { matrix: boolean[][]; className?: string }) {
  const n = matrix.length;
  let d = "";
  matrix.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return (
    <svg aria-hidden viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={className} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="var(--inv-surface)" />
      <path d={d} fill="currentColor" />
    </svg>
  );
}
