"use client";

import { ArrowLeft, Check, CloudOff, ExternalLink, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isSectionType, type SectionType } from "@/core/sections/registry";
import { StatusBadge } from "@/features/weddings/components/status-badge";
import { setWeddingPublished } from "@/features/weddings/actions";
import { cn } from "@/lib/utils";
import { setStatus } from "./bundle-updates";
import { useEditor, type SaveStatus } from "./editor-context";
import { PreviewPane } from "./preview-pane";
import { DetailsPanel } from "./panels/details-panel";
import { EventPanel } from "./panels/event-panel";
import { MusicPanel } from "./panels/media";
import { SectionPanel, SectionsPanel } from "./panels/sections-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { ThemePanel } from "./panels/theme-panel";

type PanelKey = "details" | "ceremony" | "reception" | "theme" | "sections" | "music" | "settings" | `section:${SectionType}`;

const NAV: { key: PanelKey; label: string }[] = [
  { key: "details", label: "Couple & date" },
  { key: "ceremony", label: "Ceremony" },
  { key: "reception", label: "Reception" },
  { key: "section:hero", label: "Hero & photo" },
  { key: "section:story", label: "Our story" },
  { key: "section:gallery", label: "Gallery" },
  { key: "sections", label: "All sections" },
  { key: "theme", label: "Template & style" },
  { key: "music", label: "Music" },
  { key: "settings", label: "Settings & sharing" },
];

export function EditorShell({ initialPanel }: { initialPanel?: string }) {
  const [panel, setPanel] = useState<PanelKey>(() => (NAV.some((n) => n.key === initialPanel) ? (initialPanel as PanelKey) : "details"));
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="flex h-dvh flex-col">
      <EditorHeader />

      {/* Mobile: Edit | Preview tabs */}
      <div className="flex border-b bg-card lg:hidden" role="tablist" aria-label="Editor view">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={cn("flex-1 py-3 text-sm font-medium capitalize", mobileTab === tab ? "border-b-2 border-primary" : "text-muted-foreground")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <nav aria-label="Editor sections" className="hidden w-56 shrink-0 overflow-y-auto border-e bg-card p-3 xl:block">
          <NavList panel={panel} onSelect={setPanel} />
        </nav>

        <div className={cn("min-h-0 w-full overflow-y-auto lg:w-[440px] lg:shrink-0 lg:border-e xl:w-[480px]", mobileTab === "preview" && "hidden lg:block")}>
          <div className="border-b p-3 xl:hidden">
            <label htmlFor="panel-select" className="sr-only">
              Editor section
            </label>
            <select id="panel-select" value={NAV.some((n) => n.key === panel) ? panel : "sections"} onChange={(e) => setPanel(e.target.value as PanelKey)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {NAV.map((n) => (
                <option key={n.key} value={n.key}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div className="p-6">
            <Panel panel={panel} onSelect={setPanel} />
          </div>
        </div>

        <PreviewPane className={cn("min-w-0 flex-1", mobileTab === "edit" && "hidden lg:flex")} />
      </div>
    </div>
  );
}

function NavList({ panel, onSelect }: { panel: PanelKey; onSelect: (p: PanelKey) => void }) {
  return (
    <ul className="grid gap-0.5">
      {NAV.map((n) => (
        <li key={n.key}>
          <button
            type="button"
            onClick={() => onSelect(n.key)}
            aria-current={panel === n.key ? "page" : undefined}
            className={cn("w-full rounded-md px-3 py-2 text-start text-sm hover:bg-secondary", panel === n.key && "bg-secondary font-medium")}
          >
            {n.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Panel({ panel, onSelect }: { panel: PanelKey; onSelect: (p: PanelKey) => void }) {
  switch (panel) {
    case "details":
      return <DetailsPanel />;
    case "ceremony":
    case "reception":
      return <EventPanel key={panel} kind={panel} />;
    case "theme":
      return <ThemePanel />;
    case "sections":
      return <SectionsPanel onEdit={(type) => onSelect(type === "ceremony" || type === "reception" ? type : `section:${type}`)} />;
    case "music":
      return <MusicPanel />;
    case "settings":
      return <SettingsPanel />;
    default: {
      const type = panel.slice("section:".length);
      return isSectionType(type) ? <SectionPanel key={type} type={type} onBack={() => onSelect("sections")} /> : null;
    }
  }
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const content = {
    saving: [<Loader2 key="i" className="size-3.5 animate-spin" />, "Saving…"],
    saved: [<Check key="i" className="size-3.5" />, "All changes saved"],
    error: [<CloudOff key="i" className="size-3.5" />, "Not saved"],
  }[status];
  return (
    <span role="status" className={cn("hidden items-center gap-1.5 text-xs sm:flex", status === "error" ? "text-destructive" : "text-muted-foreground")}>
      {content}
    </span>
  );
}

function EditorHeader() {
  const { weddingId, bundle, update, flush, status, canEdit, siteUrl } = useEditor();
  const [pending, startTransition] = useTransition();
  const published = bundle.wedding.status === "published";
  const publicUrl = `${siteUrl}/w/${bundle.wedding.slug}`;

  function togglePublish() {
    startTransition(async () => {
      await flush(); // publish exactly what the couple sees
      const result = await setWeddingPublished(weddingId, !published);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      update((b) => setStatus(b, published ? "draft" : "published"));
      if (published) toast("Unpublished. The link no longer works.");
      else
        toast.success("Your invitation is live!", {
          description: publicUrl,
          action: { label: "Copy link", onClick: () => void navigator.clipboard?.writeText(publicUrl) },
        });
    });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-3 sm:px-4">
      <Button asChild variant="ghost" size="icon" aria-label="Back to my weddings">
        <Link href="/dashboard">
          <ArrowLeft className="rtl:rotate-180" />
        </Link>
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate font-serif text-xl">
          {bundle.wedding.partner_one_name || "…"} &amp; {bundle.wedding.partner_two_name || "…"}
        </h1>
        <StatusBadge status={bundle.wedding.status} />
        <SaveIndicator status={status} />
      </div>
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <a href={`/preview/${weddingId}`} target="_blank" rel="noopener noreferrer">
          <Eye /> Preview
        </a>
      </Button>
      {published ? (
        <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink /> View live
          </a>
        </Button>
      ) : null}
      {canEdit ? (
        <Button size="sm" variant={published ? "outline" : "default"} disabled={pending} onClick={togglePublish}>
          {pending ? "…" : published ? "Unpublish" : "Publish"}
        </Button>
      ) : null}
    </header>
  );
}
