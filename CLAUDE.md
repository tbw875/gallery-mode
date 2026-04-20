# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A cross-browser (Chrome + Firefox) Manifest V3 WebExtension that detects ad slots in the DOM and replaces them with public-domain artwork fetched from open museum APIs (Art Institute of Chicago, The Metropolitan Museum of Art, Cleveland Museum of Art). None of the APIs require keys.

## Common commands

```bash
npm install
npm run build            # builds both dist/chrome and dist/firefox
npm run build:chrome     # single target
npm run build:firefox    # single target
npm run watch            # esbuild watch for both targets
npm run typecheck        # tsc --noEmit
npm run lint
npm run test             # node --test (node's built-in runner, uses --experimental-strip-types)
node --test --experimental-strip-types src/lib/cache.test.ts   # run a single test file
npm run package          # zip dist/chrome → .zip, dist/firefox → .xpi
```

Load unpacked: Chrome points at `dist/chrome`; Firefox loads `dist/firefox/manifest.json` via `about:debugging`.

## Architecture

Three processes communicate via `browser.runtime.sendMessage`:

1. **Content script** ([src/content/content-script.ts](src/content/content-script.ts)) — runs in every page at `document_idle`. Scans for ad containers using `AD_SELECTORS` ([src/content/ad-selectors.ts](src/content/ad-selectors.ts)), then sets up a `MutationObserver` to catch lazy-loaded ads. For each detected ad it sends a `GET_ARTWORK` message and swaps the node for a `.gallery-mode-frame` div sized to the original bounding rect (to prevent layout shift).
2. **Background service worker** ([src/background/service-worker.ts](src/background/service-worker.ts)) — owns the `ArtworkCache` and routes messages. It prefetches artwork up to `PREFETCH_TARGET` entries whenever the cache drops below `PREFETCH_THRESHOLD` so content-script requests are usually served from memory. The cache is in-memory only — it dies with the service worker (which is expected; Chrome MV3 evicts SWs aggressively).
3. **Popup / options pages** — send `GET_SETTINGS` / `SET_SETTINGS` messages; settings live in `browser.storage.sync` via [src/lib/storage.ts](src/lib/storage.ts).

Message shapes are defined once in [src/lib/messaging.ts](src/lib/messaging.ts) (`Message`, `MessageResponse`, `Settings`, `DEFAULT_SETTINGS`) — change them there and both sides update.

### Gallery adapters

Each museum has its own adapter in [src/galleries/](src/galleries/) implementing `GalleryAdapter` ([src/galleries/types.ts](src/galleries/types.ts)). The adapter contract is a single async method `fetchRandomArtwork(signal?)` that returns an `Artwork`. [src/galleries/index.ts](src/galleries/index.ts) exports `fetchFromAny(enabledSources)` which shuffles the enabled sources and tries each until one succeeds — so a single museum being down never breaks replacement.

To add a new museum: create `src/galleries/<name>.ts` exporting a `GalleryAdapter`, add the source id to the `GallerySource` union, register it in `adapters` and `ALL_SOURCES` in [src/galleries/index.ts](src/galleries/index.ts), and add the host to `host_permissions` in [src/manifest.base.json](src/manifest.base.json). The manifest host allowlist is the hard constraint — forgetting it causes silent `fetch` failures in the service worker.

### Manifest merging

There is **no** single `manifest.json`. The build script reads [src/manifest.base.json](src/manifest.base.json) and shallow-merges the per-target overlay ([src/manifest.chrome.json](src/manifest.chrome.json) or [src/manifest.firefox.json](src/manifest.firefox.json)) into each `dist/<target>/manifest.json`. This is because Chrome wants `background.service_worker` while Firefox wants `background.scripts`, and Firefox needs `browser_specific_settings.gecko`. Keep truly shared keys in `base` and browser-only keys in the overlays.

### Build

[scripts/build.mjs](scripts/build.mjs) is a plain esbuild driver — no framework, no Vite, no CRXJS. It bundles four entry points (background, content, popup, options) to ESM, copies HTML/CSS/icons, then writes the merged manifest. `--watch` enables esbuild's context watch with inline sourcemaps. Targets Chrome 120 / Firefox 128; both support MV3 with module service workers / background scripts.

### Cross-browser API

All extension-API calls go through `webextension-polyfill` (`import browser from "webextension-polyfill"`). Do not mix `chrome.*` and `browser.*` — the polyfill gives promise-based APIs on both platforms.

## Conventions worth knowing

- TypeScript uses `allowImportingTsExtensions` so imports are written with `.ts` (`import { foo } from "./bar.ts"`). esbuild resolves these; don't strip them.
- Content script selectors in [src/content/ad-selectors.ts](src/content/ad-selectors.ts) are the knob to tune when a site's ads slip through. Also check the `MIN_AD_WIDTH` / `MIN_AD_HEIGHT` guard in `isLikelyAd` — it exists to avoid replacing tracking pixels.
- The `data-gallery-mode-replaced` attribute marks handled nodes so the `MutationObserver` doesn't reprocess its own output.
- Tests use node's built-in `node --test` runner with `--experimental-strip-types` (no ts-node, no vitest).
