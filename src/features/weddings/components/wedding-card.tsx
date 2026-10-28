import { Eye, Pencil, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateOnly } from "@/core/i18n/format";
import { sanitizeOverrides } from "@/core/theme/tokens";
import { Stationery } from "@/features/marketing/stationery";
import { fmtPrice } from "@/features/orders/types";
import { resolveTemplateManifest } from "@/templates/registry";
import type { WeddingCard as WeddingCardData } from "../queries";
import { PublishToggle } from "./publish-toggle";
import { RemoveButton } from "./remove-button";
import { ShareMenu } from "./share-menu";
import { StatusBadge } from "./status-badge";
import { WeddingCover } from "./wedding-cover";

/** One wedding on the dashboard, drawn as its own invitation. */
export function WeddingCard({ wedding: w, siteUrl }: { wedding: WeddingCardData; siteUrl: string }) {
  const template = resolveTemplateManifest(w.template_id);
  const publicUrl = `${siteUrl}/w/${w.slug}`;
  const published = w.status === "published";
  const coupleName = `${w.partner_one_name} & ${w.partner_two_name}`;
  const editHref = `/dashboard/weddings/${w.id}`;
  const overrides = sanitizeOverrides(w.themeTokens);
  // Website designs show their real first screen (the cover); card designs show the stationery.
  const isWebsite = (template.features.hero ?? "photo") !== "card";

  return (
    <li className="grid grid-cols-[6.5rem_1fr] gap-5 border bg-card p-5 sm:grid-cols-[8.5rem_1fr] sm:gap-7 sm:p-6">
      <Link href={editHref} aria-label={`Edit ${coupleName}`} className="self-start">
        {isWebsite ? (
          <WeddingCover template={template} partnerOne={w.partner_one_name} partnerTwo={w.partner_two_name} dateIso={w.wedding_date} />
        ) : (
          <Stationery
            template={template}
            overrides={overrides}
            options={overrides.card}
            partnerOne={w.partner_one_name}
            partnerTwo={w.partner_two_name}
            dateLabel={w.wedding_date ? formatDateOnly(w.wedding_date, "en").long : null}
            className="shadow-[0_14px_30px_-18px_rgb(34_29_26/0.55)] transition-transform duration-500 hover:-translate-y-0.5"
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 font-serif text-2xl leading-tight sm:text-3xl">
            <Link href={editHref} className="hover:underline hover:underline-offset-4">
              {coupleName}
            </Link>
          </h2>
          <StatusBadge status={w.status} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {w.wedding_date ? formatDateOnly(w.wedding_date, "en").long.replace(/^[^ ,]+,? /, "") : "Date to be decided"}
        </p>
        <p className="text-sm text-muted-foreground">The {template.name} template</p>
        {published ? (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="mt-2 truncate text-xs text-accent hover:underline">
            {publicUrl.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Private draft — only you can see it</p>
        )}
        {w.openOrder && !published ? (
          <p className="mt-1 text-xs font-medium text-accent">
            Waiting for payment · Order #{w.openOrder.number} · {fmtPrice(w.openOrder.amount, w.openOrder.currency)}
          </p>
        ) : null}
        {w.deactivated_at ? (
          <p className="mt-1 text-xs font-medium text-destructive">Turned off. Guests can&apos;t open it; please contact us.</p>
        ) : w.active_until && w.daysLeft !== null ? (
          <LiveUntil until={w.active_until} days={w.daysLeft} />
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          <Button asChild size="sm">
            <Link href={editHref}>
              <Pencil /> Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a href={`/preview/${w.id}`} target="_blank" rel="noopener noreferrer">
              <Eye /> Preview
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/dashboard/weddings/${w.id}/guests`}>
              <Users /> Guests
            </Link>
          </Button>
          {published || w.paid ? (
            <PublishToggle weddingId={w.id} published={published} publicUrl={publicUrl} />
          ) : (
            // Not paid for yet: publishing starts with an order in the editor.
            <Button asChild size="sm" variant={w.openOrder ? "outline" : "default"}>
              <Link href={`${editHref}?panel=publish`}>{w.openOrder ? "Payment details" : "Publish"}</Link>
            </Button>
          )}
          <ShareMenu url={publicUrl} coupleName={coupleName} published={published} />
          <Button asChild size="icon" variant="ghost" className="size-8">
            <Link href={`${editHref}?panel=settings`} aria-label="Settings" title="Settings">
              <Settings />
            </Link>
          </Button>
          <RemoveButton weddingId={w.id} coupleName={coupleName} />
        </div>
      </div>
    </li>
  );
}

/** How long the invitation stays live, from its last payment. */
function LiveUntil({ until, days }: { until: string; days: number }) {
  const date = new Date(until).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" });
  if (days <= 0) return <p className="mt-1 text-xs font-medium text-destructive">Ended on {date}. Renew to bring it back for guests.</p>;
  return (
    <p className={days <= 14 ? "mt-1 text-xs font-medium text-accent" : "mt-1 text-xs text-muted-foreground"}>
      Live until {date} · {days} day{days === 1 ? "" : "s"} left
    </p>
  );
}
