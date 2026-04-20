import { looksLikePainting } from "./filter.ts";
import type { Artwork, GalleryAdapter } from "./types.ts";
import { GalleryFetchError } from "./types.ts";

const BASE = "https://openaccess-api.clevelandart.org/api";

interface ClevelandResponse {
  info: { total: number };
  data: Array<{
    id: number;
    accession_number?: string;
    title?: string;
    creation_date?: string;
    creators?: Array<{ description?: string }>;
    type?: string;
    technique?: string;
    department?: string;
    images?: {
      web?: { url?: string; width?: string | number; height?: string | number };
      print?: { url?: string };
    };
    url?: string;
    tombstone?: string;
  }>;
}

function parseDim(v: string | number | undefined): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export const clevelandAdapter: GalleryAdapter = {
  id: "cleveland",
  displayName: "Cleveland Museum of Art",

  async fetchRandomArtwork(signal) {
    const filters = [
      "cc0=1",
      "has_image=1",
      "type=Painting",
      "created_after=1300",
      "created_before=1920",
      "department=European%20Painting%20and%20Sculpture",
    ].join("&");

    const probe = await fetchJson<ClevelandResponse>(
      `${BASE}/artworks/?${filters}&limit=1`,
      signal,
    );
    const total = Math.min(probe.info.total, 10000);
    const skip = Math.floor(Math.random() * total);

    const res = await fetchJson<ClevelandResponse>(
      `${BASE}/artworks/?${filters}&limit=1&skip=${skip}`,
      signal,
    );
    const item = res.data[0];
    if (!item || !item.images?.web?.url) {
      throw new GalleryFetchError("No artwork at offset", "cleveland");
    }
    if (!looksLikePainting(item.type, item.technique, item.title)) {
      throw new GalleryFetchError("Not a painting", "cleveland");
    }

    return {
      id: String(item.id),
      source: "cleveland",
      title: item.title ?? "Untitled",
      artist: item.creators?.[0]?.description ?? "Unknown",
      date: item.creation_date ?? "",
      imageUrl: item.images.web.url,
      thumbnailUrl: item.images.web.url,
      creditLine: item.tombstone,
      sourceUrl:
        item.url ??
        `https://www.clevelandart.org/art/${item.accession_number ?? item.id}`,
      width: parseDim(item.images.web.width),
      height: parseDim(item.images.web.height),
    } satisfies Artwork;
  },
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new GalleryFetchError(
      `Cleveland returned ${res.status}`,
      "cleveland",
      res.status,
    );
  }
  return (await res.json()) as T;
}
