"use client";

/* eslint-disable @next/next/no-img-element -- thumbnails of the visitor's own local photos (blob: URLs) */

import { Check, ImagePlus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { LOCALE_META, LOCALES } from "@/core/i18n/locales";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme } from "@/core/theme/tokens";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { Stationery } from "@/features/marketing/stationery";
import { PHOTO_LIBRARY, type LibraryPhotoId } from "@/features/media/library";
import { LivePreviewFrame } from "@/features/preview/live-preview-frame";
import { cn } from "@/lib/utils";
import { emptyAnswers, hasProgress, MAX_DRAFT_GALLERY, previewBundle, withTemplate, type EventAnswers, type PhotoRef, type TryAnswers } from "./answers";
import { draftFiles, draftStore, useHydrated, useStoredDraft } from "./draft-store";

type TemplateOption = TemplateManifest;

const STEPS = [
  { id: "names", label: "Names" },
  { id: "date", label: "Date" },
  { id: "ceremony", label: "Ceremony" },
  { id: "reception", label: "Reception" },
  { id: "location", label: "Location" },
  { id: "style", label: "Style" },
  { id: "photos", label: "Photos" },
] as const;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Cairo";
  } catch {
    return "Africa/Cairo";
  }
}

export interface Prefill {
  partnerOne: string;
  partnerTwo: string;
  date: string | null;
  palette: string | null;
}

export function TryFlow({ templateId, templates, prefill }: { templateId: string; templates: TemplateOption[]; prefill?: Prefill }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const stored = useStoredDraft();
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  // The visitor's answers: the stored draft (switched to this template if
  // they arrived from another one — nothing is lost), or a fresh draft.
  const answers = useMemo<TryAnswers>(() => {
    if (stored) return withTemplate(stored, templateId);
    return emptyAnswers(templateId, hydrated ? browserTimeZone() : "Africa/Cairo");
  }, [stored, templateId, hydrated]);

  const template = templates.find((t) => t.id === answers.templateId) ?? templates[0];

  // Apply details handed over from the homepage once, then clean the URL.
  const prefillApplied = useRef(false);
  useEffect(() => {
    if (!prefill || !hydrated || prefillApplied.current) return;
    prefillApplied.current = true;
    const base = draftStore.get() ?? answers;
    draftStore.set({
      ...withTemplate(base, templateId),
      partnerOne: prefill.partnerOne || base.partnerOne,
      partnerTwo: prefill.partnerTwo || base.partnerTwo,
      date: prefill.date ?? base.date,
      palette: prefill.palette ?? (base.templateId === templateId ? base.palette : null),
    });
    router.replace(`/create/${templateId}`, { scroll: false });
  }, [prefill, hydrated, answers, templateId, router]);

  const urls = useLocalPhotoUrls(answers);

  const bundle = useMemo(() => withLocalUrls(previewBundle(answers, template), urls), [answers, template, urls]);

  function update(patch: Partial<TryAnswers> | ((a: TryAnswers) => TryAnswers)) {
    const next = typeof patch === "function" ? patch(answers) : { ...answers, ...patch };
    draftStore.set(next);
  }

  function chooseTemplate(id: string) {
    update(withTemplate(answers, id));
    router.replace(`/create/${id}`, { scroll: false });
  }

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const canSave = Boolean(answers.partnerOne.trim() && answers.partnerTwo.trim());

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="font-serif text-2xl">
            Vellum
          </Link>
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">
            The {template.name} · {hasProgress(answers) ? "draft saved in this browser" : "no account needed"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={`/templates/${template.id}`}>Exit</Link>
          </Button>
          <SaveButton canSave={canSave} onMissingNames={() => setStep(0)} />
        </div>
      </header>

      <div className="flex border-b bg-card lg:hidden" role="tablist" aria-label="View">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("flex-1 py-3 text-sm font-medium capitalize", tab === t ? "border-b-2 border-primary" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <section className={cn("flex min-h-0 w-full flex-col lg:w-[460px] lg:shrink-0 lg:border-e", tab === "preview" && "hidden lg:flex")} aria-label="Your details">
          <nav aria-label="Steps" className="border-b px-4 py-3">
            <ol className="flex gap-1 overflow-x-auto">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors",
                      i === step ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {i + 1}. {s.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
            {current.id === "names" && <NamesStep answers={answers} update={update} />}
            {current.id === "date" && <DateStep answers={answers} update={update} />}
            {current.id === "ceremony" && <EventStep kind="ceremony" answers={answers} update={update} />}
            {current.id === "reception" && <EventStep kind="reception" answers={answers} update={update} />}
            {current.id === "location" && <LocationStep answers={answers} update={update} />}
            {current.id === "style" && <StyleStep answers={answers} update={update} templates={templates} onTemplate={chooseTemplate} />}
            {current.id === "photos" && <PhotosStep answers={answers} update={update} urls={urls} />}
          </div>

          <div className="flex items-center justify-between gap-3 border-t bg-card px-6 py-4">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            {last ? (
              <SaveButton canSave={canSave} onMissingNames={() => setStep(0)} label="Save my invitation" />
            ) : (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            )}
          </div>
        </section>

        <LivePreviewFrame
          src={`/create/${template.id}/frame`}
          bundle={bundle}
          label={hasProgress(answers) ? "Your invitation" : "Showing sample details until you add yours"}
          className={cn("min-w-0 flex-1", tab === "edit" && "hidden lg:flex")}
        />
      </div>
    </div>
  );
}

function SaveButton({ canSave, onMissingNames, label = "Save invitation" }: { canSave: boolean; onMissingNames: () => void; label?: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => {
        if (!canSave) {
          toast("Add both of your names first — they're on every page of your invitation.");
          onMissingNames();
          return;
        }
        router.push("/register?draft=1");
      }}
    >
      {label}
    </Button>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────────

type StepProps = { answers: TryAnswers; update: (patch: Partial<TryAnswers>) => void };

function StepHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-4xl font-light leading-tight">{title}</h1>
      {children ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p> : null}
    </header>
  );
}

function NamesStep({ answers, update }: StepProps) {
  return (
    <>
      <StepHeader title="Who's getting married?">Exactly as you&apos;d like your names to appear. Watch them appear on the invitation.</StepHeader>
      <div className="grid gap-5">
        <Field id="partnerOne" label="First name">
          <Input id="partnerOne" value={answers.partnerOne} placeholder="Emma" maxLength={80} autoFocus onChange={(e) => update({ partnerOne: e.target.value })} />
        </Field>
        <Field id="partnerTwo" label="Second name">
          <Input id="partnerTwo" value={answers.partnerTwo} placeholder="James" maxLength={80} onChange={(e) => update({ partnerTwo: e.target.value })} />
        </Field>
      </div>
    </>
  );
}

function DateStep({ answers, update }: StepProps) {
  return (
    <>
      <StepHeader title="When is the big day?">Your countdown starts the moment you choose.</StepHeader>
      <Field id="date" label="Wedding date">
        <Input id="date" type="date" value={answers.date ?? ""} className="max-w-xs" onChange={(e) => update({ date: e.target.value || null })} />
      </Field>
      {answers.date ? (
        <button type="button" className="mt-3 text-sm text-muted-foreground underline underline-offset-4" onClick={() => update({ date: null })}>
          We haven&apos;t decided yet
        </button>
      ) : null}
    </>
  );
}

function EventStep({ kind, answers, update }: StepProps & { kind: "ceremony" | "reception" }) {
  const e = answers[kind];
  const set = (patch: Partial<EventAnswers>) => update({ [kind]: { ...e, ...patch } } as Partial<TryAnswers>);
  const copy =
    kind === "ceremony"
      ? { title: "The ceremony", hint: "Where and when you'll say “I do”.", venue: "St. Mary's Church", address: "12 Church Lane, London" }
      : { title: "The reception", hint: "Where the celebration continues.", venue: "The Garden Estate", address: "Holland Park, London" };
  return (
    <>
      <StepHeader title={copy.title}>{copy.hint} You can skip this and add it later.</StepHeader>
      <div className="grid gap-5">
        <Field id={`${kind}-venue`} label="Venue">
          <Input id={`${kind}-venue`} value={e.venue} placeholder={copy.venue} maxLength={160} onChange={(ev) => set({ venue: ev.target.value })} />
        </Field>
        <Field id={`${kind}-address`} label="Address" hint="Used for the map and directions.">
          <Input id={`${kind}-address`} value={e.address} placeholder={copy.address} maxLength={400} onChange={(ev) => set({ address: ev.target.value })} />
        </Field>
        <Field id={`${kind}-time`} label="Time" hint={answers.date ? undefined : "Add your wedding date to show times."}>
          <Input id={`${kind}-time`} type="time" value={e.time} className="max-w-[10rem]" onChange={(ev) => set({ time: ev.target.value })} />
        </Field>
        {kind === "reception" && answers.ceremony.venue.trim() ? (
          <button
            type="button"
            className="justify-self-start text-sm text-muted-foreground underline underline-offset-4"
            onClick={() => set({ venue: answers.ceremony.venue, address: answers.ceremony.address })}
          >
            Same place as the ceremony
          </button>
        ) : null}
      </div>
    </>
  );
}

function LocationStep({ answers, update }: StepProps) {
  const zones = useMemo(() => {
    const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    return all.includes(answers.timezone) ? all : [answers.timezone, ...all];
  }, [answers.timezone]);
  return (
    <>
      <StepHeader title="Where in the world?">So times show correctly for every guest, wherever they are.</StepHeader>
      <div className="grid gap-5">
        <Field id="timezone" label="Time zone of the wedding">
          <NativeSelect id="timezone" value={answers.timezone} onChange={(e) => update({ timezone: e.target.value })}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, " ")}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="locale" label="Invitation language" hint="Arabic invitations read right to left, with Arabic typography and dates.">
          <NativeSelect id="locale" value={answers.locale} onChange={(e) => update({ locale: e.target.value as TryAnswers["locale"] })}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_META[l].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
    </>
  );
}

function StyleStep({ answers, update, templates, onTemplate }: StepProps & { templates: TemplateOption[]; onTemplate: (id: string) => void }) {
  const current = templates.find((t) => t.id === answers.templateId) ?? templates[0];
  return (
    <>
      <StepHeader title="Choose your style">Switch freely — your details stay exactly as they are.</StepHeader>
      <div role="radiogroup" aria-label="Template" className="grid grid-cols-3 gap-3">
        {templates.map((t) => {
          const active = t.id === current.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onTemplate(t.id)}
              className={cn("group rounded-md border p-2 text-start transition-colors", active ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/40")}
            >
              <Stationery template={t} partnerOne={answers.partnerOne || "Emma"} partnerTwo={answers.partnerTwo || "James"} className="text-[0.55rem]" />
              <span className="mt-2 block truncate text-xs font-medium">{t.name}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-medium">Colors</h2>
      <div role="radiogroup" aria-label="Palette" className="grid gap-2">
        {current.palettes.map((p, i) => {
          const c = resolveTheme(current.themeDefaults, { colors: p.colors }).colors;
          const active = answers.palette ? answers.palette === p.id : i === 0;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ palette: i === 0 ? null : p.id })}
              className={cn("flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors", active ? "border-primary" : "border-border hover:border-foreground/40")}
            >
              <span className="flex items-center gap-3">
                <span className="flex">
                  {[c.background, c.foreground, c.accent].map((color, j) => (
                    <span key={j} className="-ms-1.5 size-6 rounded-full border border-black/10 first:ms-0" style={{ background: color }} />
                  ))}
                </span>
                {p.label}
              </span>
              {active ? <Check className="size-4" /> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

function PhotosStep({ answers, update, urls }: StepProps & { urls: Record<string, string> }) {
  const [target, setTarget] = useState<"hero" | "gallery">("hero");
  const input = useRef<HTMLInputElement>(null);
  const { hero, gallery } = answers.photos;

  const isSelected = (id: LibraryPhotoId) =>
    target === "hero" ? hero?.source === "library" && hero.id === id : gallery.some((g) => g.source === "library" && g.id === id);

  function setPhotos(photos: TryAnswers["photos"]) {
    update({ photos });
  }

  function toggleLibrary(id: LibraryPhotoId) {
    if (target === "hero") return setPhotos({ ...answers.photos, hero: { source: "library", id } });
    if (isSelected(id)) return setPhotos({ ...answers.photos, gallery: gallery.filter((g) => !(g.source === "library" && g.id === id)) });
    if (gallery.length >= MAX_DRAFT_GALLERY) return toast(`Up to ${MAX_DRAFT_GALLERY} photos for now — you can add more after saving.`);
    setPhotos({ ...answers.photos, gallery: [...gallery, { source: "library", id }] });
  }

  async function addFiles(files: File[]) {
    const added: PhotoRef[] = [];
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: please choose a JPG, PNG, WebP or AVIF image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is larger than 10 MB.`);
        continue;
      }
      let width: number | null = null;
      let height: number | null = null;
      try {
        const bmp = await createImageBitmap(file);
        width = bmp.width;
        height = bmp.height;
        bmp.close();
      } catch {
        /* dimensions are optional */
      }
      const key = crypto.randomUUID();
      try {
        await draftFiles.put(key, file);
      } catch {
        toast.error("Your browser couldn't keep this photo. Try a smaller one, or pick from our library.");
        continue;
      }
      added.push({ source: "local", key, name: file.name.slice(0, 200), width, height });
    }
    if (!added.length) return;
    if (target === "hero") {
      if (hero?.source === "local") void draftFiles.delete(hero.key);
      setPhotos({ ...answers.photos, hero: added[0] });
    } else {
      setPhotos({ ...answers.photos, gallery: [...gallery, ...added].slice(0, MAX_DRAFT_GALLERY) });
    }
  }

  function remove(ref: PhotoRef, where: "hero" | "gallery") {
    if (ref.source === "local") void draftFiles.delete(ref.key);
    if (where === "hero") setPhotos({ ...answers.photos, hero: null });
    else setPhotos({ ...answers.photos, gallery: gallery.filter((g) => g !== ref) });
  }

  const thumb = (ref: PhotoRef) => (ref.source === "library" ? PHOTO_LIBRARY[ref.id].url : urls[ref.key]);

  return (
    <>
      <StepHeader title="Add your photos">Upload your own or choose from our collection. Photos stay on this device until you save.</StepHeader>

      <div role="tablist" aria-label="Photo" className="mb-6 grid grid-cols-2 rounded-full border p-1 text-sm">
        {(["hero", "gallery"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={target === t} onClick={() => setTarget(t)} className={cn("rounded-full py-1.5", target === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            {t === "hero" ? "Main photo" : `Gallery (${gallery.length})`}
          </button>
        ))}
      </div>

      {target === "hero" && hero ? (
        <div className="relative mb-6 overflow-hidden rounded-md border">
          {thumb(hero) ? <img src={thumb(hero)} alt="" className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] bg-muted" />}
          <button type="button" onClick={() => remove(hero, "hero")} className="absolute end-2 top-2 rounded-full bg-black/60 p-2 text-white" aria-label="Remove main photo">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {target === "gallery" && gallery.some((g) => g.source === "local") ? (
        <ul className="mb-6 grid grid-cols-4 gap-2">
          {gallery.map((g, i) =>
            g.source === "local" ? (
              <li key={g.key} className="relative">
                {urls[g.key] ? <img src={urls[g.key]} alt="" className="aspect-square w-full rounded-sm object-cover" /> : <div className="aspect-square rounded-sm bg-muted" />}
                <button type="button" onClick={() => remove(g, "gallery")} className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white" aria-label={`Remove photo ${i + 1}`}>
                  <Trash2 className="size-3" />
                </button>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}

      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple={target === "gallery"}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void addFiles(files);
        }}
      />
      <Button type="button" variant="outline" className="w-full" onClick={() => input.current?.click()}>
        <ImagePlus /> Upload {target === "hero" ? "a photo" : "photos"}
      </Button>

      <p className="mb-3 mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">Or choose from our collection</p>
      <ul className="grid grid-cols-3 gap-2">
        {(Object.keys(PHOTO_LIBRARY) as LibraryPhotoId[]).map((id) => {
          const selected = isSelected(id);
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={selected}
                aria-label={PHOTO_LIBRARY[id].alt}
                onClick={() => toggleLibrary(id)}
                className={cn("relative block aspect-square w-full overflow-hidden rounded-sm bg-muted outline-offset-2", selected && "outline outline-2 outline-primary")}
              >
                <Image src={PHOTO_LIBRARY[id].url} alt="" fill sizes="140px" className="object-cover" />
                {selected ? (
                  <span className="absolute end-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ── Local photos ────────────────────────────────────────────────────────────

/** blob: URLs for the draft's local photos, created from IndexedDB and revoked when no longer used. */
function useLocalPhotoUrls(answers: TryAnswers): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const keys = useMemo(() => {
    const refs = [answers.photos.hero, ...answers.photos.gallery].filter((r): r is Extract<PhotoRef, { source: "local" }> => r?.source === "local");
    return refs.map((r) => r.key).sort().join(",");
  }, [answers.photos]);

  useEffect(() => {
    let cancelled = false;
    const wanted = keys ? keys.split(",") : [];
    const created: string[] = [];
    Promise.all(
      wanted.map(async (key) => {
        const blob = await draftFiles.get(key).catch(() => undefined);
        if (!blob) return [key, ""] as const;
        const url = URL.createObjectURL(blob);
        created.push(url);
        return [key, url] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setUrls(Object.fromEntries(entries.filter(([, url]) => url)));
    });
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [keys]);

  return urls;
}

/** Replaces local: media paths with blob: URLs so the preview iframe can show them. */
function withLocalUrls(bundle: WeddingBundle, urls: Record<string, string>): WeddingBundle {
  return {
    ...bundle,
    media: bundle.media.map((m) => (m.storage_path.startsWith("local:") ? { ...m, storage_path: urls[m.storage_path.slice(6)] ?? m.storage_path } : m)),
  };
}
