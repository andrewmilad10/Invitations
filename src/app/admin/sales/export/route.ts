import { notFound } from "next/navigation";
import { csvCell } from "@/features/admin/format";
import { loadSales } from "@/features/admin/queries";
import { METHOD_LABEL, type PaymentMethod } from "@/features/admin/types";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";

export const dynamic = "force-dynamic";

const BATCH = 500;
const MAX = 50_000;

/**
 * Every sale matching ?q= as a spreadsheet, built on the server in batches.
 * admin_list_sales checks the staff role (owner/admin) on every batch, so
 * anyone else gets a 404 (see loadSales).
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 80);
  const names = Object.fromEntries(TEMPLATE_MANIFESTS.map((t) => [t.id, t.name]));
  const head = ["Date", "Couple", "Address", "Design", "Customer", "Amount", "Currency", "Paid with", "Reference", "Months", "Status", "Recorded by", "Note"];
  const lines = [head.map(csvCell).join(",")];
  try {
    for (let page = 0; page * BATCH < MAX; page++) {
      const { rows } = await loadSales(q, page, BATCH);
      for (const s of rows) {
        lines.push(
          [s.paidAt, s.names, s.slug ? `/w/${s.slug}` : "", s.templateId ? (names[s.templateId] ?? s.templateId) : "", s.buyerEmail, s.amount, s.currency, METHOD_LABEL[s.method as PaymentMethod] ?? s.method, s.reference, s.months, s.status, s.recordedBy, s.note]
            .map(csvCell)
            .join(","),
        );
      }
      if (rows.length < BATCH) break;
    }
  } catch {
    notFound();
  }
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
