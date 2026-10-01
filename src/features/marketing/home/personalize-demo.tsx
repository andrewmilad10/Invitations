"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme } from "@/core/theme/tokens";
import { FadeUp, Reveal, RevealLines } from "@/features/motion/motion";
import { cn } from "@/lib/utils";
import { Stationery } from "../stationery";

type TemplateOption = Pick<TemplateManifest, "id" | "name" | "themeDefaults" | "stationery" | "palettes">;

/**
 * A miniature of the real editor on the homepage. What the visitor types is
 * carried into the try flow (/create/[template]?…) so they never retype it.
 */
export function PersonalizeDemo({ templates }: { templates: TemplateOption[] }) {
  const id = useId();
  const [templateId, setTemplateId] = useState(templates[0]?.id);
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [date, setDate] = useState("");
  // Opens in the brand emerald when the design has it.
  const [paletteId, setPaletteId] = useState<string | undefined>("emerald");

  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const palette = template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0];
  const dateLabel = useMemo(
    () => (date ? new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }) : "Your date"),
    [date],
  );

  const params = new URLSearchParams();
  if (one.trim()) params.set("one", one.trim());
  if (two.trim()) params.set("two", two.trim());
  if (date) params.set("date", date);
  if (palette?.id && palette.id !== template.palettes[0]?.id) params.set("palette", palette.id);
  const href = `/create/${template.id}${params.size ? `?${params}` : ""}`;

  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <RevealLines className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl" lines={["Make it yours,", "right now"]} />
          <FadeUp as="p" delay={150} className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Type your names. This is how the editor feels — every change shows up instantly.
          </FadeUp>

          <FadeUp delay={250} className="mt-10 grid max-w-md gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-one`}>Your name</Label>
                <Input id={`${id}-one`} placeholder="Layla" value={one} maxLength={40} onChange={(e) => setOne(e.target.value)} className="h-11 bg-card" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-two`}>Your partner&apos;s</Label>
                <Input id={`${id}-two`} placeholder="Omar" value={two} maxLength={40} onChange={(e) => setTwo(e.target.value)} className="h-11 bg-card" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-date`}>Wedding date</Label>
              <Input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 bg-card" />
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">Style</legend>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={t.id === template.id}
                    onClick={() => {
                      setTemplateId(t.id);
                      setPaletteId(undefined);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition-colors",
                      t.id === template.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/40",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2.5" role="group" aria-label="Colors">
                {template.palettes.map((p) => {
                  const c = resolveTheme(template.themeDefaults, { colors: p.colors }).colors;
                  const active = p.id === palette?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.label}
                      aria-label={p.label}
                      aria-pressed={active}
                      onClick={() => setPaletteId(p.id)}
                      className={cn("grid size-9 place-items-center rounded-full border transition", active ? "border-foreground" : "border-transparent")}
                    >
                      <span className="size-7 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${c.surface} 50%, ${c.accent} 50%)` }} />
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Button asChild size="lg" className="mt-2 justify-self-start rounded-full px-7">
              <Link href={href}>Continue with these details</Link>
            </Button>
          </FadeUp>
        </div>

        <Reveal variant="scale" delay={200} duration={1100} className="relative flex justify-center bg-muted px-6 py-14 sm:py-20">
          <Stationery
            template={template}
            overrides={{ colors: palette?.colors }}
            partnerOne={one.trim() || "Layla"}
            partnerTwo={two.trim() || "Omar"}
            dateLabel={dateLabel}
            className="w-full max-w-sm shadow-[0_30px_70px_-30px_rgb(34_29_26/0.55)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
