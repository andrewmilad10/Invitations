"use client";

import { CalendarPlus, ExternalLink, MoreHorizontal, Power, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extendWedding, recordSale, setDeactivated } from "../actions";
import { fmtDay, fmtMoney } from "../format";
import { daysLeft, METHOD_LABEL, PAYMENT_METHODS, type AdminWedding, type StaffRole } from "../types";

type Props = { rows: AdminWedding[]; role: StaffRole; siteUrl: string; designNames: Record<string, string> };

function StateBadge({ w }: { w: AdminWedding }) {
  const left = daysLeft(w.activeUntil);
  const [text, cls] = w.deactivatedAt
    ? ["Turned off", "bg-destructive/10 text-destructive"]
    : w.status !== "published"
      ? ["Draft", "bg-muted text-muted-foreground"]
      : left !== null && left <= 0
        ? ["Ended", "bg-muted text-muted-foreground"]
        : left !== null && left <= 14
          ? [`${left} day${left === 1 ? "" : "s"} left`, "bg-accent/15 text-foreground"]
          : left !== null
            ? [`${left} days left`, "bg-primary/10 text-foreground"]
            : ["Live · not paid", "bg-primary/10 text-foreground"];
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>{text}</span>;
}

export function WeddingsTable({ rows, role, siteUrl, designNames }: Props) {
  const canAct = role === "owner" || role === "admin";
  const [sale, setSale] = useState<AdminWedding | null>(null);
  const [off, setOff] = useState<AdminWedding | null>(null);

  if (!rows.length) return <p className="rounded-2xl border border-dashed px-6 py-14 text-center text-muted-foreground">No invitations match.</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="px-4 py-3 font-medium">Couple</th>
              <th className="px-4 py-3 font-medium">Design</th>
              {canAct ? <th className="px-4 py-3 font-medium">Customer</th> : null}
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">Live until</th>
              {canAct ? <th className="px-4 py-3 text-right font-medium">Paid</th> : null}
              <th className="px-4 py-3 text-right font-medium">Replies</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-b last:border-0 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">{w.names}</div>
                  <a href={`${siteUrl}/w/${w.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline">
                    /w/{w.slug} <ExternalLink className="size-3" aria-hidden />
                  </a>
                  {w.deactivatedReason ? <div className="mt-1 text-xs text-destructive">{w.deactivatedReason}</div> : null}
                </td>
                <td className="px-4 py-3">{designNames[w.templateId] ?? w.templateId}</td>
                {canAct ? <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">{w.ownerEmail ?? "—"}</td> : null}
                <td className="px-4 py-3"><StateBadge w={w} /></td>
                <td className="whitespace-nowrap px-4 py-3">{w.activeUntil ? fmtDay(w.activeUntil) : <span className="text-muted-foreground">No limit yet</span>}</td>
                {canAct ? <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{w.sales ? fmtMoney(w.paidTotal) : <span className="text-muted-foreground">—</span>}</td> : null}
                <td className="px-4 py-3 text-right tabular-nums">{w.replies}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDay(w.createdAt)}</td>
                <td className="px-4 py-3 text-right">{canAct ? <RowMenu w={w} onSale={() => setSale(w)} onOff={() => setOff(w)} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sale ? <SaleDialog w={sale} onClose={() => setSale(null)} /> : null}
      {off ? <OffDialog w={off} onClose={() => setOff(null)} /> : null}
    </>
  );
}

function RowMenu({ w, onSale, onOff }: { w: AdminWedding; onSale: () => void; onOff: () => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [open, setOpen] = useState(false);
  const extend = (days: number) =>
    start(async () => {
      const r = await extendWedding(w.id, days);
      if (!r.ok) return void toast.error(r.error);
      toast.success(days > 0 ? `Extended by ${days} days` : "Shortened");
      router.refresh();
    });
  const turnOn = () =>
    start(async () => {
      const r = await setDeactivated(w.id, false, "");
      if (!r.ok) return void toast.error(r.error);
      toast.success("Turned back on");
      router.refresh();
    });
  return (
    <div className="relative inline-block text-left" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <Button variant="ghost" size="sm" aria-label={`Actions for ${w.names}`} aria-expanded={open} disabled={busy} onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal />
      </Button>
      {open ? (
        <div role="menu" className="absolute end-0 z-20 mt-1 grid w-56 gap-0.5 rounded-xl border bg-card p-1.5 text-sm shadow-lg">
          <button role="menuitem" type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => (setOpen(false), onSale())}>
            <ReceiptText className="size-4" aria-hidden /> Record a sale
          </button>
          <button role="menuitem" type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => (setOpen(false), extend(30))}>
            <CalendarPlus className="size-4" aria-hidden /> Add 30 days
          </button>
          <button role="menuitem" type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => (setOpen(false), extend(91))}>
            <CalendarPlus className="size-4" aria-hidden /> Add 3 months
          </button>
          {w.deactivatedAt ? (
            <button role="menuitem" type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted" onClick={() => (setOpen(false), turnOn())}>
              <Power className="size-4" aria-hidden /> Turn back on
            </button>
          ) : (
            <button role="menuitem" type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-destructive hover:bg-destructive/10" onClick={() => (setOpen(false), onOff())}>
              <Power className="size-4" aria-hidden /> Turn off…
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-label={title}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border bg-card p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="grid gap-5 p-6">
        <h2 className="font-serif text-3xl">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

const field = "grid gap-1.5 text-sm";
const input = "h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary";

function SaleDialog({ w, onClose }: { w: AdminWedding; onClose: () => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => {
      const r = await recordSale({
        weddingId: w.id,
        amount: Number(f.get("amount")),
        method: String(f.get("method")) as (typeof PAYMENT_METHODS)[number],
        reference: String(f.get("reference") ?? ""),
        note: String(f.get("note") ?? ""),
        months: Number(f.get("months")),
        publish: f.get("publish") === "on",
      });
      if (!r.ok) return void toast.error(r.error);
      toast.success(`Sale recorded for ${w.names}`);
      onClose();
      router.refresh();
    });
  };
  return (
    <Modal title="Record a sale" onClose={onClose}>
      <p className="-mt-3 text-sm text-muted-foreground">{w.names} · /w/{w.slug}</p>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <label className={field}>
            Amount (EGP)
            <input className={input} name="amount" type="number" inputMode="decimal" min={0} max={1000000} step="1" defaultValue={1000} required />
          </label>
          <label className={field}>
            Paid with
            <select className={input} name="method" defaultValue="instapay">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{METHOD_LABEL[m]}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={field}>
          Reference (optional)
          <input className={input} name="reference" maxLength={120} placeholder="Transaction number or receipt" />
        </label>
        <label className={field}>
          Note (optional)
          <input className={input} name="note" maxLength={500} />
        </label>
        <label className={field}>
          Keeps the invitation live for
          <select className={input} name="months" defaultValue="3">
            {[1, 2, 3, 6, 12].map((m) => (
              <option key={m} value={m}>{m} month{m === 1 ? "" : "s"}{m === 3 ? " (standard)" : ""}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" defaultChecked className="size-4" /> Publish it now if it isn&apos;t yet
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Record sale"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function OffDialog({ w, onClose }: { w: AdminWedding; onClose: () => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
    start(async () => {
      const r = await setDeactivated(w.id, true, reason);
      if (!r.ok) return void toast.error(r.error);
      toast.success(`${w.names} is turned off`);
      onClose();
      router.refresh();
    });
  };
  return (
    <Modal title="Turn off this invitation?" onClose={onClose}>
      <p className="-mt-3 text-sm text-muted-foreground">
        Guests opening /w/{w.slug} will see that it isn&apos;t available, and replies stop. Nothing is deleted, and you can turn it back on.
      </p>
      <form className="grid gap-4" onSubmit={submit}>
        <label className={field}>
          Reason (only staff see this)
          <input className={input} name="reason" maxLength={300} placeholder="e.g. Not paid, reported content" />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="destructive" disabled={busy}>{busy ? "Turning off…" : "Turn off"}</Button>
        </div>
      </form>
    </Modal>
  );
}
