"use client";

import { Archive, ArchiveRestore, Ban, Check, MessageCircle, Printer, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { waLink } from "@/features/orders/types";
import { cn } from "@/lib/utils";
import { addOrderComment, archiveOrder, cancelOrder, markOrderPaid, refundSale, setOrderTags } from "../actions";
import { fmtDayTime, fmtMoney } from "../format";
import { METHOD_LABEL, PAYMENT_METHODS, type OrderDetail, type OrderEvent, type PaymentMethod } from "../types";
import { field, input, Modal } from "./modal";

type PayTo = { instapay: string | null; wallet: string | null };

/** The buttons at the top of an order, depending on its state. */
export function OrderActions({ d, payTo, siteUrl }: { d: OrderDetail; payTo: PayTo; siteUrl: string }) {
  const o = d.order;
  const [dialog, setDialog] = useState<"paid" | "cancel" | null>(null);
  const [busy, start] = useTransition();
  const ref = `#${o.number}`;
  const hello = `Hello${d.customer.name ? ` ${d.customer.name.split(" ")[0]}` : ""},`;
  const message =
    o.status === "pending"
      ? [
          `${hello} thank you for your Vellum order ${ref}${d.wedding ? ` for ${d.wedding.names}` : ""}.`,
          `Please send ${fmtMoney(o.amount)}${payTo.instapay ? ` by InstaPay to ${payTo.instapay}` : ""}${payTo.instapay && payTo.wallet ? " or" : ""}${payTo.wallet ? ` by Vodafone Cash to ${payTo.wallet}` : ""}, with ${ref} in the note, and reply here with the receipt.`,
          "Your invitation goes live as soon as we confirm it.",
        ].join("\n")
      : o.status === "paid" && d.wedding
        ? `${hello} your payment for order ${ref} is confirmed and your invitation is live: ${siteUrl}/w/${d.wedding.slug}`
        : `${hello} about your Vellum order ${ref}:`;

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return void toast.error(r.error ?? "That didn't go through.");
      toast.success(done);
    });

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {o.status === "pending" ? (
        <Button onClick={() => setDialog("paid")} disabled={busy}>
          <Check /> Mark as paid
        </Button>
      ) : null}
      {d.customer.phone ? (
        <Button asChild variant={o.status === "pending" ? "outline" : "default"}>
          <a href={waLink(d.customer.phone, message)} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> {o.status === "pending" ? "Send payment details" : "Message on WhatsApp"}
          </a>
        </Button>
      ) : null}
      <Button asChild variant="outline">
        <Link href={`/admin/orders/${o.id}/invoice`} prefetch={false}>
          <Printer /> {o.status === "paid" ? "Receipt" : "Invoice"}
        </Link>
      </Button>
      {o.status === "pending" ? (
        <Button variant="ghost" onClick={() => setDialog("cancel")} disabled={busy}>
          <Ban /> Cancel order
        </Button>
      ) : null}
      {o.status === "paid" ? (
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`Refund ${fmtMoney(o.amount)} for order ${ref}? The invitation will be turned off.`)) act(() => refundSale(o.id, true), "Marked as refunded");
          }}
        >
          <Undo2 /> Refund
        </Button>
      ) : null}
      {o.status !== "pending" ? (
        <Button variant="ghost" disabled={busy} onClick={() => act(() => archiveOrder(o.id, !o.archived), o.archived ? "Moved back from the archive" : "Archived")}>
          {o.archived ? <ArchiveRestore /> : <Archive />} {o.archived ? "Unarchive" : "Archive"}
        </Button>
      ) : null}
      {dialog === "paid" ? <MarkPaidDialog d={d} onClose={() => setDialog(null)} /> : null}
      {dialog === "cancel" ? <CancelDialog d={d} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function MarkPaidDialog({ d, onClose }: { d: OrderDetail; onClose: () => void }) {
  const o = d.order;
  const [busy, start] = useTransition();
  // The database's reason to double-check (reused reference, other amount);
  // submitting again with it showing means "go ahead anyway".
  const [warning, setWarning] = useState<string | null>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    start(async () => {
      const r = await markOrderPaid({
        orderId: o.id,
        amount: Number(f.get("amount")),
        method: String(f.get("method")) as PaymentMethod,
        reference: String(f.get("reference") ?? ""),
        confirmed: Boolean(warning),
      });
      if (!r.ok && "confirm" in r) return setWarning(r.error);
      if (!r.ok) return void toast.error(r.error);
      toast.success(`Order #${o.number} is paid${d.wedding ? " and the invitation is live" : ""}`);
      onClose();
    });
  };
  const method = (PAYMENT_METHODS as readonly string[]).includes(o.method) ? o.method : "instapay";
  return (
    <Modal title={`Mark #${o.number} as paid`} onClose={onClose}>
      <p className="-mt-3 text-sm text-muted-foreground">
        Check the money has arrived first. {d.wedding ? `${d.wedding.names} goes live for ${o.months} months straight away.` : null}
      </p>
      <form className="grid gap-4" onSubmit={submit} onChange={() => setWarning(null)}>
        <div className="grid grid-cols-2 gap-3">
          <label className={field}>
            Amount received (EGP)
            <input className={input} name="amount" type="number" inputMode="decimal" min={0} max={1000000} step="1" defaultValue={o.amount} required />
          </label>
          <label className={field}>
            Paid with
            <select className={input} name="method" defaultValue={method}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={field}>
          Reference (optional)
          <input className={input} name="reference" maxLength={120} placeholder="Transaction number from the receipt" autoComplete="off" />
        </label>
        {warning ? (
          <p role="alert" className="rounded-lg border border-accent/50 bg-accent/10 p-3 text-sm">
            <strong className="font-medium">Please check: </strong>
            {warning} If you&apos;re sure, mark it as paid anyway; this note is kept in the timeline.
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button type="submit" disabled={busy} variant={warning ? "destructive" : "default"}>
            {busy ? "Saving…" : warning ? "Mark as paid anyway" : "Mark as paid"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CancelDialog({ d, onClose }: { d: OrderDetail; onClose: () => void }) {
  const [busy, start] = useTransition();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
    start(async () => {
      const r = await cancelOrder(d.order.id, reason);
      if (!r.ok) return void toast.error(r.error);
      toast.success(`Order #${d.order.number} cancelled`);
      onClose();
    });
  };
  return (
    <Modal title={`Cancel #${d.order.number}?`} onClose={onClose}>
      <p className="-mt-3 text-sm text-muted-foreground">The couple can order again whenever they&apos;re ready. Nothing else changes.</p>
      <form className="grid gap-4" onSubmit={submit}>
        <label className={field}>
          Reason (only staff see this)
          <input className={input} name="reason" maxLength={300} placeholder="e.g. Didn't pay after three reminders" />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button type="submit" variant="destructive" disabled={busy}>
            {busy ? "Cancelling…" : "Cancel order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Tags: shown at once (optimistic), saved in the background. */
export function OrderTags({ orderId, tags }: { orderId: string; tags: string[] }) {
  const [shown, setShown] = useOptimistic(tags);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const save = (next: string[]) =>
    start(async () => {
      setShown(next);
      const r = await setOrderTags(orderId, next);
      if (!r.ok) toast.error(r.error);
    });
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {shown.length ? (
          shown.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-md border bg-background py-0.5 ps-2 pe-1 text-sm">
              {t}
              <button type="button" className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground print:hidden" aria-label={`Remove tag ${t}`} onClick={() => save(shown.filter((x) => x !== t))}>
                <X className="size-3.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No tags</span>
        )}
      </div>
      <form
        className="print:hidden"
        onSubmit={(e) => {
          e.preventDefault();
          const v = inputRef.current?.value.trim() ?? "";
          if (!v || shown.includes(v)) return;
          if (shown.length >= 10) return void toast.error("Up to 10 tags.");
          save([...shown, v.slice(0, 30)]);
          if (inputRef.current) inputRef.current.value = "";
        }}
      >
        <label className="sr-only" htmlFor="new-tag">
          Add a tag
        </label>
        <input ref={inputRef} id="new-tag" maxLength={30} placeholder="Add a tag and press Enter" className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
      </form>
    </div>
  );
}

const KIND_DOT: Partial<Record<OrderEvent["kind"], string>> = { paid: "bg-success", live: "bg-success", comment: "bg-accent", cancelled: "bg-muted-foreground", refunded: "bg-destructive" };

/** Timeline, newest first, with a comment box only staff see (like a shop's order timeline). */
export function OrderTimeline({ orderId, events }: { orderId: string; events: OrderEvent[] }) {
  const [shown, add] = useOptimistic(events, (list, e: OrderEvent) => [e, ...list]);
  const [busy, start] = useTransition();
  const [text, setText] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    start(async () => {
      add({ at: new Date().toISOString(), kind: "comment", message: t, actor: "You" });
      setText("");
      const r = await addOrderComment(orderId, t);
      if (!r.ok) {
        toast.error(r.error);
        setText(t);
      }
    });
  };
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="font-serif text-2xl">Timeline</h2>
      <p className="text-sm text-muted-foreground">Only staff can see comments.</p>
      <form onSubmit={submit} className="mt-4 flex gap-2 print:hidden">
        <label className="sr-only" htmlFor="comment">
          Leave a comment
        </label>
        <input
          id="comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="Leave a comment…"
          className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary"
        />
        <Button type="submit" disabled={!text.trim() || busy}>
          Post
        </Button>
      </form>
      <ol className="mt-5 grid gap-4 border-s ps-5">
        {shown.map((e, i) => (
          <li key={`${e.at}-${i}`} className="relative">
            <span className={cn("absolute -start-[1.625rem] top-1.5 size-2.5 rounded-full border-2 border-card bg-foreground", KIND_DOT[e.kind])} aria-hidden />
            <p className="text-xs text-muted-foreground">
              {fmtDayTime(e.at)}
              {e.actor ? ` · ${e.actor}` : ""}
            </p>
            <p className={cn("mt-0.5 text-sm", e.kind === "comment" && "rounded-lg bg-muted/60 px-3 py-2")}>{e.message}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

