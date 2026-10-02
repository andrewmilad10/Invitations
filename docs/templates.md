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

## The Atelier family (`src/templates/atelier`)

An editorial, calligraphic layout for invitation websites: a colour-washed
photo opening, flourished script titles, tall display capitals and italic
serif prose on grained paper (`.inv-paper`), a sealed envelope for replies,
questions & answers, and a story with an oval portrait and an instant print.

Font roles: **accent** = calligraphy (names, section titles), **heading** =
display capitals, **body** = serif (italic for prose). Colour roles:
background/surface = paper, foreground = ink, **accent = the "room" colour**
(the photo wash and the dark sections), accent-foreground = paper on it.

Templates: Meadow (olive), Monochrome (black & white photos), Riviera,
Terracotta, Nocturne (dark paper), Rosewater — each with 2–4 palettes, all in
`atelier/manifests.ts`. Couples can further change colours, fonts, corners,
shadow and **photos: colour / black & white** in the Design panel.

Sections added for this family and available to every layout: **faq**
(questions & answers), a **quote** on the story, and an optional https-only
**reply link** on RSVP.

## The Showpiece family (`src/templates/showpiece`)

Twelve wedding websites with their own opening moment and motion, drawn by
one layout (`Renderer.tsx`; the renderer key picks the variant). Each
variant has a "look" (`variants.ts`: gate, nile, herbarium or toast) that
dresses the shared sections and fixes the colour roles its palettes follow.
The newer variants keep their hero and emblem in `creative.tsx` /
`landmarks.tsx`, and their opening scene in `creative-open.tsx` /
`landmarks-open.tsx` (registered as scenes, see `scene.ts`).

| Template | Renderer | Opening | Inside |
| --- | --- | --- | --- |
| The Gate | `gate` | palace doors sealed with the couple's initials; the seal breaks and the doors swing open in 3D | tilting card stack, falling gold, flip-style countdown tiles, fanned photos, a gold timeline that draws itself |
| Moonlit Nile | `nile` | a night river; a tap releases lanterns and the felucca sails away | sky, moon, palms and river at different depths; moon countdown; lanterns light along the day |
| Pressed Garden | `herbarium` | a linen book whose cover swings open on a blooming flower | sprigs, swinging herbarium tags, stems that draw themselves |
| Gilded Toast | `toast` | a gold Deco frame draws itself; tapping the coupe fills it and lifts the curtain | Deco arch, turning sunburst, the evening as a menu card |
| Written in the Stars | `stars` | stars join into a heart; a shooting star crosses | a gold armillary sphere turning around the initials, twinkling sky |
| Paper Theatre | `popup` | a folded card opens and a paper stage pops up layer by layer | cut-paper sun, clouds, hills, arch and curtains at their own depths; hanging paper stars |
| Rose Window | `glass` | coloured glass sets into a rose window; light pours in | the glowing window, coloured light falling across the page |
| The Keepsake Box | `keepsake` | a 3D gift box: the bow unties, the lid lifts, the card rises | ribbon and bow, a floating photo, ticket and pressed flower |
| Giza at Dusk | `giza` | night under the pyramids; the sun rises behind them | pyramids, dunes and a camel caravan at their own depths, drifting dust |
| Baron Palace | `baron` | the palace draws itself in gold; every window lights up | the palace in gold line with flickering windows, a gold arch frame |
| Montaza by the Sea | `montaza` | a wave rolls in over the screen | the tower, arcade and tea-island bridge over a moving sea, gulls, a sail |
| Luxor Temple | `luxor` | a walk through the colonnade into the light | papyrus columns gliding past in 3D, names in a gold cartouche |

The Egypt venue drawings are original and simple; the openings greet guests
with the couple's own venue name when they gave one (the sample shows the
place the design draws). These four carry the "egyptian" style category.

The openings (`opening.tsx`) follow the cinematic contract: shown on live and
sample pages, hidden in the editor until "Replay opening", never in exports,
and replaced by a short fade with reduced motion. `effects.tsx` adds scroll
reveals, the self-drawing timeline, pointer tilt and depth — only once it has
set `data-fx="on"`, so every page reads fully without JavaScript. Colours
come only from `--inv-*` (roles per variant are documented in the renderer).
The RSVP section shows the couple's reply link; collecting replies in Vellum
is Phase 2.

## The Essentials family (`src/templates/essentials`)

Four simple websites with no opening and almost no motion (the hero settles
in on load): Simple Linen (`linen`, centred and classic), Monogram
(`monogram`, initials in a double ring, ruled boxes), Side by Side (`split`,
the photo held beside the details on wide screens) and Modern Type
(`modern`, left-aligned type, the date in numerals, hairline rows).

## The Kit collection (`src/templates/kit`)

Twenty-four full wedding websites, built four at a time. Each template has its
own renderer and CSS module (`kit/<name>/Renderer.tsx`, `<name>.module.css`):
its own layout, type system, hero, section designs, gallery, RSVP, shapes and
motion. What they share is plumbing, not looks:

| Piece | File | What it gives a template |
| --- | --- | --- |
| Data helpers | `kit/data.ts` | `KIT_SECTIONS`, schedule/FAQ/photo pickers, `kitCopy` (en/ar labels), `roman`, `pad2` |
| Root + parts | `kit/pieces.tsx` | `KitRoot`, `Pic` (photo with a `[data-grade]` layer for the template's colour grade), `Sec`, `Clock`, `KitMap`, `ReplyLink`, `Directions`, `fx()` |
| Motion | `kit/motion.tsx`, `kit/kit.module.css` | `fx("rise" \| "fade" \| "blur" \| "scale" \| "mask" \| "mask-up" \| "wipe" \| "line" \| "zoom", delay)`, `data-k-stagger`, `data-k-parallax`, `data-k-progress` |
| Opening | `kit/intro.tsx` | `KitIntro`: an optional opening overlay with phases, skip, replay and scroll lock |
| Manifest | `kit/manifest.ts`, `kit/manifests.ts` | `kitTemplate()` and the palettes |

Motion tokens are CSS variables on the template root (`--k-dur`, `--k-ease`,
`--k-dist`, `--k-step`), so each template sets its own tempo. Hidden "before"
states only exist once `data-fx="on"` is set (live and sample pages, no
reduced motion), so the editor, exports and no-JS views always show
everything. Clip-path reveals are triggered through their parent, because a
fully clipped element never reports as visible.

**Adding a kit template:** make `kit/<name>/Renderer.tsx` + CSS module
(colours from `--inv-*` only), add its manifest to `KIT_MANIFESTS`, register
the renderer key in `renderers.tsx` and `renderers.client.tsx`, add a
thumbnail to `LAYOUT_HEROES` in `features/marketing/gallery/website-thumb.tsx`.

| # | Template | Key | Idea |
| --- | --- | --- | --- |
| 1 | Editorial Romance | `romance` | Fashion-magazine: B&W portrait, giant italic Didone names in difference blend, drop-cap letter, numbered spreads, photo plates, parallax closing |
| 2 | Old Money | `heritage` | Engraved card under a drawn laurel crest, club-tie stripes, Roman-numeral order of the day, framed prints, a reply card |
| 3 | Modern Minimal | `minimal` | Swiss grid with column guides, giant light names, numbered sections with self-drawing rules, table details, scroll-snap photo strip, colour-block RSVP |
| 4 | Italian Summer | `limone` | Fluttering striped awning, swaying lemon branches, arched window on majolica tiles, scalloped card, trattoria-menu schedule, scattered snapshots |
| 5 | Black Tie | `blacktie` | Night and a scroll-following spotlight, wide Didone capitals, bevel-cornered ivory cards, a centre-line programme; opens on satin lapels that part at the bow tie |
| 6 | French Garden | `jardin` | A self-drawing parterre plan, trellis frames, a garden-stake date, topiary countdown, stepping-stone schedule, diamond-lattice gallery, seed-packet reply |
| 7 | Luxury Magazine | `glossy` | A cover with initials masthead, cover lines and barcode; a linked contents page, feature columns, "by the numbers", running order, portfolio, tear-out reply card |
| 8 | Vintage Paper | `ephemera` | Grainy aged paper, deckled letterpress card, postmark stamp, typed letter, tear-off calendar, mechanical counter, luggage tags, index card, library-card reply |
| 9 | The Arch | `arch` | A colonnade hero, nested-arch date, arched countdown panes, an arcade schedule, arched-window gallery, doorway reply; arches open upwards |
| 10 | Film Story | `film` | Projector-leader opening, letterboxed title credits, clapperboard date, screenplay scenes, end-credits schedule, film-strip gallery, marquee "coming soon" reply, iris-out end |
| 11 | Botanical Glasshouse | `glasshouse` | Photo seen through a domed glasshouse, swaying oversized leaves, frosted panels, pot-and-sprout date, glazed countdown, climbing-vine schedule, gabled cold-frame cards |
| 12 | Monogram House | `house` | Initials as a monogram canvas and seal, a gift box whose lid lifts, embossed date, watch-dial countdown, care-label schedule, lookbook gallery, shopping-bag reply |

Extra reveal variants in `kit.module.css`: `draw` (paths marked `data-draw` with
`pathLength="1"`, fills marked `data-draw-fill`), `stamp`, `drop`, `archopen`, `iris` and `letterbox`. Parallax offsets are clamped to one screen height.
