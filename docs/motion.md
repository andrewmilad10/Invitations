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

One knob sets the pace: `TEMPO` in `motion-engine.tsx` multiplies every
duration, delay and stagger (currently 1.2 — calm, not slow). Easing is
`power3.out`: an even settle with no bounce.

| | at TEMPO 1.2 |
| --- | --- |
| cards, grid items | ~0.95 s, ~120 ms apart |
| section elements | ~1.1 s |
| heading lines | ~1.25 s, ~110 ms apart |
| large photos | 1.45–1.7 s |
| hero opening (CSS) | ~2 s for the photo, text done by ~2 s |
| page to page | 170 ms out, 340 ms in |

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
