# Design rules

Vellum should look made by a stationer, not generated. Read before changing
any page, card, colour, font or animation.

## Identity

- Colours: the tokens in `src/app/globals.css` (`--background`, `--forest`,
  `--accent`, …). Never a new hex in a component; add or reuse a token.
- The deep forest green (`--forest`, `.linen-forest`) and the brass accent
  (`--accent`) are the brand. Cream is the page, not the personality.
- The product is the picture: show real cards, envelopes and websites drawn
  in code. No stock photography in Vellum's own sections.

## Colour matching (cards and themes)

- Every palette passes the contrast tests in `src/templates/registry.test.ts`:
  text on background and on card surface ≥ 4.5:1, button text ≥ 3:1. Add a
  palette, run the tests.
- A palette has one paper colour, one ink, one accent. The accent is for
  names, ornaments and foil, never for body text.
- Check every palette on paper as well as screen: avoid very saturated
  accents on dark paper (they print muddy) and pale accents on light paper.
- Foil (gold, rose gold, silver) replaces the accent; the text under it must
  still pass contrast on the paper.
- Colours taken from a couple's photo are softened: paper pushed towards
  light, ink towards dark, so the card stays readable.

## Fonts

- Themes refer to fonts by key (`src/core/theme/fonts.ts`), never by family
  name. Fonts are self-hosted through `next/font/local`.
- At most two families per card plus one script for names. Body text is
  never a script face.
- Arabic always gets a real Arabic face (Amiri for display, Noto Naskh for
  text), set right to left, with Arabic numerals and dates.
- Line length under ~75 characters; headings use `text-wrap: balance`.

## Writing

- Plain words, sentence case, active voice. Say what a button does
  ("Choose a design", not "Submit").
- Lists of tags read as a sentence: use `listWords` (`src/lib/words.ts`),
  never words joined with " · ".
- No: tracked uppercase labels above headings, one italic or coloured word
  inside a heading, "actually", "seamless", "unlock", "elevate".
- Sample couples are varied and local as well as international
  (Layla & Omar, Salma & Youssef, Grace & Henry…). Never real people.

## Layout and components

- Cards, borders and shadows mark separate objects; do not put the same
  rounded card and soft shadow on everything.
- Numbered markers only for real sequences (steps of a process).
- "New" badges only on designs added in the latest batch (`isNew`).
- Everything works at 390px wide with no sideways scroll.

## Real stationery finish

Every invitation (cards, envelopes, openings and website heroes) must look
like real printed stationery, never flat graphics. Apply all four:

1. **Realistic shadows.** Layered, soft and directional: a tight contact
   shadow under edges plus a wide, faint ambient shadow; flaps cast
   shadows on the paper beneath them. No hard or uniform drop shadows.
2. **Embossed / debossed effect.** Monograms, crests, borders and seals
   are pressed into or raised from the paper: a light edge on one side and
   a dark edge on the other (consistent light from the top left).
3. **Texture.** Paper, linen or card stock grain on every surface: fine,
   subtle and matched across all layers so pieces read as one material.
4. **Foil details.** Gold, silver or rose-gold foil on accents (names,
   ornaments, rules, seal rims) with a metallic gradient and a soft sheen,
   used sparingly.

Envelopes follow one shape: a pointed top flap with a softly rounded tip
carrying the seal, side and bottom flaps meeting beneath it, every fold a
fine dark crease with a thin light edge beside it.

## Motion

- See `docs/motion.md`. One orchestrated moment per page beats an animation
  on every section.
- Animate `transform` and `opacity` only; never write CSS variables or
  layout properties every frame. Respect `prefers-reduced-motion`.
- Test smoothness on a throttled phone profile before shipping motion.

## Originality

- Never copy designs, artwork or photos from Canva, Zola, Minted or anyone
  else. Take ideas, draw originals.
- Never use real couples' names or photos.
