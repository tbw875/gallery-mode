export interface Artwork {
  id: string;
  source: GallerySource;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl?: string;
  creditLine?: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export type GallerySource = "artic" | "met" | "cleveland";

export interface GalleryAdapter {
  readonly id: GallerySource;
  readonly displayName: string;
  fetchRandomArtwork(signal?: AbortSignal): Promise<Artwork>;
}

export class GalleryFetchError extends Error {
  source: GallerySource;
  status: number | undefined;

  constructor(message: string, source: GallerySource, status?: number) {
    super(message);
    this.name = "GalleryFetchError";
    this.source = source;
    this.status = status;
  }
}
