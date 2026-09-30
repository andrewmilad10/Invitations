# Legacy prototypes

`invitations-v2/` is the original static HTML/CSS/JS invitation (from the
`andrewmilad10/Invitations` repository), kept **for design reference only**.

It is not built, deployed or imported by the application. Its ideas were
generalised into the data-driven platform:

| Prototype                         | Platform equivalent                                   |
| --------------------------------- | ----------------------------------------------------- |
| `config.js` (one hard-coded couple) | `weddings` + related tables, one row set per wedding |
| Envelope + wax seal in `script.js`  | `src/templates/cinematic/opening/`                  |
| Church / venue cards                | `events` table + `ceremony` / `reception` sections  |
| Gallery array                       | `media` table (purpose `gallery`) + Supabase Storage |
| RSVP in `localStorage`              | `rsvp` section placeholder (Phase 2: real RSVP)      |

The prototype's MP3 was intentionally not copied; music is uploaded per wedding.
