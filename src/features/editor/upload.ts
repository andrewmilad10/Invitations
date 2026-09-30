"use client";

import type { BundleMedia } from "@/core/wedding/bundle";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/features/media/urls";
import { registerMedia } from "./actions";
import { MEDIA_LIMITS } from "./schemas";

type Purpose = "hero" | "gallery" | "music";
export type UploadResult = { ok: true; media: BundleMedia } | { ok: false; error: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

export function validateFile(file: File, purpose: Purpose): string | null {
  const isAudio = purpose === "music";
  const types: readonly string[] = isAudio ? MEDIA_LIMITS.audioTypes : MEDIA_LIMITS.imageTypes;
  if (!types.includes(file.type)) {
    return isAudio ? "Please choose an MP3, M4A, AAC, OGG or WAV file." : "Please choose a JPG, PNG, WebP or AVIF image.";
  }
  const max = isAudio ? MEDIA_LIMITS.audioBytes : MEDIA_LIMITS.imageBytes;
  if (file.size > max) return `That file is too large (max ${Math.round(max / 1024 / 1024)} MB).`;
  return null;
}

async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

/** Uploads to weddings/{id}/{purpose}/{uuid}.{ext} and records it in `media`. */
export async function uploadMedia(weddingId: string, purpose: Purpose, file: File): Promise<UploadResult> {
  const invalid = validateFile(file, purpose);
  if (invalid) return { ok: false, error: invalid };

  const path = `weddings/${weddingId}/${purpose}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { width, height } = purpose === "music" ? { width: null, height: null } : await imageSize(file);

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000", // file names are unique, so they can be cached forever
    upsert: false,
  });
  if (uploadError) return { ok: false, error: "Upload failed. Please check your connection and try again." };

  const altText = purpose === "music" ? "" : file.name.replace(/\.[^.]+$/, "").slice(0, 120);
  const result = await registerMedia(weddingId, { purpose, storagePath: path, width, height, altText });
  if (!result.ok) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    media: {
      id: result.data.id,
      kind: purpose === "music" ? "audio" : "image",
      purpose,
      storage_path: path,
      alt_text: altText,
      width,
      height,
      sort_order: Date.now(), // appended last locally; the server assigned the real order
    },
  };
}
