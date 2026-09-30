"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { FONT_KEYS, FONTS, type FontKey } from "@/core/theme/fonts";
import { resolveTheme, sanitizeOverrides, type ColorToken, type ThemeOverrides } from "@/core/theme/tokens";
import { TemplatePicker } from "@/features/weddings/components/template-picker";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest, selectableTemplates } from "@/templates/registry";
import { updateTemplate, updateTheme } from "../actions";
import { setTemplate, setTheme } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { PanelHeader } from "./panel-header";

const EDITABLE_COLORS: { token: ColorToken; label: string }[] = [
  { token: "background", label: "Background" },
  { token: "surface", label: "Cards" },
  { token: "foreground", label: "Text" },
  { token: "accent", label: "Accent" },
];

export function ThemePanel() {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const template = resolveTemplateManifest(bundle.wedding.template_id);
  const overrides = sanitizeOverrides(bundle.theme.tokens);
  const theme = resolveTheme(template.themeDefaults, overrides);

  function saveOverrides(next: ThemeOverrides) {
    update((b) => setTheme(b, next));
    save("theme", () => updateTheme(weddingId, next));
  }

  function chooseTemplate(id: string) {
    update((b) => setTemplate(b, id));
    save("template", () => updateTemplate(weddingId, id), 0);
  }

  const templates = selectableTemplates().map(({ id, name, tagline, previewImage, status }) => ({ id, name, tagline, previewImage, status }));
  const activePalette = template.palettes.find((p) => JSON.stringify(p.colors) === JSON.stringify(overrides.colors ?? {}));

  return (
    <div className="grid gap-10">
      <PanelHeader title="Template & style" description="Change the look at any time — your content always stays the same." />

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Template</h3>
        <fieldset disabled={!canEdit}>
          <TemplatePicker templates={templates} value={template.id} onChange={chooseTemplate} />
        </fieldset>
      </section>

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Color palette</h3>
        <div className="flex flex-wrap gap-3">
          {template.palettes.map((palette) => {
            const colors = resolveTheme(template.themeDefaults, { colors: palette.colors }).colors;
            return (
              <button
                key={palette.id}
                type="button"
                disabled={!canEdit}
                onClick={() => saveOverrides({ ...overrides, colors: palette.colors })}
                aria-pressed={activePalette?.id === palette.id}
                className={cn("flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm transition hover:border-foreground/30", activePalette?.id === palette.id && "border-primary ring-1 ring-primary")}
              >
                <span className="flex">
                  {[colors.background, colors.foreground, colors.accent].map((c, i) => (
                    <span key={i} className="-ms-1 size-5 rounded-full border border-black/10 first:ms-0" style={{ background: c }} />
                  ))}
                </span>
                {palette.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {EDITABLE_COLORS.map(({ token, label }) => (
            <div key={token} className="grid gap-1.5">
              <Label htmlFor={`color-${token}`} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <input
                id={`color-${token}`}
                type="color"
                value={theme.colors[token]}
                disabled={!canEdit}
                onChange={(e) => saveOverrides({ ...overrides, colors: { ...overrides.colors, [token]: e.target.value } })}
                className="h-10 w-full cursor-pointer rounded-md border border-input bg-background p-1"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Typography</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["heading", "body", "accent"] as const).map((role) => (
            <div key={role} className="grid gap-1.5">
              <Label htmlFor={`font-${role}`} className="text-xs capitalize text-muted-foreground">
                {role === "accent" ? "Accent (ampersand, signature)" : role}
              </Label>
              <NativeSelect
                id={`font-${role}`}
                value={theme.fonts[role]}
                disabled={!canEdit}
                onChange={(e) => saveOverrides({ ...overrides, fonts: { ...overrides.fonts, [role]: e.target.value as FontKey } })}
              >
                {FONT_KEYS.filter((k) => FONTS[k].script === "latin").map((k) => (
                  <option key={k} value={k}>
                    {FONTS[k].label}
                  </option>
                ))}
              </NativeSelect>
              <p className="truncate text-2xl" style={{ fontFamily: `var(${FONTS[theme.fonts[role]].cssVar})` }}>
                {bundle.wedding.partner_one_name || "Aa"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <Button type="button" variant="outline" disabled={!canEdit || Object.keys(overrides).length === 0} onClick={() => saveOverrides({})}>
          Reset to template style
        </Button>
      </div>
    </div>
  );
}
