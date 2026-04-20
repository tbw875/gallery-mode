import { articAdapter } from "./artic.ts";
import { clevelandAdapter } from "./cleveland.ts";
import { metAdapter } from "./met.ts";
import type { Artwork, GalleryAdapter, GallerySource } from "./types.ts";

export const adapters: Record<GallerySource, GalleryAdapter> = {
  artic: articAdapter,
  met: metAdapter,
  cleveland: clevelandAdapter,
};

export const ALL_SOURCES: GallerySource[] = ["artic", "met", "cleveland"];

export async function fetchFromAny(
  enabled: GallerySource[],
  signal?: AbortSignal,
): Promise<Artwork> {
  const pool = enabled.length > 0 ? enabled : ALL_SOURCES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  let lastError: unknown;
  for (const source of shuffled) {
    try {
      return await adapters[source].fetchRandomArtwork(signal);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("All gallery adapters failed");
}

export type { Artwork, GalleryAdapter, GallerySource } from "./types.ts";
