import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Blessing, ClockIcon, HouseIcon, initial, PinIcon, type StationeryText } from "./parts";

/**
 * The travel suite ("Bon Voyage"): the invitation as a boarding pass, a
 * travel-details card with an arrival stamp, a passport-style back and a
 * plane on the envelope's wax seal. All drawn here in the theme's colours.
 *
 * Colour roles: surface = the ticket paper, fg = ink, muted = small labels,
 * accent = the dark band (and the details card / passport), accent-fg = the
 * gold printed on it. Sizes are in cqmin (the card's shorter side).
 */

/** A word in English or Arabic, following the card's language (lang="ar"). */
export function Say({ en, ar }: { en: ReactNode; ar: ReactNode }) {
  return (
    <>
      <span className="[:lang(ar)_&]:hidden">{en}</span>
      <span className="hidden [:lang(ar)_&]:inline">{ar}</span>
    </>
  );
}

/** A plane seen from above, nose to the right (mirrored in Arabic). */
export function Plane({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("fill-current rtl:-scale-x-100", className)}>
      <path d="M21.6 12c0-.85-.7-1.3-1.6-1.3h-4.6L10.8 3.2H8.9l2.4 7.5H6.4L4.6 8.3H3.2l1.1 3.7-1.1 3.7h1.4l1.8-2.4h4.9l-2.4 7.5h1.9l4.6-7.5H20c.9 0 1.6-.45 1.6-1.3z" />
    </svg>
  );
}

/** Bars of a boarding-pass code, made from the couple's names (decorative). */
function Barcode({ seed, className, vertical }: { seed: string; className?: string; vertical?: boolean }) {
  let h = 7;
  const bars: number[] = [];
  const chars = Array.from(seed || "vellum");
  for (let i = 0; i < 38; i++) {
    h = (h * 31 + (chars[i % chars.length].codePointAt(0) ?? 1) + i) >>> 0;
    bars.push(1 + (h % 3));
  }
  let x = 0;
  const rects = bars.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="40" /> : null;
    x += w;
    return r;
  });
  return (
    <svg aria-hidden viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className={cn("fill-current", vertical && "rotate-90", className)}>
      {rects}
    </svg>
  );
}

const label = "font-inv-body text-[2.1cqmin] uppercase tracking-[0.22em] text-inv-muted";
const dateOf = (text: StationeryText) =>
  text.date ? [text.date.day, text.date.month, text.date.year].filter(Boolean).join(" ") : (text.dateLabel ?? "");

/** The invitation: a boarding pass with a tear-off stub. */
export function BoardingPass({ text }: { text: StationeryText }) {
  const a = initial(text.partnerOne);
  const b = initial(text.partnerTwo);
  const year = text.date?.year ?? "";
  const field = (k: ReactNode, v: ReactNode) => (
    <div className="min-w-0">
      <p className={label}>{k}</p>
      <p className="mt-[0.8cqmin] font-inv-heading text-[3.6cqmin] leading-tight">{v}</p>
    </div>
  );
  return (
    <div className="absolute inset-0 bg-inv-surface text-start font-inv-body text-inv-fg">
      {/* The band across the top */}
      <div className="absolute inset-x-0 top-0 flex h-[13cqmin] bg-inv-accent text-inv-accent-fg">
        <div className="flex w-[73%] items-center justify-between px-[6cqmin]">
          <span className="flex items-center gap-[2cqmin] text-[2.6cqmin] uppercase tracking-[0.32em]">
            <Plane className="w-[4.6cqmin]" />
            <Say en="Boarding pass" ar="بطاقة صعود" />
          </span>
          <span className="text-[2.4cqmin] uppercase tracking-[0.22em] opacity-85">
            <Say en="Flight" ar="رحلة" /> {a}
            {b} {year}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center text-[2.4cqmin] uppercase tracking-[0.3em]">
          <Say en="Admit two" ar="لشخصين" />
        </div>
      </div>

      {/* The pass */}
      <div className="absolute bottom-0 start-0 top-[13cqmin] flex w-[73%] flex-col px-[6cqmin] pb-[5cqmin] pt-[5cqmin]">
        {text.blessing ? <Blessing className="mb-[1cqmin] text-[4.2cqmin]" /> : null}
        {text.eyebrow ? <p className="text-[2.5cqmin] uppercase tracking-[0.24em] text-inv-muted">{text.eyebrow}</p> : null}
        <p className="mt-[1.6cqmin] break-words font-inv-heading text-[10.5cqmin] uppercase leading-[1.02] tracking-[0.04em]">
          {text.partnerOne || " "} <span className="font-inv-accent normal-case text-inv-muted">{text.amp ?? "&"}</span> {text.partnerTwo || " "}
        </p>
        {text.line ? <p className="mt-[1.6cqmin] text-[2.7cqmin] uppercase tracking-[0.12em]">{text.line}</p> : null}

        {/* Departure today, arrival forever */}
        <div className="mt-auto flex items-center gap-[2.4cqmin] text-[2.3cqmin] uppercase tracking-[0.22em]">
          <span><Say en="Today" ar="اليوم" /></span>
          <span className="relative h-[6cqmin] flex-1 text-inv-accent">
          <svg aria-hidden viewBox="0 0 120 20" className="absolute inset-0 size-full rtl:-scale-x-100" preserveAspectRatio="none">
            <circle cx="3" cy="16" r="2.4" fill="currentColor" />
            <path d="M6 16 Q60 -6 114 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <circle cx="117" cy="16" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[38%] bg-inv-surface px-[0.8cqmin]">
            <Plane className="w-[4.6cqmin]" />
          </span>
          </span>
          <span><Say en="Forever" ar="للأبد" /></span>
        </div>
        <div className="mt-[3.4cqmin] grid grid-cols-[auto_auto_1fr] gap-x-[5cqmin] border-t border-inv-fg/20 pt-[3cqmin]">
          {field(<Say en="Date" ar="التاريخ" />, dateOf(text) || "—")}
          {field(<Say en="Boarding" ar="الصعود" />, text.time || "—")}
          {field(<Say en="Gate" ar="البوابة" />, text.place || "—")}
        </div>
      </div>

      {/* The perforation */}
      <div className="absolute bottom-[3cqmin] start-[73%] top-[16cqmin] border-s-[0.45cqmin] border-dotted border-inv-fg/35" />

      {/* The stub */}
      <div className="absolute bottom-0 end-0 top-[13cqmin] flex w-[27%] flex-col items-center px-[3cqmin] pb-[4.5cqmin] pt-[5cqmin] text-center">
        <p className={label}><Say en="Passengers" ar="الركّاب" /></p>
        <p className="mt-[1.4cqmin] font-inv-accent text-[10cqmin] leading-none text-inv-accent">
          {a}
          <span className="mx-[1cqmin] text-[0.55em]">{text.amp ?? "&"}</span>
          {b}
        </p>
        <div className="mt-[3cqmin] grid w-full grid-cols-2 gap-[2cqmin]">
          <div>
            <p className={label}><Say en="Seats" ar="المقاعد" /></p>
            <p className="mt-[0.6cqmin] font-inv-heading text-[3.4cqmin]">1A · 1B</p>
          </div>
          <div>
            <p className={label}><Say en="Class" ar="الدرجة" /></p>
            <p className="mt-[0.6cqmin] font-inv-heading text-[3.4cqmin]"><Say en="First" ar="الأولى" /></p>
          </div>
        </div>
        <Barcode seed={`${text.partnerOne}${text.partnerTwo}`} className="mt-auto h-[11cqmin] w-[88%] text-inv-fg" />
      </div>
    </div>
  );
}

const ICONS = [HouseIcon, Plane, PinIcon, ClockIcon];

/** The details card: travel notes on the dark band colour, an arrival stamp on the stub. */
export function TravelDetails({ text }: { text: StationeryText }) {
  const d = text.details;
  if (!d) return null;
  const date = text.date?.short ?? text.dateLabel ?? "";
  return (
    <div className="absolute inset-0 bg-inv-accent text-start font-inv-body text-inv-accent-fg">
      <div className="absolute bottom-0 start-0 top-0 flex w-[69%] flex-col px-[7cqmin] py-[6cqmin]">
        <svg aria-hidden viewBox="0 0 120 24" className="w-[34cqmin] rtl:-scale-x-100">
          <path d="M4 20 C30 22 40 4 64 8 C80 11 84 18 98 14" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 3" strokeLinecap="round" />
          <path d="M104 4c2.4-3.4 7.6-1.4 6.4 2.6-.8 2.6-6.4 6.4-6.4 6.4s-5.6-3.8-6.4-6.4C96.4 2.6 101.6.6 104 4z" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <g transform="translate(0 12) scale(0.5)" fill="currentColor"><path d="M21.6 12c0-.85-.7-1.3-1.6-1.3h-4.6L10.8 3.2H8.9l2.4 7.5H6.4L4.6 8.3H3.2l1.1 3.7-1.1 3.7h1.4l1.8-2.4h4.9l-2.4 7.5h1.9l4.6-7.5H20c.9 0 1.6-.45 1.6-1.3z" /></g>
        </svg>
        <p className="mt-[2cqmin] font-inv-accent text-[9cqmin] leading-none">{d.heading}</p>
        <div className="mt-[4cqmin] flex flex-1 flex-col justify-center gap-[3.2cqmin]">
          {d.sections
            .filter((x) => x.title || x.body)
            .slice(0, 4)
            .map((x, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={i} className="flex items-start gap-[3cqmin]">
                  <Icon className="mt-[0.3cqmin] w-[5cqmin] shrink-0 opacity-90" />
                  <div className="min-w-0">
                    {x.title ? <p className="text-[2.4cqmin] uppercase tracking-[0.24em]">{x.title}</p> : null}
                    {x.body ? <p className="mt-[0.6cqmin] whitespace-pre-line text-[2.7cqmin] leading-[1.45] opacity-90">{x.body}</p> : null}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="absolute bottom-[4cqmin] start-[69%] top-[4cqmin] border-s-[0.45cqmin] border-dotted border-current opacity-40" />

      {/* The stub: an arrival stamp on paper */}
      <div className="absolute bottom-[5cqmin] end-[4.5cqmin] top-[5cqmin] flex w-[24%] flex-col items-center justify-between bg-inv-surface px-[2cqmin] py-[4cqmin] text-center text-inv-fg">
        <div className="relative w-[90%]">
          <svg aria-hidden viewBox="0 0 100 100" className="w-full -rotate-[12deg] text-inv-accent">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 2.5" />
            <g transform="translate(38 20) scale(1)" fill="currentColor"><path d="M21.6 12c0-.85-.7-1.3-1.6-1.3h-4.6L10.8 3.2H8.9l2.4 7.5H6.4L4.6 8.3H3.2l1.1 3.7-1.1 3.7h1.4l1.8-2.4h4.9l-2.4 7.5h1.9l4.6-7.5H20c.9 0 1.6-.45 1.6-1.3z" /></g>
            <path d="M14 58 H86" stroke="currentColor" strokeWidth="1" />
            <path d="M18 74 H82" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 flex -rotate-[12deg] flex-col items-center justify-center pt-[3cqmin]">
            <p className="text-[2.4cqmin] uppercase tracking-[0.2em] text-inv-accent"><Say en="Arrived" ar="وصلنا" /></p>
            <p className="mt-[1.6cqmin] text-[2cqmin] tracking-[0.08em] text-inv-accent">{date}</p>
          </div>
        </div>
        <svg aria-hidden viewBox="0 0 100 30" className="w-[90%] text-inv-muted">
          {[6, 14, 22].map((y) => (
            <path key={y} d={`M2 ${y} q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0`} fill="none" stroke="currentColor" strokeWidth="1.1" />
          ))}
        </svg>
        <p className="font-inv-heading text-[2.5cqmin] uppercase leading-[1.5] tracking-[0.16em]">
          <Say en={<>Next stop<br />forever</>} ar={<>المحطة التالية<br />للأبد</>} />
        </p>
        <Plane className="w-[4.4cqmin] text-inv-accent" />
      </div>
    </div>
  );
}

/** The back of the invitation: a passport cover, stamped in gold. */
export function PassportCover({ text }: { text: StationeryText }) {
  const a = initial(text.partnerOne);
  const b = initial(text.partnerTwo);
  return (
    <div className="absolute inset-0 bg-inv-accent font-inv-body text-inv-accent-fg">
      <div className="absolute inset-[4cqmin] rounded-[1.2cqmin] border border-current opacity-35" />
      <div className="absolute inset-0 flex items-center justify-center gap-[9cqmin] px-[10cqmin]">
        <svg aria-hidden viewBox="0 0 100 100" className="w-[42cqmin] shrink-0">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="50" cy="50" rx="17" ry="40" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
          <ellipse cx="50" cy="50" rx="31" ry="40" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
          <path d="M10 50 H90 M15 31 H85 M15 69 H85" stroke="currentColor" strokeWidth="0.7" opacity="0.6" fill="none" />
          <ellipse cx="50" cy="50" rx="48" ry="14" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 2.5" transform="rotate(-22 50 50)" />
          <g transform="translate(84 26) rotate(-30) scale(0.42)" fill="currentColor"><path d="M21.6 12c0-.85-.7-1.3-1.6-1.3h-4.6L10.8 3.2H8.9l2.4 7.5H6.4L4.6 8.3H3.2l1.1 3.7-1.1 3.7h1.4l1.8-2.4h4.9l-2.4 7.5h1.9l4.6-7.5H20c.9 0 1.6-.45 1.6-1.3z" /></g>
        </svg>
        <div className="text-center">
          <p className="font-inv-heading text-[7cqmin] uppercase leading-none tracking-[0.18em]">
            <Say en="Passport" ar="جواز سفر" />
          </p>
          <p className="mt-[2.4cqmin] text-[2.3cqmin] uppercase tracking-[0.3em] opacity-80">
            <Say en="Issued for two" ar="صادر لاثنين" />
          </p>
          <p className="mt-[5cqmin] font-inv-heading text-[11cqmin] leading-none">
            {a}
            <span className="mx-[1.6cqmin] font-inv-accent text-[0.6em]">{text.amp ?? "&"}</span>
            {b}
          </p>
          <p className="mt-[4cqmin] text-[2.2cqmin] uppercase tracking-[0.3em] opacity-80">
            <Say en="Valid for a lifetime" ar="صالح مدى الحياة" />
          </p>
        </div>
      </div>
    </div>
  );
}

/** The plane pressed into a wax seal. */
export function PlaneSealMark({ className }: { className?: string }) {
  return <Plane className={cn("-rotate-45 rtl:rotate-45", className)} />;
}
