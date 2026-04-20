import browser from "webextension-polyfill";
import { fetchFromAny } from "../galleries/index.ts";
import { ArtworkCache } from "../lib/cache.ts";
import type { Message, MessageResponse } from "../lib/messaging.ts";
import { getSettings, setSettings } from "../lib/storage.ts";

const cache = new ArtworkCache();
const PREFETCH_THRESHOLD = 10;
const PREFETCH_TARGET = 25;

let prefetchInFlight = 0;

async function ensurePrefetch(): Promise<void> {
  if (cache.size >= PREFETCH_THRESHOLD) return;
  const settings = await getSettings();
  const needed = PREFETCH_TARGET - cache.size - prefetchInFlight;
  for (let i = 0; i < needed; i++) {
    prefetchInFlight++;
    fetchFromAny(settings.sources)
      .then((artwork) => cache.put(artwork))
      .catch((err) => console.warn("[gallery-mode] prefetch failed", err))
      .finally(() => {
        prefetchInFlight--;
      });
  }
}

async function handleMessage(msg: Message): Promise<MessageResponse> {
  try {
    switch (msg.type) {
      case "GET_ARTWORK": {
        const settings = await getSettings();
        if (!settings.enabled) {
          return { ok: false, error: "disabled" };
        }
        const aspect =
          msg.slotWidth > 0 && msg.slotHeight > 0
            ? msg.slotWidth / msg.slotHeight
            : undefined;
        const cached = cache.takeMatching(aspect);
        ensurePrefetch();
        const artwork = cached ?? (await fetchFromAny(settings.sources));
        return { ok: true, artwork };
      }
      case "GET_SETTINGS": {
        return { ok: true, settings: await getSettings() };
      }
      case "SET_SETTINGS": {
        return { ok: true, settings: await setSettings(msg.settings) };
      }
      case "CLEAR_CACHE": {
        cache.clear();
        return { ok: true };
      }
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg as Message).then(sendResponse);
  return true;
});

browser.runtime.onInstalled.addListener(() => {
  ensurePrefetch();
});

browser.runtime.onStartup?.addListener(() => {
  ensurePrefetch();
});
