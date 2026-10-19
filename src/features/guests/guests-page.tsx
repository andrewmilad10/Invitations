"use client";

import { ArrowLeft, Check, Copy, Download, Eye, EyeOff, Link2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { guestLines, guestsCsv, questionTotals, totals, type GuestLine, type ReplyStatus } from "@/core/guests/summary";
import type { GuestRow, WishRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { addGuest, addGuestList, deleteGuests, deleteReply, deleteWish, setWishHidden, updateGuest } from "./actions";
import type { GuestsPageData } from "./queries";

type Filter = "all" | ReplyStatus;
const STATUS: Record<ReplyStatus, { label: string; cls: string }> = {
  yes: { label: "Coming", cls: "bg-[#e3ece5] text-success" },
  no: { label: "Can't come", cls: "bg-[#f4e2df] text-destructive" },
  wait: { label: "Waiting", cls: "bg-[#f3ead6] text-[#8a6a2c]" },
};

/**
 * The couple's guest list: who's coming at a glance, every reply with its note
 * and answers, personal links to copy, adding guests one at a time or as a
 * pasted list, the wishes guests left, and the whole list as a spreadsheet.
 */
export function GuestsPage({ data, siteUrl }: { data: GuestsPageData; siteUrl: string }) {
  const { wedding, canEdit, questions } = data;
  const [guests, setGuests] = useState<GuestRow[]>(data.guests);
  const [replies, setReplies] = useState(data.replies);
  const [wishes, setWishes] = useState<WishRow[]>(data.wishes);
  const [tab, setTab] = useState<"replies" | "wishes">("replies");
  const [filter, setFilter] = useState<Filter>("all");
  const [group, setGroup] = useState<string>("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<GuestRow | null>(null);

  const lines = useMemo(() => guestLines(guests, replies), [guests, replies]);
  const sum = totals(lines);
  const qTotals = questionTotals(lines, questions);
  const groups = useMemo(() => [...new Set(guests.flatMap((g) => g.groups))].sort(), [guests]);
  const shown = lines.filter(
    (l) => (filter === "all" || l.status === filter) && (!group || l.groups.includes(group)) && (!q || l.name.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const general = `${siteUrl}/w/${wedding.slug}`;
  const linkFor = (token: string) => `${general}?g=${token}`;
  const published = wedding.status === "published";

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it yourself.");
    }
  }
  function download() {
    const blob = new Blob([guestsCsv(lines, questions, linkFor)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${wedding.slug}-guests.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function removePicked() {
    const ids = [...picked].filter((k) => guests.some((g) => g.id === k));
    const replyIds = [...picked].filter((k) => !ids.includes(k));
    if (!ids.length && !replyIds.length) return;
    const res = await deleteGuests(wedding.id, ids);
    for (const r of replyIds) await deleteReply(wedding.id, r);
    if (!res.ok) return toast.error(res.error);
    setGuests((gs) => gs.filter((g) => !ids.includes(g.id)));
    setReplies((rs) => rs.filter((r) => !replyIds.includes(r.id) && !ids.includes(r.guest_id ?? "")));
    setPicked(new Set());
    toast.success(`Removed ${ids.length + replyIds.length}`);
  }

  const chip = (on: boolean) => cn("h-9 rounded-full border px-3.5 text-sm transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-muted-foreground");
  const count = (f: Filter) => (f === "all" ? sum.invitations : f === "yes" ? sum.coming : f === "no" ? sum.cantCome : sum.waiting);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={`/dashboard/weddings/${wedding.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {wedding.names}
          </Link>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Guests &amp; replies</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copy(general, "General link")} className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm hover:border-muted-foreground">
            <Link2 className="size-4" /> Copy general link
          </button>
          <button type="button" onClick={download} disabled={!lines.length} className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm hover:border-muted-foreground disabled:opacity-50">
            <Download className="size-4" /> Download list
          </button>
          {canEdit ? (
            <button type="button" onClick={() => setAdding(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
              <Plus className="size-4" /> Add guests
            </button>
          ) : null}
        </div>
      </div>

      {!published ? (
        <p className="mt-5 rounded-xl border border-[#e9d9b4] bg-[#f8f0dc] px-4 py-3 text-sm text-[#6f5523]">
          Your invitation isn&apos;t published yet. You can add guests now; their links and the reply form start working when you publish.
        </p>
      ) : null}

      <div role="tablist" className="mt-6 flex gap-6 border-b border-border">
        {(["replies", "wishes"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 py-2.5 text-[0.95rem]", tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
            {t === "replies" ? "Replies" : `Wishes${wishes.length ? ` (${wishes.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "replies" ? (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              [String(sum.invitations), sum.invitations === 1 ? "invitation" : "invitations", ""],
              [`${sum.percent}%`, `replied (${sum.replied} of ${sum.invitations})`, ""],
              [String(sum.people), sum.people === 1 ? "person coming" : "people coming", "text-success"],
              [String(sum.cantCome), "can't come", "text-destructive"],
              [String(sum.waiting), "still waiting", "text-[#8a6a2c]"],
            ].map(([v, l, c], i) => (
              <div key={l} className={cn("rounded-2xl border border-border bg-card px-4 py-3.5", i === 0 && "col-span-2 md:col-span-1")}>
                <dd className={cn("font-serif text-4xl tabular-nums", c)}>{v}</dd>
                <dt className="text-sm text-muted-foreground">{l}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <i className="bg-success transition-[flex-basis] duration-500" style={{ flexBasis: `${sum.invitations ? (sum.coming / sum.invitations) * 100 : 0}%` }} />
            <i className="bg-destructive transition-[flex-basis] duration-500" style={{ flexBasis: `${sum.invitations ? (sum.cantCome / sum.invitations) * 100 : 0}%` }} />
            <i className="bg-[#d8c49a] transition-[flex-basis] duration-500" style={{ flexBasis: `${sum.invitations ? (sum.waiting / sum.invitations) * 100 : 0}%` }} />
          </div>
          {qTotals.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {qTotals.map((t) => (
                <div key={t.id} className="grid gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{t.text}</span>
                    <b className="font-medium tabular-nums">
                      {t.yes} yes · {t.of} answered
                    </b>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <i className="block h-full bg-accent" style={{ width: `${t.of ? (t.yes / t.of) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <label className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search a name</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name" className="h-10 w-full rounded-full border border-border bg-card ps-9 pe-4 text-sm" />
            </label>
            {(["all", "yes", "no", "wait"] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={chip(filter === f)}>
                {f === "all" ? "All" : STATUS[f].label} <span className="opacity-70">{count(f)}</span>
              </button>
            ))}
            {groups.length ? (
              <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Group" className="h-9 rounded-full border border-border bg-card px-3 text-sm">
                <option value="">All groups</option>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            ) : null}
          </div>

          {picked.size && canEdit ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {picked.size} selected
              <button type="button" onClick={removePicked} className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1">
                <Trash2 className="size-4" /> Remove
              </button>
              <button type="button" onClick={() => setPicked(new Set())} aria-label="Clear selection" className="rounded-full p-1 hover:bg-primary-foreground/15">
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          {lines.length === 0 ? (
            <Empty canEdit={canEdit} onAdd={() => setAdding(true)} onCopy={() => copy(general, "General link")} />
          ) : (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[52rem] border-collapse text-sm">
                <thead>
                  <tr className="bg-background text-start text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {canEdit ? (
                      <th className="w-10 px-3 py-3">
                        <input type="checkbox" aria-label="Select all shown" checked={shown.length > 0 && shown.every((l) => picked.has(l.key))} onChange={(e) => setPicked(e.target.checked ? new Set(shown.map((l) => l.key)) : new Set())} />
                      </th>
                    ) : null}
                    {["Guest", "Group", "Reply", "People", "Note & answers", "Replied", "Opened", ""].map((h) => (
                      <th key={h} className="px-3 py-3 text-start font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((l) => (
                    <Row key={l.key} l={l} questions={questions} canEdit={canEdit} picked={picked.has(l.key)} onPick={(on) => setPicked((s) => { const n = new Set(s); if (on) n.add(l.key); else n.delete(l.key); return n; })} onCopy={() => l.token && copy(linkFor(l.token), `${l.name}'s link`)} onEdit={canEdit && l.guestId ? () => setEditing(guests.find((g) => g.id === l.guestId) ?? null) : undefined} />
                  ))}
                  {shown.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        No guests match.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Only you and people you share the invitation with can see this page. Guests only see the invitation.</p>
        </>
      ) : (
        <Wishes weddingId={wedding.id} wishes={wishes} setWishes={setWishes} canEdit={canEdit} on={data.wishesOn} />
      )}

      {editing ? (
        <AddGuests
          weddingId={wedding.id}
          defaultMax={data.maxGuests}
          guest={editing}
          onClose={() => setEditing(null)}
          onAdded={(rows) => setGuests((gs) => gs.map((g) => rows.find((x) => x.id === g.id) ?? g))}
        />
      ) : null}
      {adding ? (
        <AddGuests
          weddingId={wedding.id}
          defaultMax={data.maxGuests}
          onClose={() => setAdding(false)}
          onAdded={(rows) => setGuests((gs) => [...gs, ...rows])}
        />
      ) : null}
    </main>
  );
}

function Row({ l, questions, canEdit, picked, onPick, onCopy, onEdit }: { l: GuestLine; questions: { id: string; text: string }[]; canEdit: boolean; picked: boolean; onPick: (on: boolean) => void; onCopy: () => void; onEdit?: () => void }) {
  const answered = questions.filter((q) => l.answers[q.id]);
  return (
    <tr className="border-t border-border align-top">
      {canEdit ? (
        <td className="px-3 py-3">
          <input type="checkbox" aria-label={`Select ${l.name}`} checked={picked} onChange={(e) => onPick(e.target.checked)} />
        </td>
      ) : null}
      <td className="px-3 py-3 font-medium">
        {l.name}
        {l.general ? <span className="block text-xs font-normal text-muted-foreground">Replied through the general link</span> : null}
      </td>
      <td className="px-3 py-3">
        {l.groups.map((g) => (
          <span key={g} className="me-1 mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">
            {g}
          </span>
        ))}
      </td>
      <td className="px-3 py-3">
        <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS[l.status].cls)}>
          <span className="size-1.5 rounded-full bg-current" />
          {STATUS[l.status].label}
        </span>
      </td>
      <td className="px-3 py-3 tabular-nums">{l.status === "yes" ? l.people : <span className="text-muted-foreground">–</span>}</td>
      <td className="max-w-72 px-3 py-3">
        {l.note ? <p>{l.note}</p> : null}
        {answered.map((q) => (
          <p key={q.id} className="text-xs text-muted-foreground">
            {q.text}: <b className="font-medium text-foreground">{l.answers[q.id]}</b>
          </p>
        ))}
        {!l.note && !answered.length ? <span className="text-muted-foreground">–</span> : null}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{l.repliedAt ? new Date(l.repliedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "–"}</td>
      <td className="px-3 py-3 tabular-nums text-muted-foreground">{l.general ? "–" : `${l.opens}×`}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          {l.token ? (
            <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2.5 py-1 text-xs hover:border-muted-foreground">
              <Copy className="size-3.5" /> Copy link
            </button>
          ) : null}
          {onEdit ? (
            <button type="button" onClick={onEdit} aria-label={`Edit ${l.name}`} title="Edit" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Pencil className="size-3.5" />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function Empty({ canEdit, onAdd, onCopy }: { canEdit: boolean; onAdd: () => void; onCopy: () => void }) {
  return (
    <div className="mt-4 grid justify-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <p className="font-serif text-3xl">No guests yet</p>
      <p className="max-w-md text-muted-foreground">
        Add the people you&apos;re inviting to give each one their own link with their name on the invitation. Or share the general link and everyone who replies appears here.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {canEdit ? (
          <button type="button" onClick={onAdd} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Plus className="size-4" /> Add guests
          </button>
        ) : null}
        <button type="button" onClick={onCopy} className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm">
          <Link2 className="size-4" /> Copy general link
        </button>
      </div>
    </div>
  );
}

function AddGuests({ weddingId, defaultMax, guest, onClose, onAdded }: { weddingId: string; defaultMax: number; guest?: GuestRow; onClose: () => void; onAdded: (rows: GuestRow[]) => void }) {
  const [mode, setMode] = useState<"one" | "list">("one");
  const [name, setName] = useState(guest?.name ?? "");
  const [greeting, setGreeting] = useState(guest?.greeting ?? "");
  const [message, setMessage] = useState(guest?.message ?? "");
  const [groupText, setGroupText] = useState(guest?.groups.join(", ") ?? "");
  const [max, setMax] = useState<string>(guest?.max_party ? String(guest.max_party) : "");
  const [list, setList] = useState("");
  const [busy, setBusy] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const lines = list.split(/\r?\n/).filter((x) => x.trim()).length;

  async function save() {
    setBusy(true);
    if (guest) {
      const res = await updateGuest(weddingId, guest.id, {
        name,
        greeting: greeting || null,
        message: message || null,
        groups: groupText.split(",").map((g) => g.trim()).filter(Boolean),
        maxParty: max ? Number(max) : null,
      });
      setBusy(false);
      if (!res.ok) return toast.error(res.error);
      onAdded([res.data]);
      toast.success("Saved");
      dlg.current?.close();
      return;
    }
    if (mode === "one") {
      const res = await addGuest(weddingId, {
        name,
        greeting: greeting || null,
        groups: groupText.split(",").map((g) => g.trim()).filter(Boolean),
        maxParty: max ? Number(max) : null,
      });
      setBusy(false);
      if (!res.ok) return toast.error(res.error);
      onAdded([res.data]);
      toast.success(`${res.data.name} added`);
      setName("");
      setGreeting("");
      return;
    }
    const res = await addGuestList(weddingId, list);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    onAdded(res.data.added);
    toast.success(`Added ${res.data.added.length}${res.data.duplicates ? `, skipped ${res.data.duplicates} already on the list` : ""}`);
    onClose();
  }

  return (
    <dialog
      ref={(el) => {
        dlg.current = el;
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      className="m-auto w-[min(100vw-1.5rem,32rem)] rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-black/40"
    >
      <form
        method="dialog"
        className="grid gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">{guest ? "Edit guest" : "Add guests"}</h2>
          <button type="button" onClick={() => dlg.current?.close()} aria-label="Close" className="rounded-full p-1.5 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className={cn("inline-flex justify-self-start rounded-full border border-border p-0.5 text-sm", guest && "hidden")}>
          {(["one", "list"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-3.5 py-1.5", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              {m === "one" ? "One guest" : "Paste a list"}
            </button>
          ))}
        </div>
        {mode === "one" ? (
          <>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Name on the invitation</span>
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Mariam & family" className="h-10 rounded-lg border border-input bg-background px-3" />
              <span className="text-xs text-muted-foreground">Write it the way you&apos;d say it. For a family, one name reads best.</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Greeting</span>
                <input value={greeting} onChange={(e) => setGreeting(e.target.value)} maxLength={60} placeholder="Dear" className="h-10 rounded-lg border border-input bg-background px-3" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Most guests</span>
                <input type="number" min={1} max={20} value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(defaultMax)} className="h-10 rounded-lg border border-input bg-background px-3" />
              </label>
            </div>
            {guest ? (
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">A line just for them</span>
                <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} placeholder="Optional" className="h-10 rounded-lg border border-input bg-background px-3" />
              </label>
            ) : null}
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Groups</span>
              <input value={groupText} onChange={(e) => setGroupText(e.target.value)} maxLength={200} placeholder="e.g. Bride's family, Work" className="h-10 rounded-lg border border-input bg-background px-3" />
            </label>
          </>
        ) : (
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">One name per line</span>
            <textarea value={list} onChange={(e) => setList(e.target.value)} rows={9} maxLength={200000} placeholder={"Mariam & family\nUncle Hossam, Groom's family\nNour Adel, University"} className="rounded-lg border border-input bg-background p-3 font-mono text-[0.85rem]" />
            <span className="text-xs text-muted-foreground">
              {lines} {lines === 1 ? "name" : "names"}. Add a group after a comma. Names already on your list are skipped. Up to 1,000 at a time; you can paste a column from a spreadsheet.
            </span>
          </label>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => dlg.current?.close()} className="h-10 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">
            {guest ? "Cancel" : mode === "one" ? "Done" : "Cancel"}
          </button>
          <button type="submit" disabled={busy || (mode === "one" ? !name.trim() : !lines)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            <Check className="size-4" /> {busy ? "Saving…" : guest ? "Save" : mode === "one" ? "Add guest" : `Add ${lines || ""}`}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Wishes({ weddingId, wishes, setWishes, canEdit, on }: { weddingId: string; wishes: WishRow[]; setWishes: (f: (w: WishRow[]) => WishRow[]) => void; canEdit: boolean; on: boolean }) {
  if (!wishes.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-14 text-center text-muted-foreground">
        {on ? "No wishes yet. They'll appear here as guests write them." : (
          <>
            Wishes are switched off. Turn on the <b className="font-medium text-foreground">Wishes</b> section in your editor and guests can leave you a message.
          </>
        )}
      </div>
    );
  }
  return (
    <ul className="mt-6 grid gap-3">
      {wishes.map((w) => (
        <li key={w.id} className={cn("flex gap-4 rounded-2xl border border-border bg-card p-4", w.hidden && "opacity-60")}>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{w.name}</p>
            <p className="mt-1 whitespace-pre-line text-[0.95rem]">{w.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(w.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              {w.hidden ? " · Hidden from the invitation" : ""}
            </p>
          </div>
          {canEdit ? (
            <div className="flex shrink-0 items-start gap-1">
              <button
                type="button"
                aria-label={w.hidden ? "Show on the invitation" : "Hide from the invitation"}
                title={w.hidden ? "Show on the invitation" : "Hide from the invitation"}
                className="rounded-full p-2 hover:bg-muted"
                onClick={async () => {
                  const res = await setWishHidden(weddingId, w.id, !w.hidden);
                  if (!res.ok) return toast.error(res.error);
                  setWishes((ws) => ws.map((x) => (x.id === w.id ? { ...x, hidden: !w.hidden } : x)));
                }}
              >
                {w.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button
                type="button"
                aria-label="Delete wish"
                className="rounded-full p-2 hover:bg-muted"
                onClick={async () => {
                  const res = await deleteWish(weddingId, w.id);
                  if (!res.ok) return toast.error(res.error);
                  setWishes((ws) => ws.filter((x) => x.id !== w.id));
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
