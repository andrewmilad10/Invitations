# Template system

A template is **presentation only**. It receives an `InvitationModel` and
renders it. It never queries the database, never hard-codes a couple, a date,
a venue, a color or an image.

## Concepts

```
Template ──► Layout (Renderer) ──► Sections ──► InvitationModel ──► HTML
```

* **Section definition** (`src/core/sections/`) — template-agnostic: the
  section's type, its Zod content schema, localized default content and the
  editor field descriptors. Defined once, shared by every template.
* **Template manifest** (`src/templates/<id>/manifest.ts`) — metadata, which
  sections it supports and in what default order, its theme defaults and
  palette presets.
* **Renderer** (`src/templates/<id>/Renderer.tsx`) — the layout: page chrome,
  opening sequence, and a map from section type → React component.

## The contract

```ts
// src/templates/types.ts (abridged)
interface TemplateManifest {
  id: string;                    // stored in weddings.template_id — never rename
  name: string;
  description: string;
  tagline: string;
  previewImage: string;          // /public path for the picker card
  supportedSections: SectionType[];
  defaultSectionOrder: SectionType[];
  defaultDisabled?: SectionType[];
  themeDefaults: ThemeTokens;    // complete token set
  palettes: ThemePalette[];      // one-click color presets for the editor
  features: { opening?: 'envelope' | 'none'; music?: boolean };
  status: 'available' | 'beta' | 'hidden';
}

interface WeddingTemplate extends TemplateManifest {
  Renderer: ComponentType<TemplateRendererProps>;   // { model: InvitationModel }
}
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
2. Add it to `src/templates/registry.ts`.
3. Add a preview image at `public/templates/<id>.jpg` (or reuse the generated
   sample preview).
4. Visit `/templates/<id>/preview` to see it with sample data, and run
   `npm test` — the registry test checks every template supports the
   required sections and has a complete token set.

No migration, no dashboard change: the wizard and theme panel read the
registry.

## Adding a section type

1. Create `src/core/sections/definitions/<type>.ts`: Zod schema, default
   content per locale and `fields` for the editor.
2. Register it in `src/core/sections/registry.ts` and add the type to
   `SECTION_TYPES`.
3. Add a component to each template that should support it and list it in
   that template's `supportedSections`/`defaultSectionOrder`.

The editor renders a form for the section automatically from its field
descriptors (text, textarea, toggle, select, list). Sections that need bespoke
editing (gallery uploads, events) declare `editor: 'custom'`.

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
