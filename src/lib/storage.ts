import browser from "webextension-polyfill";
import { DEFAULT_SETTINGS, type Settings } from "./messaging.ts";

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<Settings> {
  const stored = await browser.storage.sync.get(SETTINGS_KEY);
  const raw = stored[SETTINGS_KEY] as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await browser.storage.sync.set({ [SETTINGS_KEY]: next });
  return next;
}

export function onSettingsChanged(handler: (s: Settings) => void): () => void {
  const listener = (
    changes: Record<string, browser.Storage.StorageChange>,
    area: string,
  ) => {
    if (area !== "sync" || !(SETTINGS_KEY in changes)) return;
    const raw = changes[SETTINGS_KEY]?.newValue as Partial<Settings> | undefined;
    handler({ ...DEFAULT_SETTINGS, ...(raw ?? {}) });
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
