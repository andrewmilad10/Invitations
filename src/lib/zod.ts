import { z } from "zod";

/**
 * Zod, set up once. Zod normally tests for `new Function` to speed up checks;
 * the strict script policy on signed-in pages forbids that, so the test would
 * be reported as a violation. With `jitless`, checks work the same without
 * it. Import Zod from here (not "zod") so this runs before any schema is made.
 */
z.config({ jitless: true });

export { z };
