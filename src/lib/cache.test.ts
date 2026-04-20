import { test } from "node:test";
import assert from "node:assert/strict";
import { ArtworkCache } from "./cache.ts";
import type { Artwork } from "../galleries/types.ts";

function makeArtwork(id: string, width?: number, height?: number): Artwork {
  return {
    id,
    source: "artic",
    title: `Artwork ${id}`,
    artist: "Test",
    date: "2024",
    imageUrl: `https://example.com/${id}.jpg`,
    sourceUrl: `https://example.com/${id}`,
    width,
    height,
  };
}

test("picks closest aspect match for banner slots", () => {
  const cache = new ArtworkCache();
  cache.put(makeArtwork("portrait", 1000, 2000));
  cache.put(makeArtwork("square", 1000, 1000));
  cache.put(makeArtwork("landscape", 2000, 1000));

  const pick = cache.takeMatching(6); // extreme banner
  assert.equal(pick?.id, "landscape");
});

test("picks closest aspect match for portrait slots", () => {
  const cache = new ArtworkCache();
  cache.put(makeArtwork("wide", 3000, 1000));
  cache.put(makeArtwork("tall", 1000, 3000));
  cache.put(makeArtwork("square", 1000, 1000));

  const pick = cache.takeMatching(0.4);
  assert.equal(pick?.id, "tall");
});

test("falls back to any artwork when none have dimensions", () => {
  const cache = new ArtworkCache();
  cache.put(makeArtwork("a"));
  const pick = cache.takeMatching(1);
  assert.equal(pick?.id, "a");
});

test("clear empties the cache", () => {
  const cache = new ArtworkCache();
  cache.put(makeArtwork("a", 100, 100));
  cache.clear();
  assert.equal(cache.size, 0);
  assert.equal(cache.takeMatching(1), null);
});
