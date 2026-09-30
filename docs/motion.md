# Motion

Premium, cinematic, quiet. Motion supports the content; the page breathes.

## The system (`src/features/motion`)

Declarative, server-renderable components that only add `data-*` attributes,
and **one** client engine that animates them with GSAP ScrollTrigger:

| Component | Use it for |
| --- | --- |
| `<Reveal variant="up·fade·left·right·scale" delay duration>` | one element |
| `<FadeUp>` / `<FadeIn>` | shorthands for Reveal |
| `<Stagger step={110}>` | a sequence: title → text → cards → CTA |
| `<RevealGroup step={100}>` | long grids; each child when *it* arrives; late children (filters, "show more") join automatically |
| `<RevealLines lines={[…]}>` | large headings revealed line by line behind a mask |
| `<ImageReveal>` | editorial photo: the frame opens from a slight crop while the photo settles from 1.08 |
| `<Parallax speed={0.08}>` | large background photos only; desktop only |
| `data-draw` | a line drawn once (e.g. "How it works") |

`<PageTransition>` (in each marketing `page.tsx`) mounts the engine and the
page-to-page view transition. The homepage hero opening is **pure CSS**
(`.open-*` in `globals.css`) so it plays on first paint, before JavaScript.

## Timing

| | duration | ease |
| --- | --- | --- |
| hover / micro | 200–400 ms | ease-out |
| cards, stagger items | 800 ms, 80–150 ms apart | expo.out |
| section elements, heading lines | 900–1050 ms | expo.out |
| large photos | 1200–1400 ms | expo.out |
| hero opening | ~1.5 s total | cubic-bezier(.22,1,.36,1) |

Reveals start when an element's top reaches 82% of the viewport (~20% in).

## Rules

* Animate only `transform`, `opacity`, `clip-path`.
* Each element animates once. Content already scrolled past on load
  (reload mid-page, back navigation) is shown instantly — scrolling up never
  finds holes.
* Hidden states exist only under `html.motion`, which a `beforeInteractive`
  script adds before first paint — and never with `prefers-reduced-motion`.
  If the engine hasn't started within 4 s, `html.motion-failed` shows
  everything. With JavaScript off, nothing is hidden.
* Phones: half the travel distance, no parallax, native scrolling (Lenis
  smooth scrolling is for wheel/trackpad only; dialogs and
  `[data-lenis-prevent]` are excluded).
* Hierarchy: hero, large photography, headings, design cards and major CTAs
  animate; features and descriptions gently; navigation, footer and small
  metadata don't.
* Invitation templates have their own motion (`src/templates/cinematic/motion.tsx`)
  and use `data-reveal`; the site system uses `data-motion`, so they never collide.
