import browser from "webextension-polyfill";
import type { Message, MessageResponse, Settings } from "../lib/messaging.ts";

const showAttribution = document.getElementById(
  "show-attribution",
) as HTMLInputElement;
const blocklist = document.getElementById("blocklist") as HTMLTextAreaElement;
const clearCacheBtn = document.getElementById("clear-cache") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLElement;

async function load(): Promise<void> {
  const res = (await browser.runtime.sendMessage({
    type: "GET_SETTINGS",
  } satisfies Message)) as MessageResponse;
  if (!res.ok || !("settings" in res)) return;
  render(res.settings);
}

function render(settings: Settings): void {
  showAttribution.checked = settings.showAttribution;
  blocklist.value = settings.blocklistedDomains.join("\n");
}

async function save(patch: Partial<Settings>): Promise<void> {
  await browser.runtime.sendMessage({
    type: "SET_SETTINGS",
    settings: patch,
  } satisfies Message);
  status.textContent = "Saved.";
  setTimeout(() => (status.textContent = ""), 1500);
}

showAttribution.addEventListener("change", () => {
  void save({ showAttribution: showAttribution.checked });
});

blocklist.addEventListener("blur", () => {
  const domains = blocklist.value
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);
  void save({ blocklistedDomains: domains });
});

clearCacheBtn.addEventListener("click", async () => {
  await browser.runtime.sendMessage({ type: "CLEAR_CACHE" } satisfies Message);
  status.textContent = "Cache cleared.";
  setTimeout(() => (status.textContent = ""), 1500);
});

void load();
