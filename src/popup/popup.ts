import browser from "webextension-polyfill";
import type { GallerySource } from "../galleries/types.ts";
import type { Message, MessageResponse, Settings } from "../lib/messaging.ts";

const enabledInput = document.getElementById("enabled") as HTMLInputElement;
const sourceInputs = document.querySelectorAll<HTMLInputElement>(
  "input[data-source]",
);
const optionsBtn = document.getElementById("options-link") as HTMLButtonElement;

async function load(): Promise<void> {
  const res = (await browser.runtime.sendMessage({
    type: "GET_SETTINGS",
  } satisfies Message)) as MessageResponse;
  if (!res.ok || !("settings" in res)) return;
  render(res.settings);
}

function render(settings: Settings): void {
  enabledInput.checked = settings.enabled;
  sourceInputs.forEach((input) => {
    const src = input.dataset.source as GallerySource;
    input.checked = settings.sources.includes(src);
  });
}

async function save(patch: Partial<Settings>): Promise<void> {
  await browser.runtime.sendMessage({
    type: "SET_SETTINGS",
    settings: patch,
  } satisfies Message);
}

enabledInput.addEventListener("change", () => {
  void save({ enabled: enabledInput.checked });
});

sourceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const sources: GallerySource[] = [];
    sourceInputs.forEach((i) => {
      if (i.checked) sources.push(i.dataset.source as GallerySource);
    });
    void save({ sources });
  });
});

optionsBtn.addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

void load();
