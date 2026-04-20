import type { Artwork } from "../galleries/types.ts";

const TTL_MS = 1000 * 60 * 60 * 6;
const MAX_ENTRIES = 80;

interface CacheEntry {
  artwork: Artwork;
  insertedAt: number;
  aspect: number | undefined;
}

export class ArtworkCache {
  private entries: CacheEntry[] = [];

  put(artwork: Artwork): void {
    const aspect =
      artwork.width && artwork.height
        ? artwork.width / artwork.height
        : undefined;
    this.entries.push({ artwork, insertedAt: Date.now(), aspect });
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - MAX_ENTRIES);
    }
  }

  takeMatching(targetAspect: number | undefined): Artwork | null {
    const now = Date.now();
    this.entries = this.entries.filter((e) => now - e.insertedAt < TTL_MS);

    if (targetAspect !== undefined && this.entries.length > 0) {
      const withAspect = this.entries.filter((e) => e.aspect !== undefined);
      if (withAspect.length > 0) {
        const targetLog = Math.log(targetAspect);
        let best = withAspect[0]!;
        let bestDist = Math.abs(Math.log(best.aspect!) - targetLog);
        for (const entry of withAspect) {
          const dist = Math.abs(Math.log(entry.aspect!) - targetLog);
          if (dist < bestDist) {
            best = entry;
            bestDist = dist;
          }
        }
        this.entries.splice(this.entries.indexOf(best), 1);
        return best.artwork;
      }
    }

    const entry = this.entries.shift();
    return entry?.artwork ?? null;
  }

  clear(): void {
    this.entries = [];
  }

  get size(): number {
    return this.entries.length;
  }
}
