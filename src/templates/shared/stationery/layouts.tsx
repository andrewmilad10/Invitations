import type { ReactNode } from "react";
import type { StationeryArt } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { Bird, Cartouche, PressedFlower, RoseSpray, VintageCar } from "./motifs";
import { Leaf } from "./ornaments";
import { Blessing, CalendarIcon, ClockIcon, DateRow, Eyebrow, HouseIcon, Photo, PinIcon, RingsIcon, type StationeryPhoto, type StationeryText } from "./parts";

/**
 * The boutique card layouts: formal script, the wedding car, a torn-paper
 * photo collage, date rows, a crest, split arches, an arch panel and three
 * photo cards. Sizes are in cqmin (the card's shorter side).
 */

/** Layouts that place the Bismillah themselves (others get it at the top). */
const BLESSING_INSIDE = new Set(["details", "formal-script", "date-row", "script-date", "script-bars", "crest", "arch-panel", "photo-half", "classic", "script", "typographic", "monogram", "refined", "spaced"]);
export const handlesBlessing = (layout: string) => BLESSING_INSIDE.has(layout);

interface Props {
  art: Required<StationeryArt>;
  text: StationeryText;
  photos: StationeryPhoto[];
  sizes: string;
}

const col = "absolute inset-0 flex flex-col items-center justify-center text-center font-inv-body";

function Names({ text, className, amp = "&" }: { text: StationeryText; className?: string; amp?: ReactNode }) {
  return (
    <p className={cn("font-inv-accent leading-[1.1]", className)}>
      {text.partnerOne || " "} <span className="text-inv-accent">{amp}</span> {text.partnerTwo || " "}
    </p>
  );
}

function StackedNames({ text, and, className, andClassName }: { text: StationeryText; and: ReactNode; className?: string; andClassName?: string }) {
  return (
    <>
      <p className={cn("font-inv-accent leading-[1.05]", className)}>{text.partnerOne || " "}</p>
      <p className={andClassName}>{and}</p>
      <p className={cn("font-inv-accent leading-[1.05]", className)}>{text.partnerTwo || " "}</p>
    </>
  );
}

export function BoutiqueLayout({ art, text, photos, sizes }: Props): ReactNode | undefined {
  const { layout, ornament, shape } = art;
  const wide = shape === "landscape";
  const blessing = text.blessing ? <Blessing /> : null;

  switch (layout) {
    case "formal-script": {
      // Formal calligraphy, framed by the motif (an oval of lace, or lilies).
      const oval = ornament === "tulips-lace";
      return (
        <div className={cn(col, oval ? (wide ? "px-[30%] py-[10cqmin]" : "px-[21%] py-[18cqmin]") : wide ? "px-[22%] py-[8cqmin]" : "px-[17%] py-[16cqmin]")}>
          {blessing}
          {text.eyebrow ? <p className="mt-[1.5cqmin] font-inv-heading text-[3.8cqmin] opacity-90">{text.eyebrow}</p> : null}
          <p className="mt-[4cqmin] break-words font-inv-accent text-[15cqmin] leading-[0.95] text-inv-accent">{text.partnerOne || " "}</p>
          <p className="my-[0.5cqmin] font-inv-heading text-[3cqmin] uppercase tracking-[0.25em]">and</p>
          <p className="break-words font-inv-accent text-[15cqmin] leading-[0.95] text-inv-accent">{text.partnerTwo || " "}</p>
          {text.line ? <p className="mt-[5cqmin] font-inv-heading text-[4cqmin] leading-snug">{text.line}</p> : null}
          {text.dateLabel ? <p className="mt-[3cqmin] font-inv-heading text-[3.2cqmin]">{[text.dateLabel, text.time].filter(Boolean).join(" | ")}</p> : null}
          {text.place ? <p className="mt-[1cqmin] font-inv-accent text-[4.6cqmin] leading-tight text-inv-accent">{text.place}</p> : null}
        </div>
      );
    }

    case "drive":
      // We're getting married: rings, a hand-written headline, the wedding
      // car and its number plate carrying the date.
      return (
        <div className="absolute inset-0 flex flex-col items-center px-[9%] pt-[8cqmin] text-center font-inv-body text-inv-accent">
          {text.blessing ? <Blessing className="mb-[1cqmin] text-[5cqmin]" /> : null}
          <RingsIcon className="w-[15cqmin]" />
          {text.eyebrow ? <p className="mt-[1cqmin] font-inv-accent text-[13cqmin] leading-[0.92]">{text.eyebrow}</p> : null}
          <p className="mt-[4cqmin] flex items-center gap-[2.5cqmin] text-[4.8cqmin] font-medium uppercase tracking-[0.08em]">
            {text.partnerOne || " "}
            <svg aria-hidden viewBox="0 0 24 22" className="w-[6cqmin] fill-current">
              <path d="M12 21C5 15 1 11 1 6.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 11 2.5C23 11 19 15 12 21z" />
            </svg>
            {text.partnerTwo || " "}
          </p>
          <div className="relative mt-[2cqmin] w-[84%]">
            <Bird className="absolute -left-[14%] top-[6%] w-[18%]" />
            <Bird className="absolute -right-[14%] -top-[8%] w-[18%]" flip />
            <VintageCar className="w-full" />
          </div>
          <div className="-mt-[1cqmin] w-[80%] rounded-[2cqmin] bg-inv-accent p-[1.2cqmin] text-inv-accent-fg">
            <div className="relative rounded-[1.4cqmin] border border-dashed border-current/70 px-[4cqmin] py-[2.4cqmin]">
              {["left-[1.6cqmin] top-[1.6cqmin]", "right-[1.6cqmin] top-[1.6cqmin]", "bottom-[1.6cqmin] left-[1.6cqmin]", "bottom-[1.6cqmin] right-[1.6cqmin]"].map((p) => (
                <span key={p} className={cn("absolute size-[1.6cqmin] rounded-full bg-current", p)} />
              ))}
              <p className="text-[7.5cqmin] font-light leading-none tracking-[0.18em]">{text.date?.short ?? text.dateLabel ?? " "}</p>
              {text.place ? <p className="mt-[1.6cqmin] text-[3.4cqmin] font-semibold uppercase tracking-[0.06em]">{text.place}</p> : null}
              {text.time ? <p className="text-[2.8cqmin] opacity-90">{text.time}</p> : null}
            </div>
          </div>
        </div>
      );

    case "torn-photo": {
      // A collage: the photo torn across, a painted label, a pressed flower
      // held down with tape, and the words on the paper below.
      const tear = "M0 6 L4 3 L7 7 L11 2 L15 6 L19 4 L23 8 L27 3 L31 6 L35 2 L39 7 L43 4 L47 8 L51 3 L55 6 L59 2 L63 7 L67 3 L71 6 L75 2 L79 7 L83 4 L87 8 L91 3 L95 6 L100 4 L100 20 L0 20 Z";
      return (
        <div className="absolute inset-0 bg-inv-surface font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-x-0 top-0 h-[54%]" />
          <svg aria-hidden viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-x-0 top-[47%] h-[9%] w-full">
            <path d={tear} transform="translate(0 1.2)" fill="rgb(0 0 0 / 0.12)" />
            <path d={tear} fill="var(--inv-surface)" />
          </svg>
          <div className="absolute right-[5%] top-[34%] w-[60%]">
            <svg aria-hidden viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-0 size-full">
              <path d="M3 6 C 20 2, 60 3, 97 1 C 99 7, 96 14, 99 22 C 70 24, 30 21, 2 23 C 4 16, 0 11, 3 6 Z" fill="var(--inv-accent)" opacity="0.92" />
            </svg>
            <p className="relative py-[2.6cqmin] text-center text-[3.6cqmin] uppercase tracking-[0.18em] text-inv-accent-fg">{text.eyebrow || " "}</p>
          </div>
          <PressedFlower className="absolute -left-[3%] top-[38%] h-[62%] w-[34%]" />
          <span aria-hidden className="absolute left-[1%] top-[77%] h-[6%] w-[30%] -rotate-[7deg] bg-[color-mix(in_oklab,var(--inv-accent)_45%,transparent)]" />
          <div className="absolute bottom-[6%] right-[5%] top-[58%] flex w-[66%] flex-col items-center justify-center text-center">
            <p className="font-inv-accent text-[12cqmin] leading-[1]">
              {text.partnerOne || " "} &amp;
              <br />
              {text.partnerTwo || " "}
            </p>
            <DateRow text={text} variant="plain" className="mt-[4cqmin]" dayClassName="font-inv-accent" />
            {text.place ? <p className="mt-[3cqmin] text-[2.8cqmin] uppercase tracking-[0.3em]">{text.place}</p> : null}
          </div>
        </div>
      );
    }

    case "date-row":
      return (
        <div className={cn(col, wide ? "px-[18%] py-[6cqmin]" : "px-[13%] py-[16cqmin]")}>
          {blessing}
          <Eyebrow className="max-w-[70%] text-[3.2cqmin] leading-[1.5] opacity-90">{text.eyebrow}</Eyebrow>
          <Names text={text} className="mt-[4cqmin] text-[11cqmin]" />
          {text.line ? <p className="mt-[4cqmin] max-w-[85%] text-[3.2cqmin] uppercase leading-[1.5] tracking-[0.2em]">{text.line}</p> : null}
          <DateRow text={text} className="mt-[5cqmin] w-[92%]" />
          {text.place ? <p className="mt-[4cqmin] text-[3.2cqmin] uppercase tracking-[0.2em]">{text.place}</p> : null}
        </div>
      );

    case "script-date":
    case "script-bars": {
      const bars = layout === "script-bars";
      return (
        <div className={cn(col, wide ? "px-[18%] py-[5cqmin]" : "px-[12%] py-[14cqmin]")}>
          {blessing}
          {bars && text.eyebrow ? <p className="mt-[2cqmin] text-[3.6cqmin] leading-[1.5] tracking-[0.04em] opacity-90">{text.eyebrow}</p> : null}
          <StackedNames
            text={text}
            and={bars ? "&" : "and"}
            className={cn("text-inv-accent", bars ? "mt-[3cqmin] text-[13cqmin] text-inv-fg" : "text-[16cqmin]")}
            andClassName={bars ? "my-[1cqmin] font-inv-heading text-[6cqmin] leading-none text-inv-accent" : "my-[1.5cqmin] font-inv-heading text-[4.6cqmin] italic uppercase tracking-[0.3em]"}
          />
          {!bars && text.line ? <p className="mt-[5cqmin] font-inv-heading text-[4.2cqmin] italic leading-[1.5]">{text.line}</p> : null}
          <DateRow text={text} variant={bars ? "bars" : "rules"} className="mt-[5cqmin] w-[94%]" dayClassName={bars ? undefined : "font-inv-accent"} />
          {text.place ? <p className="mt-[4cqmin] text-[3cqmin] uppercase tracking-[0.3em]">{text.place}</p> : null}
        </div>
      );
    }

    case "crest":
      return (
        <div className={cn(col, wide ? "px-[20%] py-[4cqmin]" : "px-[12%] py-[10cqmin]")}>
          {blessing}
          {text.eyebrow ? <p className="max-w-[60%] text-[3cqmin] uppercase leading-[1.4] tracking-[0.12em] opacity-85">{text.eyebrow}</p> : null}
          <div className={cn("relative mt-[3cqmin]", wide ? "w-[36%]" : "w-[66%]")}>
            <Cartouche className="w-full" />
            <p className="absolute inset-0 grid place-items-center font-inv-heading leading-none">
              <span className="relative block text-[20cqmin]">
                <span className="relative -left-[3cqmin] -top-[4cqmin]">{Array.from(text.partnerOne.trim())[0]?.toUpperCase() ?? ""}</span>
                <span className="absolute left-[3cqmin] top-[9cqmin]">{Array.from(text.partnerTwo.trim())[0]?.toUpperCase() ?? ""}</span>
              </span>
            </p>
          </div>
          <p className="mt-[4cqmin] font-inv-heading text-[4.6cqmin] uppercase tracking-[0.18em]">
            {text.partnerOne || " "} <span className="font-inv-accent normal-case text-inv-accent">&amp;</span> {text.partnerTwo || " "}
          </p>
          {text.dateLabel ? <p className="mt-[2cqmin] text-[2.8cqmin] uppercase tracking-[0.28em] opacity-80">{text.dateLabel}</p> : null}
        </div>
      );

    case "split-arch":
      // Two overlapping arched panels: the names on one, the details on the other.
      return (
        <div className="absolute inset-0 font-inv-body text-inv-surface">
          <div className="absolute bottom-0 left-0 top-[7%] w-[62%] bg-inv-fg" style={{ borderTopRightRadius: "100% 32%" }} />
          <div className="absolute bottom-0 right-0 top-[28%] w-[50%] bg-[color-mix(in_oklab,var(--inv-fg)_84%,var(--inv-surface))]" style={{ borderTopLeftRadius: "100% 24%" }} />
          <RoseSpray className="absolute -top-[1%] left-[36%] w-[58%]" seed={3} />
          <RoseSpray className="absolute -bottom-[2%] -left-[8%] w-[44%] rotate-[200deg]" seed={5} />
          {text.eyebrow ? (
            <svg aria-hidden viewBox="0 0 100 40" className="absolute left-[4%] top-[12%] w-[50%]">
              <path id="arch-text" d="M8 36 A 44 34 0 0 1 92 36" fill="none" />
              <text fill="currentColor" fontSize="6.4" letterSpacing="2.4" textAnchor="middle" style={{ fontFamily: "var(--inv-font-body)", textTransform: "uppercase" }}>
                <textPath href="#arch-text" startOffset="50%">
                  {text.eyebrow}
                </textPath>
              </text>
            </svg>
          ) : null}
          <div className="absolute left-0 top-[34%] flex w-[60%] flex-col items-center px-[5%] text-center">
            {text.blessing ? <Blessing className="text-[5cqmin] text-inv-surface" /> : null}
            <StackedNames text={text} and="&" className="text-[12cqmin]" andClassName="font-inv-accent text-[6cqmin] leading-none" />
            {text.line ? <p className="mt-[5cqmin] text-[3.4cqmin] leading-[1.5]">{text.line}</p> : null}
          </div>
          <div className="absolute right-0 top-[44%] flex w-[50%] flex-col items-center gap-[1.4cqmin] px-[4%] text-center">
            <CalendarIcon className="w-[8cqmin]" />
            {text.date ? (
              <p className="text-[3.4cqmin] leading-[1.4]">
                {text.date.weekday},
                <br />
                {text.date.day} {text.date.month} {text.date.year}
              </p>
            ) : text.dateLabel ? (
              <p className="text-[3.4cqmin]">{text.dateLabel}</p>
            ) : null}
            {text.time ? <p className="text-[3cqmin] opacity-85">{text.time}</p> : null}
            <PinIcon className="mt-[3cqmin] w-[7.5cqmin]" />
            {text.place ? <p className="text-[3.4cqmin] leading-[1.4]">{text.place}</p> : null}
          </div>
        </div>
      );

    case "arch-panel":
      return (
        <div className="absolute inset-0 font-inv-body">
          <div className="absolute inset-x-[13%] bottom-[8%] top-[9%] bg-inv-surface shadow-[0_1cqmin_3cqmin_rgb(0_0_0/0.12)]" style={{ borderRadius: "50% 50% 0 0 / 26% 26% 0 0" }}>
            <div className="absolute inset-[2.4cqmin] border border-[color-mix(in_oklab,var(--inv-accent)_70%,transparent)]" style={{ borderRadius: "50% 50% 0 0 / 25% 25% 0 0" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[9%] pb-[6cqmin] pt-[14cqmin] text-center">
              {blessing}
              {text.eyebrow ? <p className="mt-[1cqmin] text-[2.8cqmin] leading-[1.5] tracking-[0.04em]">{text.eyebrow}</p> : null}
              <StackedNames text={text} and="&" className="mt-[2cqmin] text-[11cqmin] text-inv-accent" andClassName="font-inv-heading text-[6cqmin] leading-none text-inv-accent" />
              <span className="my-[3cqmin] h-px w-[80%] bg-inv-accent" />
              <DateRow text={text} variant="bars" className="w-full" />
              {text.place ? <p className="mt-[3.4cqmin] font-inv-heading text-[4.4cqmin] font-semibold uppercase leading-tight tracking-[0.04em]">{text.place}</p> : null}
            </div>
          </div>
        </div>
      );

    case "oval-photo": {
      const sprig = (cls: string, flip?: boolean) => (
        <svg aria-hidden viewBox="0 0 40 60" className={cls} style={flip ? { transform: "scale(-1, -1)" } : undefined}>
          <path d="M6 58 C 10 40, 18 24, 34 4" fill="none" stroke="var(--inv-muted)" strokeWidth="0.6" />
          {[8, 14, 20, 26, 32, 38, 44, 50].map((y, i) => (
            <Leaf key={y} x={6 + (58 - y) * 0.48} y={y} angle={i % 2 ? 40 : -60} len={7} width={2.6} fill={i % 3 === 0 ? "var(--inv-accent)" : "color-mix(in oklab, var(--inv-muted) 70%, var(--inv-fg))"} opacity={0.75} />
          ))}
        </svg>
      );
      return (
        <div className={cn("absolute inset-0 flex font-inv-body", wide ? "flex-row" : "flex-col")}>
          <div className={cn("relative", wide ? "h-full w-[46%]" : "h-[52%] w-full")}>
            <span aria-hidden className="absolute -bottom-[10%] left-[0%] h-[50%] w-[70%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--inv-accent)_40%,transparent),transparent)]" />
            <span aria-hidden className="absolute -top-[10%] left-[40%] h-[40%] w-[80%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--inv-muted)_25%,transparent),transparent)]" />
            {sprig("absolute left-[2%] top-[2%] w-[34%]")}
            {sprig("absolute bottom-[2%] right-[2%] w-[34%]", true)}
            <div className={cn("absolute rounded-[50%] bg-inv-accent p-[0.9cqmin]", wide ? "inset-x-[17%] inset-y-[9%]" : "inset-x-[28%] inset-y-[8%]")}>
              <Photo photo={photos[0]} sizes={sizes} className="size-full rounded-[50%]" />
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-[5%] text-center">
            <Eyebrow className="text-[2.6cqmin] leading-[1.6] tracking-[0.16em] opacity-90">{text.eyebrow}</Eyebrow>
            <p className="mt-[3cqmin] font-inv-heading text-[7.5cqmin] font-semibold uppercase leading-[1.15] tracking-[0.24em]">
              {text.partnerOne || " "}
              <br />
              <span className="text-inv-accent">&amp;</span>
              <br />
              {text.partnerTwo || " "}
            </p>
            {text.dateLabel ? <p className="mt-[3cqmin] font-inv-heading text-[3.2cqmin] font-semibold uppercase tracking-[0.08em]">{text.dateLabel}</p> : null}
            {text.time ? <p className="font-inv-heading text-[3cqmin] uppercase tracking-[0.08em]">{text.time}</p> : null}
            {text.place ? <p className="mt-[2cqmin] text-[2.8cqmin] uppercase tracking-[0.12em] opacity-85">{text.place}</p> : null}
          </div>
        </div>
      );
    }

    case "photo-details": {
      const parts = (text.date?.short ?? "").split(/[^\p{N}]+/u).filter(Boolean);
      const [dd, mm, yy] = parts.length === 3 ? [parts[0], parts[1], parts[2].slice(-2)] : [text.date?.day ?? "", text.date?.month ?? "", text.date?.year ?? ""];
      return (
        <div className="absolute inset-0 font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-0" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center text-white">
            {text.blessing ? <Blessing className="text-[5cqmin] text-white" /> : null}
            <Eyebrow className="text-[3.2cqmin] tracking-[0.32em] opacity-95">{text.eyebrow}</Eyebrow>
            {dd ? (
              <div className="mt-[4cqmin] flex items-start gap-[4cqmin]">
                {[
                  [dd, "Day"],
                  [mm, "Month"],
                  [yy, "Year"],
                ].map(([n, l], i) => (
                  <div key={l} className={cn("flex flex-col items-center", i > 0 && "border-s border-white/80 ps-[4cqmin]")}>
                    <span className="text-[8cqmin] font-light leading-none">{n}</span>
                    <span className="mt-[1.2cqmin] text-[2.4cqmin] uppercase tracking-[0.24em]">{l}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {text.line ? <p className="mt-[6cqmin] text-[2.8cqmin] uppercase tracking-[0.3em]">{text.line}</p> : null}
            <Names text={text} className="mt-[2cqmin] text-[9cqmin] [&>span]:text-white" />
            <div className="mt-[5cqmin] flex gap-[4cqmin]">
              {[
                [<HouseIcon key="h" className="w-[7cqmin]" />, text.place],
                [<ClockIcon key="c" className="w-[7cqmin]" />, text.time],
              ]
                .filter(([, v]) => v)
                .map(([icon, v], i) => (
                  <div key={i} className="flex aspect-[1.15] w-[26cqmin] flex-col items-center justify-center gap-[1.6cqmin] border border-white/85 p-[2cqmin]">
                    {icon}
                    <p className="text-[2.6cqmin] uppercase leading-[1.4]">{v}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    }

    case "photo-half":
      return (
        <div className={cn("absolute inset-0 flex font-inv-body", wide ? "flex-row" : "flex-col")}>
          <Photo photo={photos[0]} sizes={sizes} className={wide ? "h-full w-[46%]" : "h-[46%] w-full"} />
          <div className="flex flex-1 flex-col items-center justify-center px-[5%] text-center">
            {blessing}
            {text.eyebrow ? <p className="text-[3cqmin] tracking-[0.16em]">{text.eyebrow}</p> : null}
            <StackedNames text={text} and="&" className="text-[11cqmin]" andClassName="font-inv-accent text-[8cqmin] leading-none" />
            <DateRow text={text} variant="bars" className="mt-[4cqmin] w-[92%]" />
            {text.place ? <p className="mt-[3cqmin] text-[2.8cqmin] uppercase tracking-[0.2em]">{text.place}</p> : null}
          </div>
        </div>
      );

    case "details": {
      // The details enclosure: a heading and a few short sections.
      const d = text.details;
      if (!d) return null;
      return (
        <div className={cn(col, wide ? "px-[18%] py-[8cqmin]" : "px-[16%] py-[18cqmin]")}>
          <p className="font-inv-heading text-[9cqmin] uppercase leading-none tracking-[0.06em]">{d.heading}</p>
          <div className="mt-[5cqmin] flex flex-col gap-[4.5cqmin]">
            {d.sections
              .filter((x) => x.title || x.body)
              .map((x, i) => (
                <div key={i}>
                  {x.title ? <p className="text-[2.9cqmin] uppercase tracking-[0.3em] text-inv-accent">{x.title}</p> : null}
                  {x.body ? <p className="mt-[1cqmin] whitespace-pre-line font-inv-heading text-[3.6cqmin] italic leading-[1.45]">{x.body}</p> : null}
                </div>
              ))}
          </div>
        </div>
      );
    }

    default:
      return undefined;
  }
}
