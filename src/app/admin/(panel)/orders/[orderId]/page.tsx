import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicEnv } from "@/config/env";
import { LiveBadge, PaymentBadge } from "@/features/admin/components/order-badges";
import { OrderActions, OrderTags, OrderTimeline } from "@/features/admin/components/order-panels";
import { fmtDay, fmtDayTime, fmtMoney } from "@/features/admin/format";
import { loadOrder, requireStaff } from "@/features/admin/queries";
import { METHOD_LABEL, ordinal, type LiveState, type OrderDetail, type PaymentMethod } from "@/features/admin/types";
import { waLink } from "@/features/orders/types";
import { isUuid } from "@/features/weddings/queries";
import { resolveTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = { title: "Order" };

function liveState(w: NonNullable<OrderDetail["wedding"]>): LiveState {
  if (w.deactivatedAt) return "off";
  if (w.activeUntil && new Date(w.activeUntil) <= new Date()) return "ended";
  return w.status === "published" ? "live" : "notLive";
}

export default async function AdminOrder(props: PageProps<"/admin/orders/[orderId]">) {
  const { orderId } = await props.params;
  if (!isUuid(orderId)) notFound();
  const [, d] = await Promise.all([requireStaff(["owner", "admin"]), loadOrder(orderId)]);
  if (!d) notFound();
  const o = d.order;
  const siteUrl = publicEnv.siteUrl;
  const payTo = { instapay: process.env.PAY_INSTAPAY?.trim() || null, wallet: process.env.PAY_WALLET?.trim() || null };
  const design = d.wedding ? resolveTemplateManifest(d.wedding.templateId) : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden">
          <ArrowLeft className="size-4" aria-hidden /> Orders
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-serif text-4xl font-light tabular-nums sm:text-5xl">#{o.number}</h1>
          <PaymentBadge status={o.status} />
          {d.wedding && o.status !== "cancelled" ? <LiveBadge live={liveState(d.wedding)} /> : null}
          {o.archived ? <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Archived</span> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {fmtDayTime(o.createdAt)} · {o.source === "customer" ? "Placed by the couple" : o.source === "paymob" ? "Paid online" : `Recorded by ${o.recordedBy ?? "staff"}`} · Confirmation {o.confirmation}
        </p>
        <OrderActions d={d} payTo={payTo} siteUrl={siteUrl} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-serif text-2xl">Summary</h2>
            {d.wedding ? (
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{d.wedding.names}</p>
                  <p className="text-sm text-muted-foreground">
                    {design?.name ?? d.wedding.templateId} design{d.wedding.weddingDate ? ` · wedding on ${fmtDay(d.wedding.weddingDate)}` : ""}
                  </p>
                  <a href={`${siteUrl}/w/${d.wedding.slug}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                    /w/{d.wedding.slug} <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                  {d.wedding.activeUntil ? <p className="mt-1 text-sm text-muted-foreground">Live until {fmtDay(d.wedding.activeUntil)}</p> : null}
                </div>
                <Link href={`/admin/invitations?q=${encodeURIComponent(d.wedding.slug)}`} className="shrink-0 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground print:hidden">
                  Manage
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">The invitation for this order was deleted.</p>
            )}
            <dl className="mt-5 grid gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt>{o.kind === "renewal" ? "Renewal" : "Invitation website"} · {o.months} months</dt>
                <dd className="tabular-nums">{fmtMoney(o.amount)}</dd>
              </div>
              <div className="flex justify-between gap-4 font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{fmtMoney(o.amount)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <dt>{o.status === "pending" ? "Will pay with" : "Paid with"}</dt>
                <dd>
                  {METHOD_LABEL[o.method as PaymentMethod] ?? o.method}
                  {o.reference ? ` · ${o.reference}` : ""}
                </dd>
              </div>
              {o.paidAt ? (
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <dt>Paid on</dt>
                  <dd>{fmtDayTime(o.paidAt)}</dd>
                </div>
              ) : null}
              {o.refundedAt ? (
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <dt>Refunded on</dt>
                  <dd>{fmtDayTime(o.refundedAt)}</dd>
                </div>
              ) : null}
              {o.cancelledAt ? (
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <dt>Cancelled</dt>
                  <dd>
                    {fmtDayTime(o.cancelledAt)}
                    {o.cancelReason ? ` · ${o.cancelReason}` : ""}
                  </dd>
                </div>
              ) : null}
              {o.note ? <p className="text-muted-foreground">Note: {o.note}</p> : null}
            </dl>
          </section>
          <OrderTimeline orderId={o.id} events={d.events} />
        </div>

        <aside className="grid gap-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-serif text-2xl">Customer</h2>
            <p className="mt-3 font-medium">{d.customer.name ?? "No name given"}</p>
            {d.customer.email ? (
              <Link href={`/admin/orders?q=${encodeURIComponent(d.customer.email)}`} className="text-sm text-accent hover:underline">
                {d.customer.nth <= 1 && d.customer.orders <= 1 ? "1st order" : `${ordinal(d.customer.nth)} order · ${d.customer.orders} in total`}
              </Link>
            ) : null}
            <dl className="mt-4 grid gap-3 text-sm">
              {d.customer.email ? (
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${d.customer.email}`} className="inline-flex items-center gap-1.5 break-all hover:underline">
                      <Mail className="size-3.5 shrink-0" aria-hidden /> {d.customer.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {d.customer.phone ? (
                <div>
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd>
                    <a href={waLink(d.customer.phone, `Hello, about your Vellum order #${o.number}:`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                      <MessageCircle className="size-3.5" aria-hidden /> {d.customer.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-serif text-2xl">Tags</h2>
            <div className="mt-3">
              <OrderTags orderId={o.id} tags={o.tags} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
