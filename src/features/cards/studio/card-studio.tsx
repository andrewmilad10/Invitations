"use client";

import { Download, ImagePlus, Loader2, Plus, QrCode, Trash2, Type, Undo2, X, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BLESSINGS, CARD_OPTION_INFO, FOIL_TONES, FOILS, PAPERS, resolveCardOptions, SILHOUETTES, type CardOptions } from "@/core/card/options";
import { BACK_LAYOUTS, ENCLOSURE_BACKS, ENVELOPE_COLORS, LINER_LABELS, LINERS, parseSuite, type BackLayout, type CardSuite, type EnclosureBack, type EnvelopeColor } from "@/core/card/suite";
import { canRotate, cardShape, designCardDefaults, type TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { paletteSwatch } from "@/features/marketing/gallery/design-card";
import { productHref } from "@/features/marketing/products";
import { LinerFill } from "./envelope";
import { SuitePiece, type Piece } from "./pieces";

// ── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "front", label: "Invitation Front" },
  { id: "back", label: "Invitation Back" },
  { id: "enclosure-front", label: "Enclosure Front" },
  { id: "enclosure-back", label: "Enclosure Back" },
  { id: "envelope", label: "Envelope" },
  { id: "review", label: "Review" },
] as const;
type Step = (typeof STEPS)[number]["id"];

const BACK_LABELS: Record<BackLayout, string> = { blank: "Blank", monogram: "Monogram", photo: "Photo & note", note: "Note", pattern: "Pattern" };
const ENCLOSURE_BACK_LABELS: Record<EnclosureBack, string> = { blank: "Blank", monogram: "Monogram", pattern: "Pattern" };
const BACKGROUNDS = [
  [null, "Design colour"],
  ["#ffffff", "White"],
  ["#f6f1e7", "Ivory"],
  ["#efe7dc", "Oatmeal"],
  ["#151515", "Black"],
] as const;

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

/**
 * The card studio: design the whole suite — invitation front and back, a
 * details enclosure and the envelope — then review and download it. Works
 * without an account; the design is kept on this device.
 */
export function CardStudio({ template, initial, fromLink }: { template: TemplateManifest; initial: CardSuite; fromLink: boolean }) {
  const [state, dispatch] = useReducer(reducer, { suite: initial, past: [] });
  const { suite } = state;
  const [step, setStep] = useState<Step>("front");
  const [zoom, setZoom] = useState(1);
  const fileInput = useRef<HTMLInputElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  const set = useCallback((update: (s: CardSuite) => CardSuite) => dispatch({ type: "set", update }), []);

  // Pick up a design saved on this device (choices made on the product page win).
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

  // Keep it saved on this device as they work.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(template.id), JSON.stringify(suite));
      } catch {
        /* storage full or unavailable (large photos) */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [suite, template.id]);

  const options = resolveCardOptions(designCardDefaults(template.stationery), suite.options);
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const next = STEPS[stepIndex + 1];

  function save() {
    try {
      localStorage.setItem(storageKey(template.id), JSON.stringify(suite));
      toast.success("Saved on this device");
    } catch {
      toast.error("Couldn't save — your photo may be too large for this browser.");
    }
  }

  async function addPhoto(file: File) {
    try {
      const url = await downscale(file, 1600);
      set((s) => ({ ...s, photo: url, back: s.back.layout === "photo" || step !== "back" ? s.back : { ...s.back, layout: "photo" } }));
      toast.success("Photo added");
    } catch {
      toast.error("That image couldn't be read.");
    }
  }

  const piece: Piece | null =
    step === "front" ? "front" : step === "back" ? "back" : step === "enclosure-front" ? "enclosure-front" : step === "enclosure-back" ? "enclosure-back" : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground lg:h-dvh">
      {/* Steps */}
      <header className="sticky top-0 z-30 border-b bg-background lg:static">
        <div className="relative flex items-center">
          <nav aria-label="Card suite" className="flex flex-1 gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:justify-center sm:gap-6">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                aria-current={step === s.id ? "step" : undefined}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 px-2 py-4 text-sm transition-colors sm:text-[0.95rem]",
                  step === s.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <Link href={productHref("cards", template.id)} aria-label="Close" className="grid size-12 shrink-0 place-items-center text-foreground hover:bg-secondary">
            <X className="size-5" />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{template.name}</span> · free digital suite · printing coming soon
          </p>
          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <Link href="/invitations" className="hidden text-sm font-medium underline underline-offset-4 sm:inline">
              Change design
            </Link>
            <Button type="button" variant="outline" className="rounded-full px-5" onClick={save}>
              Save
            </Button>
            {next ? (
              <Button type="button" className="rounded-full px-5" onClick={() => setStep(next.id)}>
                Next: {next.label}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col-reverse lg:min-h-0 lg:flex-row">
        {/* Options */}
        <aside className="border-t p-5 sm:p-7 lg:min-h-0 lg:w-[26rem] lg:shrink-0 lg:overflow-y-auto lg:border-e lg:border-t-0">
          {step === "front" ? <FrontPanel template={template} suite={suite} options={options} set={set} firstField={firstField} /> : null}
          {step === "back" ? <BackPanel template={template} suite={suite} set={set} onPhoto={() => fileInput.current?.click()} /> : null}
          {step === "enclosure-front" ? <EnclosurePanel suite={suite} set={set} /> : null}
          {step === "enclosure-back" ? <EnclosureBackPanel template={template} suite={suite} set={set} /> : null}
          {step === "envelope" ? <EnvelopePanel template={template} suite={suite} set={set} /> : null}
          {step === "review" ? <ReviewPanel template={template} suite={suite} goTo={setStep} /> : null}
        </aside>

        {/* Canvas */}
        <main className="relative min-h-[58vh] flex-1 overflow-auto bg-[#ebebe8] lg:min-h-0">
          <button
            type="button"
            onClick={() => dispatch({ type: "undo" })}
            disabled={!state.past.length}
            className="absolute end-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-white/70 disabled:opacity-35"
          >
            <Undo2 className="size-4" /> Undo
          </button>
          {step === "review" ? (
            <ReviewCanvas template={template} suite={suite} goTo={setStep} />
          ) : step === "envelope" ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-8 p-8 sm:p-12" style={{ zoom }}>
              <div className="w-[min(34rem,90%)]">
                <SuitePiece suite={suite} template={template} piece="envelope-back" />
              </div>
              <div className="w-[min(34rem,90%)]">
                <SuitePiece suite={suite} template={template} piece="envelope-front" />
              </div>
            </div>
          ) : (step === "enclosure-front" || step === "enclosure-back") && !suite.enclosure.enabled ? (
            <div className="grid min-h-full place-items-center p-8 text-center">
              <div>
                <p className="font-serif text-3xl font-light">No enclosure</p>
                <p className="mt-2 text-sm text-muted-foreground">A details card for the reception, dress code and stays — printed to match.</p>
                <Button type="button" className="mt-6 rounded-full" onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, enabled: true } }))}>
                  <Plus /> Add enclosure
                </Button>
              </div>
            </div>
          ) : piece ? (
            <Stage template={template} suite={suite} piece={piece} zoom={zoom} />
          ) : null}

          {step !== "review" ? (
            <>
              {/* Quick actions */}
              <div className="absolute end-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                <QuickAction
                  icon={<Type className="size-4" />}
                  label="Edit text"
                  onClick={() => {
                    setStep("front");
                    setTimeout(() => firstField.current?.focus(), 50);
                  }}
                />
                <QuickAction icon={<ImagePlus className="size-4" />} label="Add photo" onClick={() => fileInput.current?.click()} />
                <QuickAction
                  icon={<QrCode className="size-4" />}
                  label="Add QR code"
                  accent
                  onClick={() => {
                    setStep("back");
                    set((s) => ({ ...s, back: { ...s.back, qr: true } }));
                  }}
                />
              </div>
              {/* Zoom */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
                <ZoomOut className="size-4 text-muted-foreground" />
                <input type="range" min={0.6} max={1.6} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" className="w-32 accent-foreground sm:w-48" />
                <ZoomIn className="size-4 text-muted-foreground" />
              </div>
            </>
          ) : null}
        </main>
      </div>

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
    </div>
  );
}

// ── Canvas ──────────────────────────────────────────────────────────────────

const INCHES: Record<string, [string, string]> = { portrait: ["5 in.", "7 in."], landscape: ["7 in.", "5 in."], square: ["5.5 in.", "5.5 in."], arch: ["5 in.", "7 in."], corner: ["5 in.", "7 in."] };

function Stage({ template, suite, piece, zoom }: { template: TemplateManifest; suite: CardSuite; piece: Piece; zoom: number }) {
  const enclosure = piece.startsWith("enclosure");
  const shape = enclosure ? "portrait" : cardShape(template.stationery, suite.options);
  const [w, h] = enclosure ? ["4.25 in.", "5.5 in."] : INCHES[shape];
  const width = shape === "landscape" ? 34 : shape === "square" ? 28 : enclosure ? 22 : 25;
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 pb-20 pt-14 sm:px-16">
      <p className="max-w-md text-center text-xs text-muted-foreground">Keep important words inside the dotted line. Colours and art run to the edge of the card.</p>
      <div className="flex items-center gap-4">
        <Ruler label={h} vertical />
        <div>
          <div className="relative" style={{ width: `min(${width * zoom}rem, ${shape === "landscape" ? 78 : 64}vw)` }}>
            <SuitePiece suite={suite} template={template} piece={piece} sizes="(min-width: 1024px) 40rem, 90vw" className="shadow-[0_24px_50px_-24px_rgb(0_0_0/0.45)]" />
            <div aria-hidden className="pointer-events-none absolute inset-[4%] border border-dashed border-black/30" />
          </div>
          <Ruler label={w} />
        </div>
      </div>
    </div>
  );
}

function Ruler({ label, vertical }: { label: string; vertical?: boolean }) {
  return vertical ? (
    <div aria-hidden className="hidden h-[min(70vh,34rem)] flex-col items-center sm:flex">
      <span className="w-px flex-1 bg-black/25" />
      <span className="py-2 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="w-px flex-1 bg-black/25" />
    </div>
  ) : (
    <div aria-hidden className="mt-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-black/25" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-black/25" />
    </div>
  );
}

function QuickAction({ icon, label, onClick, accent }: { icon: ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5", accent ? "bg-[#9eecec] text-foreground" : "bg-white text-foreground")}
    >
      {icon} {label}
    </button>
  );
}

// ── Panels ──────────────────────────────────────────────────────────────────

type SetSuite = (update: (s: CardSuite) => CardSuite) => void;

function Section({ title, value, children, aside }: { title: string; value?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-b py-6 first:pt-0 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-medium">
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
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Pills<T extends string>({ value, options, onChange, label, render }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; render: (v: T) => ReactNode }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn("min-h-12 rounded-xl border px-3 py-2 text-sm transition", value === o ? "border-foreground bg-secondary/60 font-medium" : "hover:border-foreground/40")}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}

function FrontPanel({ template, suite, options, set, firstField }: { template: TemplateManifest; suite: CardSuite; options: CardOptions; set: SetSuite; firstField: React.RefObject<HTMLInputElement | null> }) {
  const [paperHelp, setPaperHelp] = useState(false);
  const t = suite.text;
  const text = (key: keyof CardSuite["text"]) => ({
    value: t[key],
    onChange: (e: { target: { value: string } }) => set((s) => ({ ...s, text: { ...s.text, [key]: e.target.value } })),
  });
  const opt = <K extends keyof CardOptions>(key: K, value: CardOptions[K]) => set((s) => ({ ...s, options: { ...s.options, [key]: value } }));
  const palette = template.palettes.find((p) => p.id === suite.paletteId) ?? template.palettes[0];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium">Invitation Front</h2>
      <Section title="Wording">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input ref={firstField} maxLength={80} {...text("partnerOne")} />
            </Field>
            <Field label="Second name">
              <Input maxLength={80} {...text("partnerTwo")} />
            </Field>
          </div>
          <Field label="Line above the names">
            <Input maxLength={140} placeholder={template.stationery.sample?.eyebrow ?? "Together with their families"} {...text("eyebrow")} />
          </Field>
          <Field label="Invitation line">
            <Input maxLength={200} placeholder={template.stationery.sample?.line ?? "invite you to celebrate their wedding"} {...text("line")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" {...text("date")} />
            </Field>
            <Field label="Time">
              <Input maxLength={40} {...text("time")} />
            </Field>
          </div>
          <Field label="Venue">
            <Input maxLength={160} {...text("place")} />
          </Field>
        </div>
      </Section>

      <Section title="Theme colour" value={palette.label}>
        <div role="radiogroup" aria-label="Theme colour" className="flex flex-wrap gap-3">
          {template.palettes.map((p) => {
            const active = p.id === palette.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={p.label}
                title={p.label}
                onClick={() => set((s) => ({ ...s, paletteId: p.id === template.palettes[0].id ? null : p.id }))}
                className={cn("size-11 rounded-full ring-offset-2 ring-offset-background transition", active ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/30")}
              >
                <span className="block size-full rounded-full border border-black/10" style={{ background: paletteSwatch(template, p.id).background }} />
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Background colour" value={BACKGROUNDS.find(([v]) => v === suite.background)?.[1] ?? "Custom"}>
        <div className="flex flex-wrap items-center gap-3">
          {BACKGROUNDS.map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={suite.background === value}
              aria-label={label}
              title={label}
              onClick={() => set((s) => ({ ...s, background: value }))}
              className={cn("relative size-11 rounded-full border border-black/15 ring-offset-2 ring-offset-background", suite.background === value && "ring-2 ring-foreground")}
              style={value ? { background: value } : undefined}
            >
              {value ? null : <span className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/50" />}
            </button>
          ))}
          <label className="relative size-11 cursor-pointer rounded-full border border-black/15 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" title="Custom colour">
            <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={suite.background ?? "#ffffff"} onChange={(e) => set((s) => ({ ...s, background: e.target.value }))} aria-label="Custom background colour" />
          </label>
        </div>
      </Section>

      {canRotate(template.stationery.shape ?? "portrait", template.stationery.layout) ? (
        <Section title="Orientation" value={CARD_OPTION_INFO.orientation[options.orientation]}>
          <Pills label="Orientation" value={options.orientation} options={["portrait", "landscape"] as const} onChange={(v) => opt("orientation", v)} render={(v) => CARD_OPTION_INFO.orientation[v]} />
        </Section>
      ) : null}

      <Section title="Opening blessing" value={CARD_OPTION_INFO.blessing[options.blessing]}>
        <Pills
          label="Opening blessing"
          value={options.blessing}
          options={BLESSINGS}
          onChange={(v) => opt("blessing", v)}
          render={(v) =>
            v === "none" ? (
              "None"
            ) : (
              <span lang="ar" dir="rtl" className="text-base" style={{ fontFamily: "var(--font-amiri), serif" }}>
                بسم الله الرحمن الرحيم
              </span>
            )
          }
        />
      </Section>

      <Section title="Silhouette" value={CARD_OPTION_INFO.silhouette[options.silhouette]}>
        <Pills label="Silhouette" value={options.silhouette} options={SILHOUETTES} onChange={(v) => opt("silhouette", v)} render={(v) => CARD_OPTION_INFO.silhouette[v]} />
      </Section>

      <Section title="Foil" value={CARD_OPTION_INFO.foil[options.foil]}>
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
              className={cn("grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-background", options.foil === f ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/30")}
            >
              {f === "none" ? (
                <span className="relative size-10 rounded-full border-2 border-foreground/60">
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-[115%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/60" />
                </span>
              ) : (
                <span className="size-10 rounded-full" style={{ background: `linear-gradient(135deg, ${FOIL_TONES[f].dark}, ${FOIL_TONES[f].light} 45%, ${FOIL_TONES[f].base} 70%, ${FOIL_TONES[f].dark})` }} />
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Paper"
        value={CARD_OPTION_INFO.paper[options.paper][0]}
        aside={
          <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPaperHelp((v) => !v)}>
            What&apos;s the difference?
          </button>
        }
      >
        <Pills label="Paper" value={options.paper} options={PAPERS} onChange={(v) => opt("paper", v)} render={(v) => CARD_OPTION_INFO.paper[v][0]} />
        {paperHelp ? (
          <dl className="mt-4 grid gap-2 rounded-xl bg-secondary/50 p-4 text-sm">
            {PAPERS.map((p) => (
              <div key={p} className="grid grid-cols-[6.5rem_1fr] gap-3">
                <dt className="font-medium">{CARD_OPTION_INFO.paper[p][0]}</dt>
                <dd className="text-muted-foreground">{CARD_OPTION_INFO.paper[p][1]}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Section>
    </div>
  );
}

function LayoutTile({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className="group text-start">
      <span className={cn("grid aspect-[4/5] place-items-center overflow-hidden rounded-lg border-2 bg-secondary/40 p-3 transition", active ? "border-foreground" : "border-transparent group-hover:border-foreground/30")}>
        {children}
      </span>
      <span className="mt-1.5 block text-sm">{label}</span>
    </button>
  );
}

function QrField({ on, url, onToggle, onUrl }: { on: boolean; url: string; onToggle: (v: boolean) => void; onUrl: (v: string) => void }) {
  return (
    <Section title="QR code" aside={<Switch checked={on} onCheckedChange={onToggle} aria-label="Print a QR code" />}>
      <p className="text-sm text-muted-foreground">Link guests to your wedding website, a map or an RSVP form.</p>
      {on ? (
        <Field label="Link">
          <Input type="url" inputMode="url" placeholder="https://" maxLength={500} value={url} onChange={(e) => onUrl(e.target.value)} />
        </Field>
      ) : null}
    </Section>
  );
}

function BackPanel({ template, suite, set, onPhoto }: { template: TemplateManifest; suite: CardSuite; set: SetSuite; onPhoto: () => void }) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium">Invitation Back</h2>
      <Section title="Layout" value={BACK_LABELS[suite.back.layout]}>
        <div className="grid grid-cols-3 gap-3">
          {BACK_LAYOUTS.map((l) => (
            <LayoutTile key={l} active={suite.back.layout === l} label={BACK_LABELS[l]} onClick={() => set((s) => ({ ...s, back: { ...s.back, layout: l } }))}>
              <div className="w-[78%]">
                <SuitePiece suite={{ ...suite, back: { ...suite.back, layout: l, qr: false } }} template={template} piece="back" sizes="120px" className="shadow-sm" />
              </div>
            </LayoutTile>
          ))}
        </div>
      </Section>
      {suite.back.layout === "photo" ? (
        <Section title="Photo">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onPhoto}>
              <ImagePlus /> {suite.photo ? "Change photo" : "Add photo"}
            </Button>
            {suite.photo ? (
              <Button type="button" variant="ghost" onClick={() => set((s) => ({ ...s, photo: null }))}>
                <Trash2 /> Remove
              </Button>
            ) : null}
          </div>
        </Section>
      ) : null}
      {suite.back.layout === "photo" || suite.back.layout === "note" ? (
        <Section title="Note">
          <Textarea rows={3} maxLength={400} value={suite.back.note} onChange={(e) => set((s) => ({ ...s, back: { ...s.back, note: e.target.value } }))} />
        </Section>
      ) : null}
      <QrField
        on={suite.back.qr}
        url={suite.back.qrUrl}
        onToggle={(v) => set((s) => ({ ...s, back: { ...s.back, qr: v } }))}
        onUrl={(v) => set((s) => ({ ...s, back: { ...s.back, qrUrl: v } }))}
      />
    </div>
  );
}

function EnclosurePanel({ suite, set }: { suite: CardSuite; set: SetSuite }) {
  const e = suite.enclosure;
  const setSection = (i: number, patch: Partial<{ title: string; body: string }>) =>
    set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: s.enclosure.sections.map((x, j) => (j === i ? { ...x, ...patch } : x)) } }));
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-medium">Enclosure Front</h2>
        {e.enabled ? (
          <button type="button" className="text-sm underline underline-offset-4" onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, enabled: false } }))}>
            Remove enclosure
          </button>
        ) : null}
      </div>
      {e.enabled ? (
        <>
          <p className="mb-6 text-sm text-muted-foreground">A smaller details card, printed in the same colours, paper and finish as your invitation.</p>
          <Section title="Heading">
            <Input maxLength={80} value={e.heading} onChange={(ev) => set((s) => ({ ...s, enclosure: { ...s.enclosure, heading: ev.target.value } }))} />
          </Section>
          <Section title="Details" value={`${e.sections.length} of 6`}>
            <div className="grid gap-4">
              {e.sections.map((sec, i) => (
                <div key={i} className="grid gap-2 rounded-xl border p-3">
                  <div className="flex gap-2">
                    <Input aria-label="Title" maxLength={80} value={sec.title} onChange={(ev) => setSection(i, { title: ev.target.value })} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove"
                      onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: s.enclosure.sections.filter((_, j) => j !== i) } }))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <Textarea aria-label="Details" rows={2} maxLength={400} value={sec.body} onChange={(ev) => setSection(i, { body: ev.target.value })} />
                </div>
              ))}
              {e.sections.length < 6 ? (
                <Button type="button" variant="outline" onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, sections: [...s.enclosure.sections, { title: "", body: "" }] } }))}>
                  <Plus /> Add a detail
                </Button>
              ) : null}
            </div>
          </Section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No enclosure in this suite.</p>
      )}
    </div>
  );
}

function EnclosureBackPanel({ template, suite, set }: { template: TemplateManifest; suite: CardSuite; set: SetSuite }) {
  if (!suite.enclosure.enabled) return <EnclosurePanel suite={suite} set={set} />;
  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium">Enclosure Back</h2>
      <Section title="Layout" value={ENCLOSURE_BACK_LABELS[suite.enclosure.back]}>
        <div className="grid grid-cols-3 gap-3">
          {ENCLOSURE_BACKS.map((l) => (
            <LayoutTile key={l} active={suite.enclosure.back === l} label={ENCLOSURE_BACK_LABELS[l]} onClick={() => set((s) => ({ ...s, enclosure: { ...s.enclosure, back: l } }))}>
              <div className="w-[74%]">
                <SuitePiece suite={{ ...suite, enclosure: { ...suite.enclosure, back: l, qr: false } }} template={template} piece="enclosure-back" sizes="120px" className="shadow-sm" />
              </div>
            </LayoutTile>
          ))}
        </div>
      </Section>
      <QrField
        on={suite.enclosure.qr}
        url={suite.enclosure.qrUrl}
        onToggle={(v) => set((s) => ({ ...s, enclosure: { ...s.enclosure, qr: v } }))}
        onUrl={(v) => set((s) => ({ ...s, enclosure: { ...s.enclosure, qrUrl: v } }))}
      />
    </div>
  );
}

function EnvelopePanel({ template, suite, set }: { template: TemplateManifest; suite: CardSuite; set: SetSuite }) {
  const [tab, setTab] = useState<"color" | "return" | "guest">("color");
  const env = suite.envelope;
  const setEnv = (patch: Partial<CardSuite["envelope"]>) => set((s) => ({ ...s, envelope: { ...s.envelope, ...patch } }));
  const tabs = [
    ["color", "1. Colour + liner"],
    ["return", "2. Return address"],
    ["guest", "3. Guest address"],
  ] as const;
  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium">Invitation Envelope</h2>
      <div className="mb-6 grid grid-cols-3 border-b text-sm">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("border-b-2 px-1 pb-3 text-center", tab === id ? "border-foreground font-medium" : "border-transparent text-muted-foreground")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "color" ? (
        <>
          <Section title="Envelope colour" value={ENVELOPE_COLORS[env.color][0]}>
            <div role="radiogroup" aria-label="Envelope colour" className="grid grid-cols-6 gap-2">
              {(Object.keys(ENVELOPE_COLORS) as EnvelopeColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={env.color === c}
                  aria-label={ENVELOPE_COLORS[c][0]}
                  title={ENVELOPE_COLORS[c][0]}
                  onClick={() => setEnv({ color: c })}
                  className={cn("relative aspect-[7/5] overflow-hidden rounded-sm border border-black/15 ring-offset-2 ring-offset-background", env.color === c && "ring-2 ring-foreground")}
                  style={{ background: ENVELOPE_COLORS[c][1] }}
                >
                  <svg aria-hidden viewBox="0 0 70 50" className="absolute inset-0 size-full">
                    <path d="M0 0 L35 26 L70 0" fill="none" stroke="rgb(0 0 0 / 0.25)" strokeWidth="1.2" />
                  </svg>
                </button>
              ))}
            </div>
          </Section>
          <Section title="Liner" value={LINER_LABELS[env.liner]}>
            <div role="radiogroup" aria-label="Liner" className="grid grid-cols-4 gap-3" style={suiteVarsInline(template, suite)}>
              {LINERS.map((l) => (
                <button key={l} type="button" role="radio" aria-checked={env.liner === l} onClick={() => setEnv({ liner: l })} className="flex flex-col items-center gap-1.5 text-xs">
                  <span className={cn("relative block size-14 overflow-hidden rounded-full border border-black/10 bg-white ring-offset-2 ring-offset-background", env.liner === l && "ring-2 ring-foreground")}>
                    {l === "none" ? (
                      <span className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/40" />
                    ) : (
                      <LinerFill liner={l} ornament={template.stationery.ornament} className="absolute inset-0" />
                    )}
                  </span>
                  {LINER_LABELS[l]}
                </button>
              ))}
            </div>
          </Section>
        </>
      ) : tab === "return" ? (
        <Section title="Return address">
          <Textarea rows={4} maxLength={300} value={env.returnAddress} onChange={(e) => setEnv({ returnAddress: e.target.value })} />
          <p className="mt-2 text-xs text-muted-foreground">Printed on the back flap and the top corner of the front.</p>
        </Section>
      ) : (
        <Section title="Guest address">
          <div className="grid gap-3">
            <Field label="Name">
              <Input maxLength={120} value={env.guestName} onChange={(e) => setEnv({ guestName: e.target.value })} />
            </Field>
            <Field label="Address">
              <Textarea rows={3} maxLength={300} value={env.guestAddress} onChange={(e) => setEnv({ guestAddress: e.target.value })} />
            </Field>
            <p className="text-xs text-muted-foreground">A sample guest, so you can see the layout. Printing for each guest comes with printed orders.</p>
          </div>
        </Section>
      )}
    </div>
  );
}

function suiteVarsInline(template: TemplateManifest, suite: CardSuite) {
  const palette = template.palettes.find((p) => p.id === suite.paletteId);
  const vars: Record<string, string> = {};
  const c = { ...template.themeDefaults.colors, ...(palette?.colors ?? {}) };
  vars["--inv-accent"] = c.accent;
  vars["--inv-surface"] = suite.background ?? c.surface;
  vars["--inv-fg"] = c.foreground;
  vars["--inv-muted"] = c.muted;
  vars["--inv-bg"] = c.background;
  vars["--inv-border"] = c.border;
  return vars as React.CSSProperties;
}

// ── Review ──────────────────────────────────────────────────────────────────

const REVIEW: { piece: Piece; label: string; step: Step }[] = [
  { piece: "front", label: "Invitation front", step: "front" },
  { piece: "back", label: "Invitation back", step: "back" },
  { piece: "enclosure-front", label: "Enclosure front", step: "enclosure-front" },
  { piece: "enclosure-back", label: "Enclosure back", step: "enclosure-back" },
  { piece: "envelope-front", label: "Envelope front", step: "envelope" },
  { piece: "envelope-back", label: "Envelope back", step: "envelope" },
];

function reviewItems(suite: CardSuite) {
  return REVIEW.filter((r) => suite.enclosure.enabled || !r.piece.startsWith("enclosure"));
}

function ReviewPanel({ template, suite, goTo }: { template: TemplateManifest; suite: CardSuite; goTo: (s: Step) => void }) {
  const [busy, setBusy] = useState(false);
  const exportRoot = useRef<HTMLDivElement>(null);
  const items = reviewItems(suite);

  async function downloadAll() {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 60));
      const root = exportRoot.current;
      if (!root) throw new Error("not ready");
      await document.fonts.ready;
      const imgs = Array.from(root.querySelectorAll("img"));
      await Promise.all(imgs.map((img) => (img.complete ? img.decode().catch(() => undefined) : new Promise((r) => img.addEventListener("load", r, { once: true })))));
      const [{ toPng }, { default: JSZip }] = await Promise.all([import("html-to-image"), import("jszip")]);
      const zip = new JSZip();
      const nodes = Array.from(root.children) as HTMLElement[];
      for (let i = 0; i < nodes.length; i++) {
        const png = await toPng(nodes[i], { pixelRatio: 2, cacheBust: true });
        zip.file(`${String(i + 1).padStart(2, "0")}-${items[i].piece}.png`, png.split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      const names = `${suite.text.partnerOne}-${suite.text.partnerTwo}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
      a.href = URL.createObjectURL(blob);
      a.download = `${names || "wedding"}-${template.id}-suite.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch {
      toast.error("Couldn't create the files. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-medium">Review</h2>
      <p className="mb-6 text-sm text-muted-foreground">Check every piece. Your suite is saved on this device; download it as high-resolution images to share or print.</p>
      <ul className="mb-6 grid gap-2 text-sm">
        {items.map((r) => (
          <li key={r.piece} className="flex items-center justify-between border-b py-2">
            {r.label}
            <button type="button" className="underline underline-offset-4" onClick={() => goTo(r.step)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" size="lg" className="h-12 w-full rounded-full" onClick={downloadAll} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />} Download suite (.zip)
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">Printed and posted suites are coming soon.</p>
      {busy ? (
        <div ref={exportRoot} aria-hidden className="pointer-events-none fixed -left-[12000px] top-0 flex flex-col gap-10">
          {items.map((r) => (
            <div key={r.piece} style={{ width: r.piece.startsWith("envelope") ? 1050 : 900 }}>
              <SuitePiece suite={suite} template={template} piece={r.piece} sizes="1800px" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReviewCanvas({ template, suite, goTo }: { template: TemplateManifest; suite: CardSuite; goTo: (s: Step) => void }) {
  return (
    <div className="grid gap-10 p-8 pt-16 sm:grid-cols-2 sm:p-12 xl:grid-cols-3">
      {reviewItems(suite).map((r) => (
        <button key={r.piece} type="button" onClick={() => goTo(r.step)} className="group flex flex-col items-center gap-3">
          <div className={cn("transition group-hover:-translate-y-1", r.piece.startsWith("envelope") ? "w-full" : r.piece.startsWith("enclosure") ? "w-[64%]" : "w-[78%]")}>
            <SuitePiece suite={suite} template={template} piece={r.piece} sizes="420px" className="shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)]" />
          </div>
          <span className="text-sm font-medium">{r.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Photos ──────────────────────────────────────────────────────────────────

/** Reads an image file and returns a JPEG data URL no wider/taller than `max`. */
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
