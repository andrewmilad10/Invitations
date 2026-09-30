"use client";
/* eslint-disable @next/next/no-img-element -- editor thumbnails of the user's own uploads */

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Music2, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BundleMedia } from "@/core/wedding/bundle";
import { publicMediaUrl } from "@/features/media/urls";
import { deleteMedia, reorderGallery, updateMediaAlt, updateSettings } from "../actions";
import { addMedia, removeMedia, reorderMedia, setMediaAlt, setSettings } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { MEDIA_LIMITS } from "../schemas";
import { uploadMedia } from "../upload";
import { PanelHeader } from "./panel-header";

function useMediaActions() {
  const { weddingId, update, save } = useEditor();
  return {
    async upload(purpose: "hero" | "gallery" | "music", files: File[]) {
      for (const file of files) {
        const result = await uploadMedia(weddingId, purpose, file);
        if (!result.ok) {
          toast.error(`${file.name}: ${result.error}`);
          continue;
        }
        update((b) => addMedia(b, result.media));
      }
    },
    async remove(media: BundleMedia) {
      update((b) => removeMedia(b, media.id));
      const result = await deleteMedia(weddingId, media.id);
      if (!result.ok) {
        toast.error(result.error);
        update((b) => addMedia(b, media));
      }
    },
    alt(media: BundleMedia, alt: string) {
      update((b) => setMediaAlt(b, media.id, alt));
      save(`alt:${media.id}`, () => updateMediaAlt(weddingId, media.id, alt));
    },
  };
}

function FilePicker({
  accept,
  multiple,
  disabled,
  onFiles,
  children,
}: {
  accept: readonly string[];
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => Promise<void>;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      await onFiles(files);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <input ref={input} type="file" accept={accept.join(",")} multiple={multiple} className="sr-only" tabIndex={-1} onChange={onChange} />
      <Button type="button" variant="outline" disabled={disabled || busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        {busy ? "Uploading…" : children}
      </Button>
    </>
  );
}

export function HeroImageField() {
  const { bundle, canEdit } = useEditor();
  const actions = useMediaActions();
  const hero = bundle.media.find((m) => m.purpose === "hero");

  return (
    <div className="grid gap-3">
      <Label>Hero photo</Label>
      {hero ? (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          <img src={publicMediaUrl(hero.storage_path)} alt={hero.alt_text} className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : (
        <div className="grid aspect-[16/9] place-items-center rounded-lg border border-dashed bg-card text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ImagePlus className="size-4" /> No photo yet — the template&apos;s colors are used instead.
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <FilePicker accept={MEDIA_LIMITS.imageTypes} disabled={!canEdit} onFiles={(files) => actions.upload("hero", files.slice(0, 1))}>
          <Upload /> {hero ? "Replace photo" : "Upload photo"}
        </FilePicker>
        {hero && canEdit ? (
          <Button type="button" variant="ghost" onClick={() => actions.remove(hero)}>
            <Trash2 /> Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Landscape works best. JPG, PNG, WebP or AVIF up to 10 MB.</p>
    </div>
  );
}

export function GalleryManager() {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const actions = useMediaActions();
  const photos = bundle.media.filter((m) => m.purpose === "gallery").sort((a, b) => a.sort_order - b.sort_order);
  const remaining = MEDIA_LIMITS.galleryMax - photos.length;

  function move(index: number, delta: number) {
    const ids = photos.map((p) => p.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + delta, 0, id);
    update((b) => reorderMedia(b, ids));
    save("gallery-order", () => reorderGallery(weddingId, ids));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label>
          Photos <span className="text-muted-foreground">({photos.length}/{MEDIA_LIMITS.galleryMax})</span>
        </Label>
        <FilePicker
          accept={MEDIA_LIMITS.imageTypes}
          multiple
          disabled={!canEdit || remaining <= 0}
          onFiles={async (files) => {
            if (files.length > remaining) toast.warning(`Only the first ${remaining} photos were added (limit ${MEDIA_LIMITS.galleryMax}).`);
            await actions.upload("gallery", files.slice(0, remaining));
          }}
        >
          <Upload /> Add photos
        </FilePicker>
      </div>
      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          Add a few photos — the gallery section appears once there is at least one.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <li key={photo.id} className="overflow-hidden rounded-lg border bg-card">
              <img src={publicMediaUrl(photo.storage_path)} alt={photo.alt_text} className="aspect-[4/3] w-full object-cover" />
              <div className="grid gap-2 p-3">
                <Input aria-label="Photo description (for screen readers)" placeholder="Describe this photo" value={photo.alt_text} maxLength={300} disabled={!canEdit} onChange={(e) => actions.alt(photo, e.target.value)} />
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" aria-label="Move earlier" disabled={!canEdit || index === 0} onClick={() => move(index, -1)}>
                      <ArrowLeft className="rtl:rotate-180" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label="Move later" disabled={!canEdit || index === photos.length - 1} onClick={() => move(index, 1)}>
                      <ArrowRight className="rtl:rotate-180" />
                    </Button>
                  </div>
                  <Button type="button" size="icon" variant="ghost" aria-label="Remove photo" disabled={!canEdit} onClick={() => actions.remove(photo)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MusicPanel() {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const actions = useMediaActions();
  const track = bundle.media.find((m) => m.purpose === "music");
  const s = bundle.settings;

  function toggle(enabled: boolean) {
    update((b) => setSettings(b, { music_enabled: enabled }));
    save("settings", () => updateSettings(weddingId, { locale: s.locale as "en" | "ar", timezone: s.timezone, visibility: s.visibility, musicEnabled: enabled }), 0);
  }

  return (
    <div className="grid gap-6">
      <PanelHeader title="Music" description="Plays after guests open the invitation. Guests can pause it at any time." />
      <div className="flex items-center gap-3">
        <Switch id="music-enabled" checked={s.music_enabled} disabled={!canEdit || !track} onCheckedChange={toggle} />
        <Label htmlFor="music-enabled">Play music on the invitation</Label>
      </div>
      {track ? (
        <div className="grid gap-3 rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 text-sm">
            <Music2 className="size-4" /> {track.storage_path.split("/").pop()}
          </p>
          <audio controls preload="none" src={publicMediaUrl(track.storage_path)} className="w-full" />
          {canEdit ? (
            <Button type="button" variant="ghost" className="justify-self-start" onClick={() => actions.remove(track)}>
              <Trash2 /> Remove track
            </Button>
          ) : null}
        </div>
      ) : null}
      <FilePicker accept={MEDIA_LIMITS.audioTypes} disabled={!canEdit} onFiles={(files) => actions.upload("music", files.slice(0, 1))}>
        <Upload /> {track ? "Replace track" : "Upload a track"}
      </FilePicker>
      <p className="text-xs text-muted-foreground">Only upload music you have the right to use. MP3, M4A, AAC, OGG or WAV up to 15 MB.</p>
    </div>
  );
}
