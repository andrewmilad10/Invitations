"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelMyOrder, placeOrder } from "@/features/orders/actions";
import { CUSTOMER_METHODS, CUSTOMER_METHOD_LABEL, fmtPrice, phoneSchema, waLink, type CustomerMethod, type OrderBrief, type PayTo, type PublishState } from "@/features/orders/types";
import { cn } from "@/lib/utils";

/**
 * Ordering from the publish window: the invitation goes live once staff
 * confirm the payment. The price and order number come from the database.
 */
export function OrderStep({
  weddingId,
  state,
  disabled,
  onPlaced,
}: {
  weddingId: string;
  state: PublishState;
  disabled: boolean;
  onPlaced: (order: OrderBrief | null, paid: boolean) => void;
}) {
  const ids = useId();
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<CustomerMethod>("instapay");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const renewal = Boolean(state.activeUntil);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return; // one order request at a time
    const p = phoneSchema.safeParse(phone);
    if (!p.success) return setError(p.error.issues[0]?.message ?? "Please check your number.");
    setError(null);
    start(async () => {
      const r = await placeOrder({ weddingId, phone, method });
      if (!r.ok) return setError(r.error);
      onPlaced(r.order, r.paid);
    });
  }

  if (state.turnedOff) {
    return <p className="mt-6 rounded-md border border-destructive/40 p-4 text-sm">This invitation has been turned off. Please contact us on WhatsApp and we&apos;ll sort it out.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-5 rounded-md border bg-background p-5" noValidate>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-medium">{renewal ? "Renew your invitation" : "Publish your invitation"}</p>
          <p className="text-sm text-muted-foreground">Live for {state.months} months from the day we confirm payment.</p>
        </div>
        <p className="shrink-0 font-serif text-2xl">{fmtPrice(state.price, state.currency)}</p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={`${ids}-phone`} className="text-sm font-medium">
          Your WhatsApp number
        </label>
        <input
          id={`${ids}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01X XXXX XXXX"
          maxLength={22}
          aria-invalid={Boolean(error)}
          aria-describedby={`${ids}-phone-hint`}
          className="h-11 rounded-md border bg-card px-3 text-base outline-none focus:border-primary"
        />
        <p id={`${ids}-phone-hint`} className="text-xs text-muted-foreground">
          We&apos;ll message you here when it&apos;s live, or if we need anything.
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium">How you&apos;ll pay</legend>
        <div className="grid grid-cols-3 gap-2">
          {CUSTOMER_METHODS.map((m) => (
            <label key={m} className={cn("flex cursor-pointer items-center justify-center rounded-md border px-2 py-2.5 text-center text-sm", method === m ? "border-primary bg-card font-medium" : "border-border")}>
              <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
              {CUSTOMER_METHOD_LABEL[m]}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={disabled || pending}>
        {pending ? "Placing your order…" : `Place order · ${fmtPrice(state.price, state.currency)}`}
      </Button>
      <p className="-mt-2 text-center text-xs text-muted-foreground">You pay after ordering. Nothing is charged here.</p>
    </form>
  );
}

/** After ordering: the order number, how to pay, and what happens next. */
export function WaitingForPayment({
  order,
  payTo,
  couple,
  onCancelled,
}: {
  order: OrderBrief;
  payTo: PayTo;
  couple: string;
  onCancelled: () => void;
}) {
  const [pending, start] = useTransition();
  const ref = `#${order.number}`;
  const amount = fmtPrice(order.amount, order.currency);
  const paidMessage = `Hello Vellum, I've paid ${amount} for order ${ref} (${couple}). Confirmation ${order.confirmation}.`;

  function cancel() {
    if (pending || !window.confirm(`Cancel order ${ref}? You can order again any time.`)) return;
    start(async () => {
      const r = await cancelMyOrder(order.id);
      if (!r.ok) return void toast.error(r.error);
      toast("Order cancelled");
      onCancelled();
    });
  }

  return (
    <>
      <h2 id="publish-title" className="font-serif text-4xl font-light">
        Waiting for payment
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Order {ref} is placed. Send {amount} and your invitation goes live as soon as we confirm it, usually within a few hours.
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border bg-border text-sm">
        {[
          ["Order", ref],
          ["Amount", amount],
          ["Confirmation", order.confirmation],
        ].map(([k, v]) => (
          <div key={k} className="bg-card p-3">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 break-all font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-6 grid gap-4 text-sm">
        <li className="grid grid-cols-[1.5rem_1fr] gap-2">
          <span className="grid size-6 place-items-center rounded-full border text-xs">1</span>
          <div className="grid gap-2">
            <span>
              Send {amount}
              {payTo.instapay || payTo.wallet ? " to one of these, with " : " the way we agree on WhatsApp, with "}
              <strong>{ref}</strong> in the note:
            </span>
            {payTo.instapay ? <CopyRow label="InstaPay" value={payTo.instapay} /> : null}
            {payTo.wallet ? <CopyRow label="Vodafone Cash" value={payTo.wallet} /> : null}
          </div>
        </li>
        <li className="grid grid-cols-[1.5rem_1fr] gap-2">
          <span className="grid size-6 place-items-center rounded-full border text-xs">2</span>
          <div className="grid gap-2">
            <span>Send us the receipt or a screenshot on WhatsApp.</span>
            {payTo.whatsapp ? (
              <Button asChild variant="outline" className="justify-self-start">
                <a href={waLink(payTo.whatsapp, paidMessage)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Message us on WhatsApp
                </a>
              </Button>
            ) : (
              <span className="text-muted-foreground">We&apos;ll also message you on the number you gave us.</span>
            )}
          </div>
        </li>
        <li className="grid grid-cols-[1.5rem_1fr] gap-2">
          <span className="grid size-6 place-items-center rounded-full border text-xs">3</span>
          <span>We confirm it and your invitation goes live. Keep editing in the meantime; guests see the latest version.</span>
        </li>
      </ol>

      <div className="mt-8 flex justify-between gap-2">
        <Button variant="ghost" onClick={cancel} disabled={pending} className="text-muted-foreground">
          {pending ? "Cancelling…" : "Cancel order"}
        </Button>
      </div>
    </>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background p-2 ps-3">
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <code className="block truncate text-sm">{value}</code>
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          navigator.clipboard?.writeText(value).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
        }
      >
        {done ? <Check /> : <Copy />} {done ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
