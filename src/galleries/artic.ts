import { looksLikePainting } from "./filter.ts";
import type { Artwork, GalleryAdapter } from "./types.ts";
import { GalleryFetchError } from "./types.ts";

const BASE = "https://api.artic.edu/api/v1";
const IIIF = "https://www.artic.edu/iiif/2";

interface ArticSearchResponse {
  data: Array<{
    id: number;
    title: string;
    artist_display?: string;
    date_display?: string;
    image_id?: string;
    credit_line?: string;
    artwork_type_title?: string;
    medium_display?: string;
    classification_title?: string;
    department_title?: string;
    thumbnail?: { width?: number; height?: number };
  }>;
  pagination: { total_pages: number };
}

export const articAdapter: GalleryAdapter = {
  id: "artic",
  displayName: "Art Institute of Chicago",

  async fetchRandomArtwork(signal) {
    const fields = [
      "id",
      "title",
      "artist_display",
      "date_display",
      "image_id",
      "credit_line",
      "artwork_type_title",
      "medium_display",
      "classification_title",
      "department_title",
      "thumbnail",
    ].join(",");

    const filters = [
      "query[bool][must][0][term][is_public_domain]=true",
      "query[bool][must][1][match][classification_title]=painting",
      "query[bool][must][2][range][date_start][gte]=1300",
      "query[bool][must][3][range][date_end][lte]=1920",
      "query[bool][must][4][match][department_title]=Painting%20and%20Sculpture%20of%20Europe",
    ].join("&");

    const probe = await fetchJson<ArticSearchResponse>(
      `${BASE}/artworks/search?${filters}&fields=${fields}&limit=1`,
      signal,
    );
    const totalPages = Math.min(probe.pagination.total_pages, 500);
    const page = Math.max(1, Math.floor(Math.random() * totalPages) + 1);

    const res = await fetchJson<ArticSearchResponse>(
      `${BASE}/artworks/search?${filters}&fields=${fields}&limit=20&page=${page}`,
      signal,
    );

    const withImages = res.data.filter(
      (a) =>
        a.image_id &&
        looksLikePainting(
          a.artwork_type_title,
          a.medium_display,
          a.classification_title,
          a.title,
        ),
    );
    if (withImages.length === 0) {
      throw new GalleryFetchError(
        "No paintings with images on page",
        "artic",
      );
    }
    const pick = withImages[Math.floor(Math.random() * withImages.length)]!;

    return {
      id: String(pick.id),
      source: "artic",
      title: pick.title ?? "Untitled",
      artist: pick.artist_display ?? "Unknown",
      date: pick.date_display ?? "",
      imageUrl: `${IIIF}/${pick.image_id}/full/843,/0/default.jpg`,
      thumbnailUrl: `${IIIF}/${pick.image_id}/full/400,/0/default.jpg`,
      creditLine: pick.credit_line,
      sourceUrl: `https://www.artic.edu/artworks/${pick.id}`,
      width: pick.thumbnail?.width,
      height: pick.thumbnail?.height,
    } satisfies Artwork;
  },
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new GalleryFetchError(
      `Art Institute of Chicago returned ${res.status}`,
      "artic",
      res.status,
    );
  }
  return (await res.json()) as T;
}
