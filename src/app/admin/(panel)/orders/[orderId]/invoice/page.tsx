import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { PrintButton } from "@/features/admin/components/print-button";
import { fmtDay, fmtMoney } from "@/features/admin/format";
import { loadOrder, requireStaff } from "@/features/admin/queries";
import { METHOD_LABEL, type PaymentMethod } from "@/features/admin/types";
import { isUuid } from "@/features/weddings/queries";
import { resolveTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = { title: "Invoice" };

/** A one-page invoice (or receipt, once paid) to print or save as PDF. */
export default async function OrderInvoice(props: PageProps<"/admin/orders/[orderId]/invoice">) {
  const { orderId } = await props.params;
  if (!isUuid(orderId)) notFound();
  const [, d] = await Promise.all([requireStaff(["owner", "admin"]), loadOrder(orderId)]);
  if (!d) notFound();
  const o = d.order;
  const receipt = o.status === "paid" || o.status === "refunded";
  const design = d.wedding ? resolveTemplateManifest(d.wedding.templateId).name : null;

  return (
    <div className="grid gap-4">
      <div className="flex justify-end gap-2 print:hidden">
        <PrintButton />
      </div>
      <article className="mx-auto w-full max-w-2xl rounded-2xl border bg-card p-8 print:max-w-none print:rounded-none print:border-0 print:p-0 sm:p-12">
        <header className="flex items-start justify-between gap-6">
          <Brand />
          <div className="text-right">
            <h1 className="font-serif text-4xl font-light">{receipt ? "Receipt" : "Invoice"}</h1>
            <p className="mt-1 tabular-nums text-muted-foreground">Order #{o.number}</p>
          </div>
        </header>

        <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-muted-foreground">Billed to</dt>
            <dd className="mt-1">
              {d.customer.name ? <span className="block font-medium">{d.customer.name}</span> : null}
              {d.customer.email ? <span className="block">{d.customer.email}</span> : null}
              {d.customer.phone ? <span className="block">{d.customer.phone}</span> : null}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="mt-1">{fmtDay(o.paidAt ?? o.createdAt)}</dd>
            <dt className="mt-3 text-muted-foreground">Confirmation</dt>
            <dd className="mt-1 tabular-nums">{o.confirmation}</dd>
          </div>
        </dl>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b align-top">
              <td className="py-3">
                <span className="block font-medium">{o.kind === "renewal" ? "Invitation website renewal" : "Invitation website"}</span>
                <span className="block text-muted-foreground">
                  {d.wedding ? `${d.wedding.names} · ${design} design · ` : ""}live for {o.months} months
                </span>
              </td>
              <td className="py-3 text-right tabular-nums">{fmtMoney(o.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-medium">Total</td>
              <td className="pt-4 text-right font-serif text-2xl tabular-nums">{fmtMoney(o.amount)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-10 text-sm text-muted-foreground">
          {o.status === "paid"
            ? `Paid in full by ${METHOD_LABEL[o.method as PaymentMethod] ?? o.method}${o.reference ? ` (reference ${o.reference})` : ""}. Thank you.`
            : o.status === "refunded"
              ? "This payment was refunded."
              : o.status === "cancelled"
                ? "This order was cancelled."
                : `Please pay ${fmtMoney(o.amount)} with order #${o.number} in the note. Your invitation goes live as soon as the payment is confirmed.`}
        </p>
      </article>
    </div>
  );
}
