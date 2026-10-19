"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { refundSale } from "../actions";
import { fmtDayTime, fmtMoney } from "../format";
import { METHOD_LABEL, type AdminSale, type PaymentMethod } from "../types";

/** Cells that could be read as a formula by a spreadsheet are prefixed with ' (CSV injection). */
function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function SalesTable({ rows, designNames }: { rows: AdminSale[]; designNames: Record<string, string> }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const download = () => {
    const head = ["Date", "Couple", "Address", "Design", "Customer", "Amount", "Currency", "Paid with", "Reference", "Months", "Status", "Recorded by", "Note"];
    const lines = rows.map((s) =>
      [s.paidAt, s.names, s.slug ? `/w/${s.slug}` : "", s.templateId ? designNames[s.templateId] ?? s.templateId : "", s.buyerEmail, s.amount, s.currency, METHOD_LABEL[s.method as PaymentMethod] ?? s.method, s.reference, s.months, s.status, s.recordedBy, s.note]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob(["﻿" + [head.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const refund = (s: AdminSale) => {
    if (!window.confirm(`Mark the ${fmtMoney(s.amount)} sale for ${s.names ?? "this invitation"} as refunded? The invitation will be turned off.`)) return;
    start(async () => {
      const r = await refundSale(s.id, true);
      if (!r.ok) return void toast.error(r.error);
      toast.success("Marked as refunded");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={download} disabled={!rows.length}>
          <Download /> Download as spreadsheet
        </Button>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Couple</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Paid with</th>
                <th className="px-4 py-3 font-medium">Recorded by</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={cn("border-b last:border-0 align-top", s.status === "refunded" && "text-muted-foreground")}>
                  <td className="whitespace-nowrap px-4 py-3">{fmtDayTime(s.paidAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.names ?? "Deleted invitation"}</div>
                    <div className="text-xs text-muted-foreground">{s.templateId ? designNames[s.templateId] ?? s.templateId : ""}{s.months ? ` · ${s.months} months` : ""}</div>
                  </td>
                  <td className="max-w-48 truncate px-4 py-3">{s.buyerEmail ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {s.status === "refunded" ? <s>{fmtMoney(s.amount)}</s> : fmtMoney(s.amount)}
                    {s.status === "refunded" ? <div className="text-xs">Refunded</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    {METHOD_LABEL[s.method as PaymentMethod] ?? s.method}
                    {s.reference ? <div className="text-xs text-muted-foreground">{s.reference}</div> : null}
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">{s.recordedBy ?? "Automatic"}</td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "paid" ? (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => refund(s)}>
                        Refund
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed px-6 py-14 text-center text-muted-foreground">
          No sales yet. Record one from <b className="font-medium text-foreground">Invitations</b>, using an invitation&apos;s ⋯ menu.
        </p>
      )}
    </div>
  );
}
