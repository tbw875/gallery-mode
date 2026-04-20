import { looksLikePainting } from "./filter.ts";
import type { Artwork, GalleryAdapter } from "./types.ts";
import { GalleryFetchError } from "./types.ts";

const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const EUROPEAN_PAINTINGS_DEPT = 11;

interface MetObjectsResponse {
  total: number;
  objectIDs: number[] | null;
}

interface MetObjectResponse {
  objectID: number;
  title: string;
  artistDisplayName?: string;
  objectDate?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  creditLine?: string;
  objectURL?: string;
  isPublicDomain?: boolean;
  classification?: string;
  medium?: string;
}

function isAcceptablePainting(obj: MetObjectResponse): boolean {
  if (!looksLikePainting(obj.classification, obj.medium, obj.title)) return false;
  const cls = (obj.classification ?? "").toLowerCase();
  return cls.includes("painting");
}

async function probeDimensions(
  url: string,
  signal?: AbortSignal,
): Promise<{ width: number; height: number } | undefined> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return undefined;
  }
}

export const metAdapter: GalleryAdapter = {
  id: "met",
  displayName: "The Metropolitan Museum of Art",

  async fetchRandomArtwork(signal) {
    const list = await fetchJson<MetObjectsResponse>(
      `${BASE}/search?hasImages=true&medium=Paintings&dateBegin=1300&dateEnd=1920&departmentId=${EUROPEAN_PAINTINGS_DEPT}&q=*`,
      signal,
    );
    const ids = list.objectIDs;
    if (!ids || ids.length === 0) {
      throw new GalleryFetchError("Empty objectIDs from Met", "met");
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const id = ids[Math.floor(Math.random() * ids.length)]!;
      const obj = await fetchJson<MetObjectResponse>(
        `${BASE}/objects/${id}`,
        signal,
      );
      if (obj.primaryImage && obj.isPublicDomain && isAcceptablePainting(obj)) {
        const probeUrl = obj.primaryImageSmall ?? obj.primaryImage;
        const dims = await probeDimensions(probeUrl, signal);
        return {
          id: String(obj.objectID),
          source: "met",
          title: obj.title ?? "Untitled",
          artist: obj.artistDisplayName || "Unknown",
          date: obj.objectDate ?? "",
          imageUrl: obj.primaryImage,
          thumbnailUrl: obj.primaryImageSmall ?? obj.primaryImage,
          creditLine: obj.creditLine,
          sourceUrl:
            obj.objectURL ??
            `https://www.metmuseum.org/art/collection/search/${obj.objectID}`,
          width: dims?.width,
          height: dims?.height,
        } satisfies Artwork;
      }
    }
    throw new GalleryFetchError("No suitable artwork found after retries", "met");
  },
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new GalleryFetchError(
      `Met returned ${res.status}`,
      "met",
      res.status,
    );
  }
  return (await res.json()) as T;
}
