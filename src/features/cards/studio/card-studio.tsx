"use client";

import { ArrowLeft, Check, Download, ImagePlus, Loader2, Mail, Palette, Plus, RotateCcw, Send, Share2, Sparkles, Trash2, Type, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BLESSINGS, CARD_OPTION_INFO, FOIL_TONES, FOILS, PAPERS, resolveCardOptions, SILHOUETTES, type CardOptions } from "@/core/card/options";
import {
  BACK_LAYOUTS,
  ENCLOSURE_BACKS,
  ENVELOPE_COLORS,
  LINER_LABELS,
  LINERS,
  parseSuite,
  withLanguage,
  type BackLayout,
  type CardSuite,
  type EnclosureBack,
  type EnvelopeColor,
  type SuiteLang,
} from "@/core/card/suite";
import { canRotate, cardShape, designCardDefaults, type TemplateManifest } from "@/core/template/manifest";
import { paletteSwatch } from "@/features/marketing/gallery/design-card";
import { productHref } from "@/features/marketing/products";
import { cn } from "@/lib/utils";
import { DESKS, DeskSurface, useDesk, type Desk } from "./desk";
import { EnvelopeView, LinerFill } from "./envelope";
import { suiteVars, SuitePiece, type Piece } from "./pieces";

// ── State with undo ─────────────────────────────────────────────────────────

type Action = { type: "set"; update: (s: CardSuite) => CardSuite } | { type: "undo" } | { type: "replace"; suite: CardSuite };
interface State {
  suite: CardSuite;
  past: CardSuite[];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set": {
      const next = action.update(state.suite);
      return next === state.suite ? state : { suite: next, past: [...state.past.slice(-49), state.suite] };
    }
    case "undo":
      return state.past.length ? { suite: state.past[state.past.length - 1], past: state.past.slice(0, -1) } : state;
    case "replace":
      return { suite: action.suite, past: [] };
  }
}

const storageKey = (id: string) => `vellum:card-suite:v1:${id}`;
type SetSuite = (update: (s: CardSuite) => CardSuite) => void;

// ── Pieces on the desk ──────────────────────────────────────────────────────

type Item = "invitation" | "details" | "envelope";
const ITEMS: { id: Item; label: string; ar: string }[] = [
  { id: "invitation", label: "Invitation", ar: "الدعوة" },
  { id: "details", label: "Details card", ar: "بطاقة التفاصيل" },
  { id: "envelope", label: "Envelope", ar: "الظرف" },
];

type Tool = "words" | "colour" | "finish" | "back" | "details" | "details-back" | "paper" | "liner" | "address";
const TOOLS: Record<Item, { id: Tool; label: string; icon: ReactNode; face: "front" | "back" }[]> = {
  invitation: [
    { id: "words", label: "Words", icon: <Type className="size-4" />, face: "front" },
    { id: "colour", label: "Colour", icon: <Palette className="size-4" />, face: "front" },
    { id: "finish", label: "Finish", icon: <Sparkles className="size-4" />, face: "front" },
    { id: "back", label: "Back", icon: <RotateCcw className="size-4" />, face: "back" },
  ],
  details: [
    { id: "details", label: "Details", icon: <Type className="size-4" />, face: "front" },
    { id: "details-back", label: "Back", icon: <RotateCcw className="size-4" />, face: "back" },
  ],
  envelope: [
    { id: "paper", label: "Paper", icon: <Mail className="size-4" />, face: "front" },
    { id: "liner", label: "Liner", icon: <Palette className="size-4" />, face: "back" },
    { id: "address", label: "Addresses", icon: <Type className="size-4" />, face: "front" },
  ],
};

/**
 * The card studio — a stationer's desk. The whole suite (invitation, details
 * card, envelope) lies on a table; pick a piece up to edit it, turn it over
 * for its back, and finish by "sending" it: the envelope opens, the card
 * slides out, and it can be shared straight to a chat. English or Arabic.
 * Works without an account; the suite is kept on this device.
 */
export function CardStudio({ template, initial, fromLink }: { template: TemplateManifest; initial: CardSuite; fromLink: boolean }) {
  const [state, dispatch] = useReducer(reducer, { suite: initial, past: [] });
  const { suite } = state;
  const [item, setItem] = useState<Item>("invitation");
  const [tool, setTool] = useState<Tool>("words");
  const [faces, setFaces] = useState<Record<Item, "front" | "back">>({ invitation: "front", details: "front", envelope: "front" });
  const [desk, chooseDesk] = useDesk();
  const [sending, setSending] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  const set = useCallback<SetSuite>((update) => dispatch({ type: "set", update }), []);
  const ar = suite.text.lang === "ar";

  // A suite saved on this device (choices made on the product page win).
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const saved = parseSuite(JSON.parse(localStorage.getItem(storageKey(template.id)) ?? "null"));
      if (saved && saved.templateId === template.id) {
        dispatch({ type: "replace", suite: fromLink ? { ...saved, paletteId: initial.paletteId ?? saved.paletteId, options: { ...saved.options, ...initial.options } } : saved });
      }
    } catch {
      /* storage unavailable */
    }
  }, [template.id, initial, fromLink]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(template.id), JSON.stringify(suite));
      } catch {
        /* full (large photos) or unavailable */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [suite, template.id]);

  const options = resolveCardOptions(designCardDefaults(template.stationery), suite.options);
  const face = faces[item];

  function pick(next: Item) {
    setFlapOpen(false);
    setItem(next);
    setTool(TOOLS[next][0].id);
    setFaces((f) => ({ ...f, [next]: TOOLS[next][0].face }));
  }
  function chooseTool(t: (typeof TOOLS)[Item][number]) {
    // The liner is inside: open the flap to show it.
    setFlapOpen(t.id === "liner");
    setTool(t.id);
    setFaces((f) => ({ ...f, [item]: t.face }));
  }
  function turn() {
    setFlapOpen(false);
    const nextFace = face === "front" ? "back" : "front";
    setFaces((f) => ({ ...f, [item]: nextFace }));
    const match = TOOLS[item].find((t) => t.face === nextFace);
    if (match && TOOLS[item].find((t) => t.id === tool)?.face !== nextFace) setTool(match.id);
  }
  function save() {
    try {
      localStorage.setItem(storageKey(template.id), JSON.stringify(suite));
      toast.success(ar ? "تم الحفظ على هذا الجهاز" : "Saved on this device");
    } catch {
      toast.error("Couldn't save — your photo may be too large for this browser.");
    }
  }
  async function addPhoto(file: File) {
    try {
      const url = await downscale(file, 1600);
      set((s) => ({ ...s, photo: url }));
      toast.success("Photo added");
    } catch {
      toast.error("That image couldn't be read.");
    }
  }

  const pieceFor = (it: Item, f: "front" | "back"): Piece =>
    it === "invitation" ? f : it === "details" ? (f === "front" ? "enclosure-front" : "enclosure-back") : f === "front" ? "envelope-front" : "envelope-back";

  const dark = desk === "walnut";
  const chrome = dark ? "bg-black/35 text-white ring-1 ring-white/15" : "bg-white/75 text-foreground ring-1 ring-black/5";

  return (
    <DeskSurface desk={desk} className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center gap-3 px-4 py-3 sm:px-6">
        <Link href={productHref("cards", template.id)} aria-label="Back to the design" className={cn("grid size-10 place-items-center rounded-full backdrop-blur", chrome)}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-serif text-lg leading-tight sm:text-2xl sm:leading-none">{template.name}</p>
          <Link href="/invitations" className={cn("whitespace-nowrap text-xs underline-offset-4 hover:underline", dark ? "text-white/70" : "text-muted-foreground")}>
            Change design
          </Link>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <div role="radiogroup" aria-label="Language" className={cn("flex rounded-full p-1 backdrop-blur", chrome)}>
            {(["en", "ar"] as SuiteLang[]).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={suite.text.lang === l}
                onClick={() => set((s) => withLanguage(s, l, template.stationery.sample ?? {}))}
                className={cn("h-8 min-w-10 rounded-full px-3 text-sm transition", suite.text.lang === l ? (dark ? "bg-white text-black" : "bg-foreground text-background") : "")}
                style={l === "ar" ? { fontFamily: "var(--font-amiri), serif" } : undefined}
              >
                {l === "en" ? "EN" : "عربي"}
              </button>
            ))}
          </div>
          <div role="radiogroup" aria-label="Table" className={cn("hidden items-center gap-1.5 rounded-full p-1.5 backdrop-blur sm:flex", chrome)}>
            {(Object.keys(DESKS) as Desk[]).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={desk === d}
                aria-label={`${DESKS[d].label} table`}
                title={`${DESKS[d].label} table`}
                onClick={() => chooseDesk(d)}
                className={cn("size-6 rounded-full border border-black/15 ring-offset-1", desk === d && "ring-2 ring-current")}
                style={{ background: DESKS[d].swatch }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "undo" })}
            disabled={!state.past.length}
            aria-label="Undo"
            className={cn("hidden size-10 place-items-center rounded-full backdrop-blur transition disabled:opacity-40 sm:grid", chrome)}
          >
            <Undo2 className="size-4" />
          </button>
          <Button type="button" variant="outline" className="hidden rounded-full bg-white/80 text-foreground sm:inline-flex" onClick={save}>
            Save
          </Button>
          <Button type="button" className="rounded-full px-5" onClick={() => setSending(true)}>
            <Send className="rtl:-scale-x-100" /> {ar ? "أرسل" : "Send"}
          </Button>
        </div>
      </header>

      {/* The piece in hand */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-4 pt-2 lg:pe-[25rem]">
        <Tilt key={item}>
          <Flip face={face} front={<PieceSlot item={item} template={template} suite={suite} face="front" piece={pieceFor(item, "front")} />} back={<PieceSlot item={item} template={template} suite={suite} face="back" piece={pieceFor(item, "back")} open={flapOpen} />} />
        </Tilt>
        <div className="mt-5 flex items-center gap-2">
          <button type="button" onClick={turn} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium backdrop-blur transition hover:-translate-y-0.5", chrome)}>
            <RotateCcw className="size-4" /> {face === "front" ? "Turn over" : "Turn back"}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "undo" })}
            disabled={!state.past.length}
            aria-label="Undo last change"
            className={cn("grid size-10 place-items-center rounded-full backdrop-blur transition disabled:opacity-40 sm:hidden", chrome)}
          >
            <Undo2 className="size-4" />
          </button>
          {item === "envelope" && face === "back" ? (
            <button type="button" onClick={() => setFlapOpen((o) => !o)} aria-pressed={flapOpen} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium backdrop-blur transition hover:-translate-y-0.5", chrome)}>
              <Mail className="size-4" /> {flapOpen ? "Close the flap" : "Open the flap"}
            </button>
          ) : null}
          {item !== "envelope" ? (
            <button type="button" onClick={() => fileInput.current?.click()} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium backdrop-blur transition hover:-translate-y-0.5", chrome)}>
              <ImagePlus className="size-4" /> {suite.photo ? "Change photo" : "Add photo"}
            </button>
          ) : null}
        </div>

        {/* The rest of the suite, at the edge of the table */}
        <nav aria-label="Pieces" className="mt-6 flex items-end gap-4 sm:gap-7">
          {ITEMS.map((it) => {
            const active = it.id === item;
            const off = it.id === "details" && !suite.enclosure.enabled;
            return (
              <button key={it.id} type="button" onClick={() => pick(it.id)} aria-pressed={active} aria-label={ar ? it.ar : it.label} className="group flex flex-col items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "block transition duration-500 [filter:drop-shadow(0_8px_10px_rgb(0_0_0/0.22))]",
                    it.id === "envelope" ? "w-24 sm:w-28" : "w-14 sm:w-16",
                    active ? "-translate-y-2 scale-105" : "opacity-80 group-hover:-translate-y-1 group-hover:opacity-100",
                    off && "opacity-40",
                  )}
                >
                  <SuitePiece suite={suite} template={template} piece={pieceFor(it.id, "front")} sizes="120px" />
                </span>
                <span className={cn("text-xs font-medium", active ? "" : "opacity-70")} style={ar ? { fontFamily: "var(--font-amiri), serif" } : undefined}>
                  {ar ? it.ar : it.label}
                </span>
              </button>
            );
          })}
        </nav>
      </main>

      {/* Floating palette */}
      <aside className="relative z-10 mx-4 mb-4 overflow-hidden rounded-3xl bg-background/95 text-foreground shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/5 backdrop-blur-md lg:absolute lg:bottom-6 lg:end-6 lg:top-20 lg:m-0 lg:flex lg:w-[23rem] lg:flex-col">
        <div className="flex gap-1 border-b p-2">
          {TOOLS[item].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => chooseTool(t)}
              aria-pressed={tool === t.id}
              className={cn("flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition", tool === t.id ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground")}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {tool === "words" ? <WordsTool suite={suite} set={set} /> : null}
          {tool === "colour" ? <ColourTool template={template} suite={suite} set={set} /> : null}
          {tool === "finish" ? <FinishTool template={template} options={options} set={set} /> : null}
          {tool === "back" ? <BackTool template={template} suite={suite} set={set} onPhoto={() => fileInput.current?.click()} /> : null}
          {tool === "details" ? <DetailsTool suite={suite} set={set} /> : null}
          {tool === "details-back" ? <DetailsBackTool template={template} suite={suite} set={set} /> : null}
          {tool === "paper" ? <PaperTool suite={suite} set={set} /> : null}
          {tool === "liner" ? <LinerTool template={template} suite={suite} set={set} /> : null}
          {tool === "address" ? <AddressTool suite={suite} set={set} /> : null}
        </div>
      </aside>

      {sending ? <SendScene template={template} suite={suite} desk={desk} onClose={() => setSending(false)} /> : null}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void addPhoto(f);
          e.target.value = "";
        }}
      />
    </DeskSurface>
  );
}

// ── Stage: tilt and flip ────────────────────────────────────────────────────

/** Tilts its content gently towards the pointer, like a card held in the hand. */
function Tilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || reduced.current || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
  };
  const leave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="card-in-hand animate-[desk-lift_700ms_cubic-bezier(.2,.8,.2,1)] [perspective:1600px]">
      <div className="transition-transform duration-300 ease-out [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]">{children}</div>
    </div>
  );
}

function Flip({ face, front, back }: { face: "front" | "back"; front: ReactNode; back: ReactNode }) {
  return (
    <div className={cn("relative transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d]", face === "back" && "[transform:rotateY(180deg)]")}>
      <div className="[backface-visibility:hidden]">{front}</div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
    </div>
  );
}

function PieceSlot({ item, template, suite, piece, open = false }: { item: Item; template: TemplateManifest; suite: CardSuite; face: "front" | "back"; piece: Piece; open?: boolean }) {
  const shape = item === "invitation" ? cardShape(template.stationery, suite.options) : "portrait";
  const width =
    item === "envelope"
      ? "w-[min(36rem,86vw,calc((100dvh-17rem)*1.4))]"
      : item === "details"
        ? "w-[min(19rem,64vw,calc((100dvh-17rem)*0.714))]"
        : shape === "landscape"
          ? "w-[min(36rem,86vw,calc((100dvh-17rem)*1.4))]"
          : shape === "square"
            ? "w-[min(26rem,76vw,calc(100dvh-17rem))]"
            : "w-[min(24rem,70vw,calc((100dvh-17rem)*0.714))]";
  return (
    <div className={cn(width, "[filter:drop-shadow(0_28px_24px_rgb(0_0_0/0.28))_drop-shadow(0_4px_6px_rgb(0_0_0/0.14))]")}>
      {/* An open flap rises above the envelope, so the envelope steps back to make room. */}
      <div className="origin-bottom transition-transform duration-[900ms] ease-[cubic-bezier(.5,0,.2,1)]" style={{ transform: open ? "scale(0.64)" : undefined }}>
        <SuitePiece suite={suite} template={template} piece={piece} envelopeOpen={open} sizes="(min-width: 1024px) 36rem, 86vw" />
      </div>
    </div>
  );
}

// ── Palette tools ───────────────────────────────────────────────────────────

function Group({ title, value, children, aside }: { title: string; value?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">
          {title}
          {value ? <span className="ms-2 font-normal text-muted-foreground">{value}</span> : null}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Chips<T extends string>({ value, options, onChange, label, render, cols = 3 }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; render: (v: T) => ReactNode; cols?: number }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn("min-h-10 rounded-full border px-3 py-1.5 text-xs transition", value === o ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40")}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}

function WordsTool({ suite, set }: { suite: CardSuite; set: SetSuite }) {
  const t = suite.text;
  const ar = t.lang === "ar";
  const bind = (key: keyof CardSuite["text"]) => ({
    value: t[key],
    dir: ar ? ("rtl" as const) : undefined,
    onChange: (e: { target: { value: string } }) => set((s) => ({ ...s, text: { ...s.text, [key]: e.target.value } })),
  });
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={ar ? "الاسم الأول" : "First name"}>
          <Input maxLength={80} {...bind("partnerOne")} />
        </Field>
        <Field label={ar ? "الاسم الثاني" : "Second name"}>
          <Input maxLength={80} {...bind("partnerTwo")} />
        </Field>
      </div>
      <Field label={ar ? "السطر أعلى الأسماء" : "Line above the names"}>
        <Input maxLength={140} {...bind("eyebrow")} />
      </Field>
      <Field label={ar ? "سطر الدعوة" : "Invitation line"}>
        <Textarea rows={2} maxLength={200} {...bind("line")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={ar ? "التاريخ" : "Date"}>
          <Input type="date" value={t.date} onChange={(e) => set((s) => ({ ...s, text: { ...s.text, date: e.target.value } }))} />
        </Field>
        <Field label={ar ? "الوقت" : "Time"}>
          <Input maxLength={40} {...bind("time")} />
        </Field>
      </div>
      <Field label={ar ? "المكان" : "Venue"}>
        <Input maxLength={160} {...bind("place")} />
      </Field>
    </div>
  );
}

const BACKGROUNDS = [
  [null, "Design"],
  ["#ffffff", "White"],
  ["#f6f1e7", "Ivory"],
  ["#efe7dc", "Oatmeal"],
  ["#151515", "Black"],
] as const;

function ColourTool({ template, suite, set }: { template: TemplateManifest; suite: CardSuite; set: SetSuite }) {
  const palette = template.palettes.find((p) => p.id === suite.paletteId) ?? template.palettes[0];
  return (
    <>
      <Group title="Theme" value={palette.label}>
        <div role="radiogroup" aria-label="Theme colour" className="flex flex-wrap gap-3">
          {template.palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === palette.id}
              aria-label={p.label}
              title={p.label}
              onClick={() => set((s) => ({ ...s, paletteId: p.id === template.palettes[0].id ? null : p.id }))}
              className={cn("size-10 rounded-full ring-offset-2 ring-offset-background", p.id === palette.id ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/30")}
            >
              <span className="block size-full rounded-full border border-black/10" style={{ background: paletteSwatch(template, p.id).background }} />
            </button>
          ))}
        </div>
      </Group>
      <Group title="Paper colour" value={BACKGROUNDS.find(([v]) => v === suite.background)?.[1] ?? "Custom"}>
        <div className="flex flex-wrap items-center gap-3">
          {BACKGROUNDS.map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={suite.background === value}
              aria-label={label}
              title={label}
              onClick={() => set((s) => ({ ...s, background: value }))}
              className={cn("relative size-10 rounded-full border border-black/15 ring-offset-2 ring-offset-background", suite.background === value && "ring-2 ring-foreground")}
              style={value ? { background: value } : undefined}
            >
              {value ? null : <span className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/50" />}
            </button>
          ))}
          <label className="relative size-10 cursor-pointer rounded-full border border-black/15 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" title="Any colour">
            <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={suite.background ?? "#ffffff"} onChange={(e) => set((s) => ({ ...s, background: e.target.value }))} aria-label="Any paper colour" />
          </label>
        </div>
      </Group>
    </>
  );
}

function FinishTool({ template, options, set }: { template: TemplateManifest; options: CardOptions; set: SetSuite }) {
  const [help, setHelp] = useState(false);
  const opt = <K extends keyof CardOptions>(key: K, value: CardOptions[K]) => set((s) => ({ ...s, options: { ...s.options, [key]: value } }));
  return (
    <>
      <Group title="Opening blessing">
        <Chips
          label="Opening blessing"
          value={options.blessing}
          options={BLESSINGS}
          cols={2}
          onChange={(v) => opt("blessing", v)}
          render={(v) =>
            v === "none" ? (
              "None"
            ) : (
              <span lang="ar" dir="rtl" className="text-sm" style={{ fontFamily: "var(--font-amiri), serif" }}>
                بسم الله الرحمن الرحيم
              </span>
            )
          }
        />
      </Group>
      {canRotate(template.stationery.shape ?? "portrait", template.stationery.layout) ? (
        <Group title="Orientation">
          <Chips label="Orientation" value={options.orientation} options={["portrait", "landscape"] as const} cols={2} onChange={(v) => opt("orientation", v)} render={(v) => CARD_OPTION_INFO.orientation[v]} />
        </Group>
      ) : null}
      <Group title="Foil" value={CARD_OPTION_INFO.foil[options.foil]}>
        <div role="radiogroup" aria-label="Foil" className="flex gap-3">
          {FOILS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={options.foil === f}
              aria-label={CARD_OPTION_INFO.foil[f]}
              title={CARD_OPTION_INFO.foil[f]}
              onClick={() => opt("foil", f)}
              className={cn("grid size-10 place-items-center rounded-full ring-offset-2 ring-offset-background", options.foil === f ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/30")}
            >
              {f === "none" ? (
                <span className="relative size-9 rounded-full border-2 border-foreground/60">
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-[115%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/60" />
                </span>
              ) : (
                <span className="size-9 rounded-full" style={{ background: `linear-gradient(135deg, ${FOIL_TONES[f].dark}, ${FOIL_TONES[f].light} 45%, ${FOIL_TONES[f].base} 70%, ${FOIL_TONES[f].dark})` }} />
              )}
            </button>
          ))}
        </div>
      </Group>
      <Group title="Edge">
        <Chips label="Edge" value={options.silhouette} options={SILHOUETTES} onChange={(v) => opt("silhouette", v)} render={(v) => CARD_OPTION_INFO.silhouette[v]} />
      </Group>
      <Group
        title="Paper"
        value={CARD_OPTION_INFO.paper[options.paper][0]}
        aside={
          <button type="button" className="text-xs underline underline-offset-4" onClick={() => setHelp((h) => !h)}>
            What&apos;s the difference?
          </button>
        }
      >
        <Chips label="Paper" value={options.paper} options={PAPERS} cols={2} onChange={(v) => opt("paper", v)} render={(v) => CARD_OPTION_INFO.paper[v][0]} />
        {help ? <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">{CARD_OPTION_INFO.paper[options.paper][1]}</p> : null}
      </Group>
    </>
  );
}

const BACK_LABELS: Record<BackLayout, string> = { blank: "Blank", monogram: "Monogram", photo: "Photo & note", note: "Note", pattern: "Pattern" };

function QrGroup({ on, url, onToggle, onUrl }: { on: boolean; url: string; onToggle: (v: boolean) => void; onUrl: (v: string) => void }) {
  return (
    <Group title="QR code" aside={<Switch checked={on} onCheckedChange={onToggle} aria-label="Print a QR code" />}>
      <p className="text-xs text-muted-foreground">Send guests to your wedding website, a map or a form.</p>
      {on ? <Input className="mt-2" type="url" inputMode="url" placeholder="https://" maxLength={500} value={url} onChange={(e) => onUrl(e.target.value)} aria-label="QR link" /> : null}
    </Group>
  );
}

function BackTool({ template, suite, set, onPhoto }: { template: TemplateManifest; suite: CardSuite; set: SetSuite; onPhoto: () => void }) {
  return (
    <>
      <Group title="Back" value={BACK_LABELS[suite.back.layout]}>
        <div className="grid grid-cols-3 gap-2.5">
          {BACK_LAYOUTS.map((l) => (
            <button key={l} type="button" aria-pressed={suite.back.layout === l} onClick={() => set((s) => ({ ...s, back: { ...s.back, layout: l } }))} className="text-center text-xs">
              <span className={cn("grid aspect-square place-items-center rounded-2xl border-2 bg-secondary/50 p-2", suite.back.layout === l ? "border-foreground" : "border-transparent hover:border-foreground/25")}>
                <span className="block w-[62%]">
                  <SuitePiece suite={{ ...suite, back: { ...suite.back, layout: l, qr: false } }} template={template} piece="back" sizes="90px" />
                </span>
              </span>
              <span className="mt-1 block">{BACK_LABELS[l]}</span>
            </button>
          ))}
        </div>
      </Group>
      {suite.back.layout === "photo" ? (
        <Group title="Photo">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onPhoto}>
              <ImagePlus /> {suite.photo ? "Change" : "Add photo"}
            </Button>
            {suite.photo ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => set((s) => ({ ...s, photo: null }))}>
                <Trash2 /> Remove
              </Button>
            ) : null}
          </div>
        </Group>
      ) : null}
      {suite.back.layout === "photo" || suite.back.layout === "note" ? (
        <Group title="Note">
          <Textarea rows={3} maxLength={400} dir={suite.text.lang === "ar" ? "rtl" : undefined} value={suite.back.note} onChange={(e) => set((s) => ({ ...s, back: { ...s.back, note: e.target.value } }))} />
        </Group>
      ) : null}
      <QrGroup on={suite.back.qr} url={suite.back.qrUrl} onToggle={(v) => set((s) => ({ ...s, back: { ...s.back, qr: v } }))} onUrl={(v) => set((s) => ({ ...s, back: { ...s.back, qrUrl: v } }))} />
    </>
  );
}

function DetailsTool({ suite, set }: { suite: CardSuite; set: SetSuite }) {
  const e = suite.enclosure;
  const rtl = suite.text.lang === "ar" ? ("rtl" as const) : undefined;
  const setSection = (i: number, patch: Partial<{ title: string; body: string }>) =>
    set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: s.enclosure.sections.map((x, j) => (j === i ? { ...x, ...patch } : x)) } }));
  return (
    <>
      <Group title="Include a details card" aside={<Switch checked={e.enabled} onCheckedChange={(v) => set((s) => ({ ...s, enclosure: { ...s.enclosure, enabled: v } }))} aria-label="Include a details card" />}>
        <p className="text-xs text-muted-foreground">Reception, dress code, where to stay — printed to match your invitation.</p>
      </Group>
      {e.enabled ? (
        <>
          <Group title="Heading">
            <Input dir={rtl} maxLength={80} value={e.heading} onChange={(ev) => set((s) => ({ ...s, enclosure: { ...s.enclosure, heading: ev.target.value } }))} />
          </Group>
          <Group title="Details" value={`${e.sections.length}/6`}>
            <div className="grid gap-3">
              {e.sections.map((sec, i) => (
                <div key={i} className="grid gap-2 rounded-2xl bg-secondary/50 p-3">
                  <div className="flex gap-2">
                    <Input dir={rtl} aria-label="Title" maxLength={80} value={sec.title} onChange={(ev) => setSection(i, { title: ev.target.value })} />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: s.enclosure.sections.filter((_, j) => j !== i) } }))}>
                      <Trash2 />
                    </Button>
                  </div>
                  <Textarea dir={rtl} aria-label="Details" rows={2} maxLength={400} value={sec.body} onChange={(ev) => setSection(i, { body: ev.target.value })} />
                </div>
              ))}
              {e.sections.length < 6 ? (
                <Button type="button" variant="outline" size="sm" onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: [...s.enclosure.sections, { title: "", body: "" }] } }))}>
                  <Plus /> Add a detail
                </Button>
              ) : null}
            </div>
          </Group>
        </>
      ) : null}
    </>
  );
}

const ENCLOSURE_BACK_LABELS: Record<EnclosureBack, string> = { blank: "Blank", monogram: "Monogram", pattern: "Pattern" };

function DetailsBackTool({ template, suite, set }: { template: TemplateManifest; suite: CardSuite; set: SetSuite }) {
  return (
    <>
      <Group title="Back" value={ENCLOSURE_BACK_LABELS[suite.enclosure.back]}>
        <div className="grid grid-cols-3 gap-2.5">
          {ENCLOSURE_BACKS.map((l) => (
            <button key={l} type="button" aria-pressed={suite.enclosure.back === l} onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, back: l } }))} className="text-center text-xs">
              <span className={cn("grid aspect-square place-items-center rounded-2xl border-2 bg-secondary/50 p-2", suite.enclosure.back === l ? "border-foreground" : "border-transparent hover:border-foreground/25")}>
                <span className="block w-[58%]">
                  <SuitePiece suite={{ ...suite, enclosure: { ...suite.enclosure, back: l, qr: false } }} template={template} piece="enclosure-back" sizes="90px" />
                </span>
              </span>
              <span className="mt-1 block">{ENCLOSURE_BACK_LABELS[l]}</span>
            </button>
          ))}
        </div>
      </Group>
      <QrGroup
        on={suite.enclosure.qr}
        url={suite.enclosure.qrUrl}
        onToggle={(v) => set((s) => ({ ...s, enclosure: { ...s.enclosure, qr: v } }))}
        onUrl={(v) => set((s) => ({ ...s, enclosure: { ...s.enclosure, qrUrl: v } }))}
      />
    </>
  );
}

function PaperTool({ suite, set }: { suite: CardSuite; set: SetSuite }) {
  return (
    <Group title="Envelope" value={ENVELOPE_COLORS[suite.envelope.color][0]}>
      <div role="radiogroup" aria-label="Envelope colour" className="grid grid-cols-4 gap-2.5">
        {(Object.keys(ENVELOPE_COLORS) as EnvelopeColor[]).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={suite.envelope.color === c}
            aria-label={ENVELOPE_COLORS[c][0]}
            title={ENVELOPE_COLORS[c][0]}
            onClick={() => set((s) => ({ ...s, envelope: { ...s.envelope, color: c } }))}
            className={cn("relative aspect-[7/5] overflow-hidden rounded-md border border-black/15 ring-offset-2 ring-offset-background", suite.envelope.color === c && "ring-2 ring-foreground")}
            style={{ background: ENVELOPE_COLORS[c][1] }}
          >
            <svg aria-hidden viewBox="0 0 70 50" className="absolute inset-0 size-full">
              <path d="M0 0 L35 26 L70 0" fill="none" stroke="rgb(0 0 0 / 0.25)" strokeWidth="1.2" />
            </svg>
          </button>
        ))}
      </div>
    </Group>
  );
}

function LinerTool({ template, suite, set }: { template: TemplateManifest; suite: CardSuite; set: SetSuite }) {
  return (
    <Group title="Liner" value={LINER_LABELS[suite.envelope.liner]}>
      <div role="radiogroup" aria-label="Liner" className="grid grid-cols-4 gap-3" style={suiteVars(template, suite)}>
        {LINERS.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={suite.envelope.liner === l} onClick={() => set((s) => ({ ...s, envelope: { ...s.envelope, liner: l } }))} className="flex flex-col items-center gap-1 text-[0.7rem]">
            <span className={cn("relative block size-12 overflow-hidden rounded-full border border-black/10 bg-white ring-offset-2 ring-offset-background", suite.envelope.liner === l && "ring-2 ring-foreground")}>
              {l === "none" ? <span className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/40" /> : <LinerFill liner={l} ornament={template.stationery.ornament} className="absolute inset-0" />}
            </span>
            {LINER_LABELS[l]}
          </button>
        ))}
      </div>
    </Group>
  );
}

function AddressTool({ suite, set }: { suite: CardSuite; set: SetSuite }) {
  const env = suite.envelope;
  const rtl = suite.text.lang === "ar" ? ("rtl" as const) : undefined;
  const setEnv = (patch: Partial<CardSuite["envelope"]>) => set((s) => ({ ...s, envelope: { ...s.envelope, ...patch } }));
  return (
    <>
      <Group title="Return address">
        <Textarea dir={rtl} rows={3} maxLength={300} value={env.returnAddress} onChange={(e) => setEnv({ returnAddress: e.target.value })} />
      </Group>
      <Group title="Guest (sample)">
        <div className="grid gap-2">
          <Input dir={rtl} aria-label="Guest name" maxLength={120} value={env.guestName} onChange={(e) => setEnv({ guestName: e.target.value })} />
          <Textarea dir={rtl} aria-label="Guest address" rows={2} maxLength={300} value={env.guestAddress} onChange={(e) => setEnv({ guestAddress: e.target.value })} />
        </div>
      </Group>
    </>
  );
}

// ── Send: the envelope opens, the card slides out, share it ─────────────────

const ALL_PIECES: Piece[] = ["front", "back", "enclosure-front", "enclosure-back", "envelope-front", "envelope-back"];

function SendScene({ template, suite, desk, onClose }: { template: TemplateManifest; suite: CardSuite; desk: Desk; onClose: () => void }) {
  const [stage, setStage] = useState(0);
  const [busy, setBusy] = useState<"share" | "zip" | null>(null);
  const exportRoot = useRef<HTMLDivElement>(null);
  const ar = suite.text.lang === "ar";
  const pieces = ALL_PIECES.filter((p) => suite.enclosure.enabled || !p.startsWith("enclosure"));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = window.setTimeout(() => setStage(1), reduced ? 0 : 500);
    const b = window.setTimeout(() => setStage(2), reduced ? 0 : 1300);
    const c = window.setTimeout(() => setStage(3), reduced ? 0 : 2500);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const name = `${suite.text.partnerOne}-${suite.text.partnerTwo}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "wedding";

  async function render(which: "front" | "all"): Promise<{ piece: Piece; png: string }[]> {
    await new Promise((r) => setTimeout(r, 80));
    const root = exportRoot.current;
    if (!root) throw new Error("not ready");
    await document.fonts.ready;
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(imgs.map((img) => (img.complete ? img.decode().catch(() => undefined) : new Promise((r) => img.addEventListener("load", r, { once: true })))));
    const { toPng } = await import("html-to-image");
    const nodes = Array.from(root.children) as HTMLElement[];
    const wanted = which === "front" ? [0] : nodes.map((_, i) => i);
    const out: { piece: Piece; png: string }[] = [];
    for (const i of wanted) out.push({ piece: pieces[i], png: await toPng(nodes[i], { pixelRatio: 2, cacheBust: true }) });
    return out;
  }

  async function share() {
    setBusy("share");
    try {
      const [{ png }] = await render("front");
      const blob = await (await fetch(png)).blob();
      const file = new File([blob], `${name}-invitation.png`, { type: "image/png" });
      const text = ar ? "يسعدنا دعوتكم لحفل زفافنا 💌" : "You're invited to our wedding 💌";
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        const a = document.createElement("a");
        a.href = png;
        a.download = file.name;
        a.click();
        toast.success(ar ? "تم تنزيل البطاقة — أرسلها في محادثة" : "Card downloaded — attach it to any chat");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Couldn't create the image. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function zip() {
    setBusy("zip");
    try {
      const files = await render("all");
      const { default: JSZip } = await import("jszip");
      const z = new JSZip();
      files.forEach((f, i) => z.file(`${String(i + 1).padStart(2, "0")}-${f.piece}.png`, f.png.split(",")[1], { base64: true }));
      const blob = await z.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name}-${template.id}-suite.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch {
      toast.error("Couldn't create the files. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Send your invitation" className="fixed inset-0 z-50 overflow-y-auto">
      <DeskSurface desk={desk} className="min-h-full">
        <button type="button" onClick={onClose} aria-label="Back to the desk" className="absolute end-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur">
          <X className="size-5" />
        </button>
        <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Opening template={template} suite={suite} stage={stage} />
          <div className="flex flex-col items-center gap-8">
            <Phone template={template} suite={suite} ar={ar} />
            <div className="flex w-full max-w-xs flex-col gap-2.5">
              <Button type="button" size="lg" className="h-12 rounded-full" onClick={share} disabled={busy !== null}>
                {busy === "share" ? <Loader2 className="animate-spin" /> : <Share2 />} {ar ? "شارك البطاقة" : "Share the card"}
              </Button>
              <Button type="button" size="lg" variant="outline" className="h-12 rounded-full bg-white/85 text-foreground" onClick={zip} disabled={busy !== null}>
                {busy === "zip" ? <Loader2 className="animate-spin" /> : <Download />} {ar ? "تنزيل كل القطع" : "Download the whole suite"}
              </Button>
              <p className={cn("text-center text-xs", desk === "walnut" ? "text-white/75" : "text-muted-foreground")}>
                <Check className="me-1 inline size-3.5" />
                {ar ? "محفوظ على هذا الجهاز · الطباعة قريباً" : "Saved on this device · printing coming soon"}
              </p>
            </div>
          </div>
        </div>
      </DeskSurface>
      {busy ? (
        <div ref={exportRoot} aria-hidden className="pointer-events-none fixed -left-[12000px] top-0 flex flex-col gap-10">
          {pieces.map((p) => (
            <div key={p} style={{ width: p.startsWith("envelope") ? 1050 : 900 }}>
              <SuitePiece suite={suite} template={template} piece={p} sizes="1800px" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The envelope opens and the invitation rises out of it. */
function Opening({ template, suite, stage }: { template: TemplateManifest; suite: CardSuite; stage: number }) {
  const [, paper] = ENVELOPE_COLORS[suite.envelope.color];
  const vars = suiteVars(template, suite);
  const landscape = cardShape(template.stationery, suite.options) === "landscape";
  return (
    <div className="relative mx-auto mt-[min(18%,6rem)] aspect-[7/8] w-full max-w-[34rem]" style={vars as CSSProperties}>
      {/* inside of the envelope */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] rounded-sm" style={{ background: `color-mix(in oklab, ${paper} 80%, black)` }} />
      {/* the card: rises right out of the envelope, then is laid in front of it */}
      <div
        className={cn("absolute left-1/2 -translate-x-1/2 transition-[bottom] ease-[cubic-bezier(.2,.8,.2,1)]", stage >= 3 ? "duration-[900ms]" : "duration-[1200ms]", landscape ? "w-[74%]" : "w-[48%]")}
        style={{ bottom: stage >= 3 ? (landscape ? "21%" : "8%") : stage >= 2 ? "51%" : "6%", zIndex: stage >= 3 ? 20 : 2 }}
      >
        <div className="[filter:drop-shadow(0_18px_20px_rgb(0_0_0/0.25))]">
          <SuitePiece suite={suite} template={template} piece="front" sizes="34rem" />
        </div>
      </div>
      {/* the flap, opening on its liner */}
      <div className="absolute inset-x-0 [perspective:1200px]" style={{ bottom: "50%", height: "34%", zIndex: stage >= 1 ? 1 : 11 }}>
        <div
          className="relative size-full origin-bottom transition-transform duration-[900ms] ease-[cubic-bezier(.5,0,.2,1)] [transform-style:preserve-3d]"
          style={{ transform: stage >= 1 ? "rotateX(0deg)" : "rotateX(180deg)" }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)", background: paper }}>
            <LinerFill liner={suite.envelope.liner} ornament={template.stationery.ornament} className="absolute inset-x-[4%] bottom-0 top-[7%] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)", background: paper, filter: "brightness(0.97)" }} />
        </div>
      </div>
      {/* the front pocket */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[50%] shadow-[0_30px_50px_-24px_rgb(0_0_0/0.5)]" style={{ background: paper, clipPath: "polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%)" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.07] to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 h-[50%]">
        <EnvelopeName suite={suite} paper={paper} />
      </div>
    </div>
  );
}

function EnvelopeName({ suite, paper }: { suite: CardSuite; paper: string }) {
  const dark = parseInt(paper.slice(1, 3), 16) * 0.3 + parseInt(paper.slice(3, 5), 16) * 0.59 + parseInt(paper.slice(5, 7), 16) * 0.11 < 110;
  return (
    <p dir={suite.text.lang === "ar" ? "rtl" : undefined} className="absolute inset-x-0 bottom-[16%] text-center font-inv-accent text-[clamp(1.2rem,3.4vw,2rem)]" style={{ color: dark ? "rgb(255 255 255 / 0.9)" : "rgb(30 26 22 / 0.8)" }}>
      {suite.envelope.guestName}
    </p>
  );
}

/** How a guest receives it: the card arriving in a chat on a phone. */
function Phone({ template, suite, ar }: { template: TemplateManifest; suite: CardSuite; ar: boolean }) {
  const initials = `${Array.from(suite.text.partnerOne)[0] ?? ""}${Array.from(suite.text.partnerTwo)[0] ?? ""}`;
  return (
    <div className="w-[17rem] rounded-[2.6rem] bg-neutral-900 p-2.5 shadow-[0_40px_70px_-30px_rgb(0_0_0/0.6)]">
      <div dir={ar ? "rtl" : "ltr"} className="overflow-hidden rounded-[2.1rem] bg-[#efe9e0]">
        <div className="flex items-center gap-2.5 bg-white/90 px-4 pb-2.5 pt-7">
          <span className="grid size-8 place-items-center rounded-full bg-neutral-800 text-xs font-medium text-white">{initials}</span>
          <div className="text-start">
            <p className="text-sm font-medium leading-tight text-neutral-900">{suite.text.partnerOne} {ar ? "و" : "&"} {suite.text.partnerTwo}</p>
            <p className="text-[0.65rem] text-neutral-500">{ar ? "متصل الآن" : "online"}</p>
          </div>
        </div>
        <div className="flex h-[25rem] flex-col justify-end gap-2 bg-[radial-gradient(circle,rgb(0_0_0/0.04)_1px,transparent_1.5px)] bg-[length:14px_14px] p-3">
          <div className="max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-white p-1.5 shadow-sm">
            <div className="overflow-hidden rounded-xl">
              <SuitePiece suite={suite} template={template} piece="front" sizes="220px" />
            </div>
            <p className="px-1.5 pt-1.5 text-start text-[0.8rem] text-neutral-800">{ar ? "يسعدنا دعوتكم لحفل زفافنا 💌" : "You're invited to our wedding 💌"}</p>
            <p className="px-1.5 text-end text-[0.6rem] text-neutral-400">7:00</p>
          </div>
          <div className="self-end rounded-2xl rounded-se-sm bg-[#d8f3c9] px-3 py-1.5 text-[0.8rem] text-neutral-800 shadow-sm">{ar ? "مبروك! سنكون هناك ❤️" : "Congratulations! We'll be there ❤️"}</div>
        </div>
      </div>
    </div>
  );
}

// ── Photos ──────────────────────────────────────────────────────────────────

async function downscale(file: File, max: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Keep the envelope's flat view importable from here for tests and reuse.
export { EnvelopeView };
