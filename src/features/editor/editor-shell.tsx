"use client";

import { resolveTemplateManifest } from "@/templates/registry";
import { ArrowLeft, Check, ChevronRight, CloudOff, ExternalLink, Eye, Loader2, Music2, Palette, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isSectionType, SECTION_DEFINITIONS, type SectionType } from "@/core/sections/registry";
import { DownloadCardButton } from "@/features/cards/download-card";
import { LivePreviewFrame } from "@/features/preview/live-preview-frame";
import { setWeddingPublished } from "@/features/weddings/actions";
import { ShareMenu } from "@/features/weddings/components/share-menu";
import { StatusBadge } from "@/features/weddings/components/status-badge";
import { cn } from "@/lib/utils";
import { setStatus } from "./bundle-updates";
import { useEditor, type SaveStatus } from "./editor-context";
import { PublishDialog } from "./publish-dialog";
import { DetailsPanel } from "./panels/details-panel";
import { EventPanel } from "./panels/event-panel";
import { MusicPanel } from "./panels/media";
import { SectionEnabledSwitch } from "./panels/section-fields";
import { SectionStyleControls } from "./panels/section-style";
import { SectionContent, SectionList } from "./panels/sections-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { ThemePanel } from "./panels/theme-panel";

/**
 * Three-column editor:
 *   left   — wedding details and the invitation's sections (order, show/hide)
 *   centre — the live invitation (click a section to select it)
 *   right  — properties of the selection (Content / Style) or Design (theme)
 * On phones: Edit | Preview tabs, with a list → properties drill-down.
 */

type Selection = { kind: "details" } | { kind: "music" } | { kind: "settings" } | { kind: "design" } | { kind: "section"; type: SectionType };

const WEDDING_ITEMS: { kind: "details" | "music" | "settings" | "design"; label: string; icon: ReactNode }[] = [
  { kind: "details", label: "Couple & date", icon: <Users className="size-4" /> },
  { kind: "design", label: "Design", icon: <Palette className="size-4" /> },
  { kind: "music", label: "Music", icon: <Music2 className="size-4" /> },
  { kind: "settings", label: "Settings & sharing", icon: <Settings className="size-4" /> },
];

function parseInitial(panel?: string): Selection {
  if (panel === "settings" || panel === "music" || panel === "details") return { kind: panel };
  if (panel === "theme" || panel === "design") return { kind: "design" };
  const type = panel?.replace(/^section:/, "");
  if (type && isSectionType(type)) return { kind: "section", type };
  return { kind: "details" };
}

const sameSelection = (a: Selection, b: Selection) => a.kind === b.kind && (a.kind !== "section" || (b.kind === "section" && a.type === b.type));

export function EditorShell({ initialPanel }: { initialPanel?: string }) {
  const { bundle, previewUrl } = useEditor();
  const [selection, setSelection] = useState<Selection>(() => parseInitial(initialPanel));
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [publishOpen, setPublishOpen] = useState(false);
  // Phones: show the list until something is chosen.
  const [mobileDrilled, setMobileDrilled] = useState(Boolean(initialPanel));

  const select = (s: Selection) => {
    setSelection(s);
    setMobileDrilled(true);
  };
  const selectedSection = selection.kind === "section" ? selection.type : null;

  return (
    <div className="flex h-dvh flex-col">
      <EditorHeader onPublish={() => setPublishOpen(true)} />
      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onEditLink={() => select({ kind: "settings" })}
      />

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
        {/* LEFT */}
        <nav
          aria-label="Invitation"
          className={cn(
            "min-h-0 w-full shrink-0 overflow-y-auto border-e bg-card px-2 py-4 lg:block lg:w-56 xl:w-60",
            (mobileTab === "preview" || mobileDrilled) && "hidden",
          )}
        >
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Wedding</p>
          <ul className="mb-6 grid gap-0.5">
            {WEDDING_ITEMS.map((item) => {
              const active = sameSelection(selection, { kind: item.kind });
              return (
                <li key={item.kind}>
                  <button
                    type="button"
                    onClick={() => select({ kind: item.kind })}
                    aria-current={active ? "true" : undefined}
                    className={cn("flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm", active ? "bg-secondary font-medium" : "hover:bg-secondary/60")}
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="size-4 text-muted-foreground lg:hidden rtl:rotate-180" />
                  </button>
                </li>
              );
            })}
          </ul>
          <SectionList selected={selectedSection} onSelect={(type) => select({ kind: "section", type })} />
        </nav>

        {/* CENTRE */}
        <LivePreviewFrame
          src={previewUrl}
          bundle={bundle}
          hasOpening={resolveTemplateManifest(bundle.wedding.template_id).features.opening !== "none"}
          focusSection={selectedSection}
          onSectionClick={(section) => isSectionType(section) && select({ kind: "section", type: section })}
          label="Live preview · click a section to edit it"
          className={cn("min-w-0 flex-1", mobileTab === "edit" && "hidden lg:flex")}
        />

        {/* RIGHT */}
        <aside
          aria-label="Properties"
          className={cn(
            "min-h-0 w-full shrink-0 overflow-y-auto border-s bg-card lg:block lg:w-[360px] xl:w-[400px]",
            (mobileTab === "preview" || !mobileDrilled) && "hidden",
          )}
        >
          <button type="button" onClick={() => setMobileDrilled(false)} className="flex items-center gap-1 px-5 pt-4 text-sm text-muted-foreground lg:hidden">
            <ArrowLeft className="size-4 rtl:rotate-180" /> All items
          </button>
          <Inspector key={selection.kind === "section" ? selection.type : selection.kind} selection={selection} />
        </aside>
      </div>
    </div>
  );
}

function Inspector({ selection }: { selection: Selection }) {
  const [tab, setTab] = useState<"content" | "style">("content");

  if (selection.kind !== "section") {
    return (
      <div className="p-6">
        {selection.kind === "details" && <DetailsPanel />}
        {selection.kind === "design" && <ThemePanel />}
        {selection.kind === "music" && <MusicPanel />}
        {selection.kind === "settings" && <SettingsPanel />}
      </div>
    );
  }

  const { type } = selection;
  const def = SECTION_DEFINITIONS[type];
  const isEvent = type === "ceremony" || type === "reception";

  return (
    <div>
      {!isEvent ? (
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div>
            <h2 className="font-serif text-3xl">{def.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>
          </div>
          <SectionEnabledSwitch type={type} />
        </div>
      ) : null}
      <div role="tablist" aria-label="Section properties" className={cn("sticky top-0 z-10 flex gap-6 border-b bg-card px-6", isEvent ? "pt-4" : "mt-5")}>
        {(["content", "style"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("-mb-px border-b-2 py-2.5 text-sm capitalize", tab === t ? "border-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="p-6">
        {tab === "content" ? isEvent ? <EventPanel kind={type} /> : <SectionContent type={type} /> : <SectionStyleControls type={type} />}
      </div>
    </div>
  );
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

function EditorHeader({ onPublish }: { onPublish: () => void }) {
  const { weddingId, bundle, update, status, canEdit, siteUrl } = useEditor();
  const [pending, startTransition] = useTransition();
  const published = bundle.wedding.status === "published";
  const publicUrl = `${siteUrl}/w/${bundle.wedding.slug}`;
  const coupleName = `${bundle.wedding.partner_one_name || "…"} & ${bundle.wedding.partner_two_name || "…"}`;

  function unpublish() {
    if (!window.confirm("Unpublish? The link will stop working until you publish again.")) return;
    startTransition(async () => {
      const result = await setWeddingPublished(weddingId, false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      update((b) => setStatus(b, "draft"));
      toast("Unpublished. The link no longer works.");
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
        <h1 className="truncate font-serif text-xl">{coupleName}</h1>
        <StatusBadge status={bundle.wedding.status} />
        <SaveIndicator status={status} />
      </div>
      <DownloadCardButton bundle={bundle} className="hidden md:inline-flex" />
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <a href={`/preview/${weddingId}`} target="_blank" rel="noopener noreferrer">
          <Eye /> Preview
        </a>
      </Button>
      {published ? (
        <>
          <span className="hidden md:block">
            <ShareMenu url={publicUrl} coupleName={coupleName} published />
          </span>
          <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> View live
            </a>
          </Button>
        </>
      ) : null}
      {canEdit ? (
        <Button size="sm" variant={published ? "outline" : "default"} disabled={pending} onClick={published ? unpublish : onPublish}>
          {pending ? "…" : published ? "Unpublish" : "Publish"}
        </Button>
      ) : null}
    </header>
  );
}
