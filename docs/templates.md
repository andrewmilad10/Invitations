# Template system

A template is **presentation only**. It receives an `InvitationModel` and
renders it. It never queries the database, never hard-codes a couple, a date,
a venue, a color or an image.

## Concepts

```
Template ──► Layout (Renderer) ──► Sections ──► InvitationModel ──► HTML
```

* **Section definition** (`src/core/sections/registry.ts`) — template-agnostic: the
  section's type, its Zod content schema, localized default content and the
  editor field descriptors. Defined once, shared by every template.
* **Template manifest** (`src/templates/<id>/manifest.ts`, type in
  `src/core/template/manifest.ts`) — metadata, which
  sections it supports and in what default order, its theme defaults and
  palette presets.
* **Renderer** (`src/templates/<id>/Renderer.tsx`) — the layout: page chrome,
  opening sequence, and a map from section type → React component.

## The contract

The contract is split in two so the dashboard never loads animation code:

```ts
// src/core/template/manifest.ts — data only, importable anywhere
interface TemplateManifest {
  id: string;                    // stored in weddings.template_id — never rename
  name: string;
  description: string;
  tagline: string;
  previewImage: string;          // /public path for the picker card
  renderer: string;              // layout key in src/templates/renderers.tsx
  categories: TemplateCategory[];// gallery styles, main one first
  stationery: { ornament; layout?; shape? }; // the design's card
  family?: string;               // variants of one design (portrait / square / arch)
  isNew?: boolean;               // "New" badge, first under "Newest"
  supportedSections: SectionType[];
  defaultSectionOrder: SectionType[];
  defaultDisabled?: SectionType[];
  themeDefaults: ThemeTokens;    // complete token set
  palettes: ThemePalette[];      // named colour themes, each with a colour `family`
  features: { opening: 'envelope' | 'none'; music: boolean; hero?: 'photo' | 'card' };
  status: 'available' | 'beta' | 'hidden';
}

// src/templates/types.ts — the presentation half
interface TemplateRendererProps { model: InvitationModel }
// src/templates/renderers.tsx maps template id → Renderer component
```

`InvitationModel` (see `src/core/invitation/model.ts`) gives a template
everything already resolved: couple names and a display name, the formatted
date in the right locale and time zone, `dir`, the merged theme (and the CSS
variables for it), the ordered list of *enabled* sections with parsed content,
events split by kind, and public media URLs.

## Theming inside a template

The renderer root applies `themeToCssVars(model.theme)`, which produces:

```
--inv-bg  --inv-surface  --inv-fg  --inv-muted  --inv-accent
--inv-accent-fg  --inv-border
--inv-font-heading  --inv-font-body  --inv-font-accent
--inv-radius  --inv-shadow
```

Components use these (`bg-[var(--inv-bg)]`, `font-[family-name:var(--inv-font-heading)]`,
or plain CSS). **A literal color in a template component is a bug.** The
only exceptions are neutral overlays (e.g. `rgb(0 0 0 / .4)` for image scrims).

## Adding a template

1. Create `src/templates/<id>/` with `manifest.ts`, `Renderer.tsx` and a
   component for each section type you support.
2. Add the manifest to `src/templates/registry.ts` and the renderer to
   `src/templates/renderers.tsx`.
3. Add a preview image at `public/templates/<id>.jpg` (or reuse the generated
   sample preview).
4. Visit `/templates/<id>/preview` to see it with sample data, and run
   `npm test` — the registry test checks every template supports the
   required sections and has a complete token set.

No migration, no dashboard change: the wizard and theme panel read the
registry.

## Adding a section type

1. In `src/core/sections/registry.ts`: add the type to `SECTION_TYPES`, its
   Zod schema to `sectionSchemas`, and a definition (label, default content
   per locale, editor `fields`) to `SECTION_DEFINITIONS`. Add default copy to
   `src/core/i18n/dictionaries.ts` for each locale.
3. Add a component to each template that should support it and list it in
   that template's `supportedSections`/`defaultSectionOrder`.

The editor renders a form for the section automatically from its field
descriptors (`text`, `textarea`, `list`). Sections that also manage other
data declare it in `manages` (an event kind, or a media purpose) and the
editor adds the matching controls.

Because section rows are sparse overrides (see `docs/database.md`), every
existing wedding immediately gets the new section with its default content.

## Section library (Phase 1)

| Type        | Data source |
| ----------- | ----------- |
| `hero`      | names, date, hero image (media `hero`), eyebrow/tagline |
| `couple`    | names + intro copy |
| `date`      | wedding date, formatted per locale/time zone |
| `countdown` | first ceremony start, else wedding date |
| `story`     | heading + paragraphs |
| `ceremony`  | first `events` row of kind `ceremony` |
| `reception` | first `events` row of kind `reception` |
| `venue`     | map + directions for events with an address |
| `gallery`   | media `gallery`, ordered |
| `schedule`  | custom timeline items, else derived from events |
| `rsvp`      | placeholder copy (Phase 2 makes it a form) |
| `closing`   | heading + message |
| `footer`    | names, date, optional note |

## The cinematic opening

The `cinematic` template's opening is an overlay that sits *on top of* the
page, never in document flow:

1. The page (hero first) renders normally underneath; scrolling is locked.
2. A fixed overlay shows a fully closed envelope; the card is inside a
   clipped pocket, so no part of it is visible.
3. Tapping the seal: seal breaks → flap opens in 3D → card rises out of the
   pocket → envelope falls away → the card scales to exactly cover the
   viewport, showing the same image/colors as the hero beneath.
4. The overlay fades to reveal the identical hero, is **removed from the DOM**,
   and scrolling is unlocked. Nothing in the flow moved, so there is no blank
   space and no layout jump.

`prefers-reduced-motion` replaces the sequence with a short cross-fade.
Preview mode skips the opening unless "Replay opening" is pressed.

## Section style hints

Each section row may carry `style` (`wedding_sections.style`, separate from
content): `tone` (`default` · `light` · `dark` · `accent`), `spacing`
(`compact` · `normal` · `airy`) and `align` (`center` · `start`). They are
resolved in `src/core/sections/style.ts` and reach templates on every
`RenderedSection`:

* **Tone** re-maps the theme's own `--inv-*` variables around the section
  (`sectionToneVars`), so a dark or accent section needs no template code and
  can never introduce a colour outside the couple's theme.
* **Spacing / alignment** are exposed as `data-spacing` / `data-align` on a
  `display: contents` wrapper (`group/sec`). A template's section component
  honours them with `group-data-[spacing=…]/sec:` utilities; alignment also
  has a shared rule in `globals.css`.

A template that doesn't want a hint simply ignores it — the data stays valid.

## The design collection

Most templates are **designs**: an entry in
`src/templates/collection/designs.ts` that reuses a layout and describes its
card. No images are involved — every motif is original line art drawn in
code, in the theme's own colours:

```
src/templates/shared/stationery/
  ornaments.tsx   27 motifs (garland, wreath, deco fans, olive, tiles, citrus,
                  roses, confetti, stars, watercolour washes, …), procedural
                  SVG with a seeded RNG so server and client match
  card.tsx        StationeryCard: shape (portrait · square · arch) +
                  layout (classic · script · typographic · monogram ·
                  photo-top · photo-full · photo-grid · polaroid) + motif
src/templates/shared/card-hero.tsx
                  the "card" hero: the invitation opens with the design's card,
                  filled in with the couple's names, date, venue and photos
src/templates/collection/palettes.ts
                  26 named colour themes shared by designs
```

`StationeryCard` reads only `--inv-*` variables, so the same component draws
gallery thumbnails (the marketing `Stationery` wrapper sets the variables from
a palette) and the live invitation (the invitation root sets them from the
couple's theme).

Adding a design:

```ts
design({
  id: "my-design", name: "My Design", tagline: "…", description: "…",
  categories: ["floral", "elegant"],
  art: { ornament: "garland", layout: "script", shape: "arch" },
  fonts: { heading: "cormorant", body: "jost", accent: "greatvibes" },
  palettes: ["blush", "sage", "delft"],   // first = default look
  family: "my-design",                    // optional: groups shape variants
  isNew: true,
})
```

`npm test` checks every design: known categories, motif, layout and shape;
unique palette ids with a colour family; a family has at least two members;
and WCAG contrast (text ≥ 4.5:1 on background and card, button text ≥ 3:1)
in **every** palette.

The gallery (`src/features/marketing/gallery`) filters by style, colour
family (showing each design in its matching palette), shape and photo, sorts
by featured / newest / A–Z, and keeps filters in the URL. Saved designs are
stored in the browser only (`localStorage`, no account needed).
