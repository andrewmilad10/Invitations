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

/** Longest side of a stored photo: sharp on any phone or laptop screen. */
const MAX_SIDE = 2560;

/**
 * Redraws a photo into a brand-new image file. Only the pixels survive:
 * hidden data (the phone's GPS location, camera details, anything appended
 * to the file) is left behind, and very large photos are scaled down.
 * Returns null when the file can't be opened as an image.
 */
export async function cleanImage(file: File): Promise<File | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) {
    bitmap.close();
    return null;
  }
  g.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const encode = (type: string, quality: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // WebP keeps transparency and is small; browsers that can't write it give JPEG (on white).
  let blob = await encode("image/webp", 0.88);
  if (!blob || blob.type !== "image/webp") {
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    blob = await encode("image/jpeg", 0.9);
  }
  if (!blob) return null;
  const name = file.name.replace(/\.[^.]+$/, "") + (blob.type === "image/webp" ? ".webp" : ".jpg");
  return new File([blob], name, { type: blob.type });
}

/** Uploads to weddings/{id}/{purpose}/{uuid}.{ext} and records it in `media`. */
export async function uploadMedia(weddingId: string, purpose: Purpose, original: File): Promise<UploadResult> {
  const invalid = validateFile(original, purpose);
  if (invalid) return { ok: false, error: invalid };
  let file = original;
  if (purpose !== "music") {
    const clean = await cleanImage(original);
    if (!clean) return { ok: false, error: "That isn't a photo we can open. Please choose a JPG, PNG, WebP or AVIF image." };
    file = clean;
  }

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
