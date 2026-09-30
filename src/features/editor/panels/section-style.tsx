"use client";

import { AlignCenter, AlignLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionType } from "@/core/sections/registry";
import { resolveSectionStyle, type SectionAlign, type SectionSpacing, type SectionStyle, type SectionTone } from "@/core/sections/style";
import { resolveTheme, sanitizeOverrides } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest } from "@/templates/registry";
import { saveSection } from "../actions";
import { setSection } from "../bundle-updates";
import { useEditor } from "../editor-context";

/** Background, spacing and alignment for one section (stored as style hints, apart from content). */
export function SectionStyleControls({ type }: { type: SectionType }) {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const row = bundle.sections.find((s) => s.type === type);
  const style = resolveSectionStyle(row?.style);
  const theme = resolveTheme(resolveTemplateManifest(bundle.wedding.template_id).themeDefaults, sanitizeOverrides(bundle.theme.tokens));

  if (type === "hero") {
    return <p className="text-sm text-muted-foreground">The hero is designed by the template. Change its photo and words in Content, and its colors and fonts in Design.</p>;
  }

  function set(patch: Partial<SectionStyle>) {
    const next = { ...style, ...patch };
    // Store only what differs from the template's defaults.
    const stored: Record<string, string> = {};
    if (next.tone !== "default") stored.tone = next.tone;
    if (next.spacing !== "normal") stored.spacing = next.spacing;
    if (next.align !== "center") stored.align = next.align;
    update((b) => setSection(b, type, { style: stored }));
    save(`section-style:${type}`, () => saveSection(weddingId, type, { style: stored }), 300);
  }

  const c = theme.colors;
  const tones: { value: SectionTone; label: string; swatch: [string, string] }[] = [
    { value: "default", label: "Template", swatch: [c.background, c.surface] },
    { value: "light", label: "Light", swatch: [c.surface, c.surface] },
    { value: "dark", label: "Dark", swatch: [c.foreground, c.foreground] },
    { value: "accent", label: "Accent", swatch: [c.accent, c.accent] },
  ];

  return (
    <fieldset disabled={!canEdit} className="grid gap-6">
      <Control label="Background">
        <div role="radiogroup" aria-label="Background" className="grid grid-cols-4 gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={style.tone === t.value}
              onClick={() => set({ tone: t.value })}
              className={cn("grid gap-1.5 rounded-md border p-1.5 text-[0.7rem]", style.tone === t.value ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/40")}
            >
              <span className="flex h-7 overflow-hidden rounded-sm border border-black/10">
                <span className="flex-1" style={{ background: t.swatch[0] }} />
                <span className="flex-1" style={{ background: t.swatch[1] }} />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </Control>
      <Control label="Spacing">
        <Segmented<SectionSpacing>
          value={style.spacing}
          onChange={(spacing) => set({ spacing })}
          options={[
            { value: "compact", label: "Compact" },
            { value: "normal", label: "Normal" },
            { value: "airy", label: "Airy" },
          ]}
        />
      </Control>
      <Control label="Alignment">
        <Segmented<SectionAlign>
          value={style.align}
          onChange={(align) => set({ align })}
          options={[
            { value: "center", label: "Centered", icon: <AlignCenter className="size-4" /> },
            { value: "start", label: "Left", icon: <AlignLeft className="size-4 rtl:-scale-x-100" /> },
          ]}
        />
      </Control>
    </fieldset>
  );
}

export function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: ReactNode }[] }) {
  return (
    <div role="radiogroup" className="grid rounded-md border bg-background p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("flex items-center justify-center gap-1.5 rounded-[5px] py-1.5 text-sm", value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
