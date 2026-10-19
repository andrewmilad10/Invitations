/**
 * The guest list as the couple sees it: each listed guest with their reply,
 * plus replies that came through the general link, and the totals on top.
 * Pure functions so the counting can be tested.
 */

export type ReplyStatus = "yes" | "no" | "wait";

export interface GuestLike {
  id: string;
  name: string;
  groups: string[];
  max_party: number | null;
  token: string;
  open_count: number;
  last_opened_at: string | null;
  created_at: string;
}
export interface ReplyLike {
  id: string;
  guest_id: string | null;
  name: string;
  attending: boolean;
  party_size: number;
  note: string | null;
  answers: unknown;
  updated_at: string;
}

export interface GuestLine {
  /** Guest id, or the reply id for someone who replied through the general link. */
  key: string;
  guestId: string | null;
  replyId: string | null;
  name: string;
  groups: string[];
  status: ReplyStatus;
  people: number;
  note: string | null;
  answers: Record<string, string>;
  repliedAt: string | null;
  opens: number;
  token: string | null;
  maxParty: number | null;
  /** Replied through the general link (not on the couple's list). */
  general: boolean;
}

export interface Totals {
  /** Lines on the list: invited guests plus general-link replies. */
  invitations: number;
  replied: number;
  coming: number;
  /** People coming (party sizes added up). */
  people: number;
  cantCome: number;
  waiting: number;
  /** Share of invitations answered, 0–100. */
  percent: number;
}

const answersOf = (a: unknown): Record<string, string> =>
  a && typeof a === "object" && !Array.isArray(a) ? Object.fromEntries(Object.entries(a as Record<string, unknown>).filter(([, v]) => typeof v === "string")) as Record<string, string> : {};

export function guestLines(guests: GuestLike[], replies: ReplyLike[]): GuestLine[] {
  const byGuest = new Map(replies.filter((r) => r.guest_id).map((r) => [r.guest_id as string, r]));
  const listed: GuestLine[] = guests.map((g) => {
    const r = byGuest.get(g.id);
    return {
      key: g.id,
      guestId: g.id,
      replyId: r?.id ?? null,
      name: g.name,
      groups: g.groups,
      status: r ? (r.attending ? "yes" : "no") : "wait",
      people: r?.attending ? r.party_size : 0,
      note: r?.note ?? null,
      answers: answersOf(r?.answers),
      repliedAt: r?.updated_at ?? null,
      opens: g.open_count,
      token: g.token,
      maxParty: g.max_party,
      general: false,
    };
  });
  const general: GuestLine[] = replies
    .filter((r) => !r.guest_id)
    .map((r) => ({
      key: r.id,
      guestId: null,
      replyId: r.id,
      name: r.name,
      groups: [],
      status: r.attending ? "yes" : "no",
      people: r.attending ? r.party_size : 0,
      note: r.note,
      answers: answersOf(r.answers),
      repliedAt: r.updated_at,
      opens: 0,
      token: null,
      maxParty: null,
      general: true,
    }));
  return [...listed, ...general];
}

export function totals(lines: GuestLine[]): Totals {
  const invitations = lines.length;
  const coming = lines.filter((l) => l.status === "yes").length;
  const cantCome = lines.filter((l) => l.status === "no").length;
  const replied = coming + cantCome;
  return {
    invitations,
    replied,
    coming,
    people: lines.reduce((n, l) => n + (l.status === "yes" ? l.people : 0), 0),
    cantCome,
    waiting: invitations - replied,
    percent: invitations ? Math.round((replied / invitations) * 100) : 0,
  };
}

/** How many said yes to each yes/no question, out of those who answered it. */
export function questionTotals(lines: GuestLine[], questions: { id: string; text: string; kind: string }[], yesWords: string[] = ["Yes", "نعم"]) {
  return questions
    .filter((q) => q.kind === "yesno" && q.id)
    .map((q) => {
      const answered = lines.filter((l) => l.status === "yes" && l.answers[q.id]);
      return { id: q.id, text: q.text, yes: answered.filter((l) => yesWords.includes(l.answers[q.id])).length, of: answered.length };
    });
}

/**
 * Names pasted as a list: one per line (a trailing ", group" puts them in a
 * group). Blank lines and names already on the list (any capitals or spacing)
 * are skipped, so pasting the same list twice adds nothing.
 */
export function parsePastedGuests(text: string, existing: string[], limit = 1000) {
  const seen = new Set(existing.map(norm));
  const add: { name: string; groups: string[] }[] = [];
  let duplicates = 0;
  let lines = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    lines++;
    const [namePart, groupPart] = line.split(/\s*[,;\t]\s*(?=[^,;\t]*$)/);
    const name = (groupPart !== undefined ? namePart : line).slice(0, 120).trim();
    const group = groupPart?.slice(0, 40).trim();
    if (!name) continue;
    if (seen.has(norm(name))) {
      duplicates++;
      continue;
    }
    seen.add(norm(name));
    if (add.length < limit) add.push({ name, groups: group ? [group] : [] });
  }
  return { add, duplicates, lines, overLimit: Math.max(0, lines - duplicates - limit) };
}
const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** The list as a spreadsheet (CSV, with a BOM so Excel reads Arabic correctly). */
export function guestsCsv(lines: GuestLine[], questions: { id: string; text: string }[], linkFor: (token: string) => string): string {
  const head = ["Name", "Groups", "Reply", "People", "Note", ...questions.map((q) => q.text), "Replied", "Opened", "Personal link"];
  const status = { yes: "Coming", no: "Can't come", wait: "Waiting" } as const;
  const rows = lines.map((l) => [
    l.name,
    l.groups.join(", "),
    status[l.status],
    l.status === "yes" ? String(l.people) : "",
    l.note ?? "",
    ...questions.map((q) => l.answers[q.id] ?? ""),
    l.repliedAt ? l.repliedAt.slice(0, 16).replace("T", " ") : "",
    String(l.opens),
    l.token ? linkFor(l.token) : "General link",
  ]);
  return "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}
function cell(v: string): string {
  // keep spreadsheet formulas from running when the file is opened
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
